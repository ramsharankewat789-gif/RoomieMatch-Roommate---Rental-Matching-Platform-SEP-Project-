/**
 * otpService.js — Cryptographically secure OTP generation and verification.
 *
 * Security properties:
 *  - crypto.randomInt (CSPRNG) — not Math.random()
 *  - Stores BCRYPT hash of the OTP — never plaintext
 *  - 5-minute expiration
 *  - Max 5 failed attempts per OTP
 *  - Single-use: verified flag set to 1 after first correct use
 *  - New OTP invalidates all previous unverified OTPs for the same email
 *
 * MySQL changes from SQLite version:
 *  - datetime('now')  →  NOW()
 *  - All date comparisons use MySQL NOW()
 */
const crypto  = require("crypto");
const bcrypt  = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { run, get } = require("../database/db");

const OTP_EXPIRY_MINUTES      = 5;
const MAX_ATTEMPTS            = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/** generateOtp — 6-digit zero-padded string via CSPRNG. */
function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * createOtp — generate, hash and persist an OTP.
 * Returns the plaintext OTP (caller emails it — never stored or returned to client).
 */
async function createOtp(userId, email) {
  // Invalidate all previous pending OTPs for this email
  await run(
    "UPDATE otp_verifications SET verified = -1 WHERE email = ? AND verified = 0",
    [email]
  );

  const otp      = generateOtp();
  const salt     = await bcrypt.genSalt(10);
  const otpHash  = await bcrypt.hash(otp, salt);
  const id       = uuidv4();

  // MySQL: use DATE_ADD(NOW(), INTERVAL 5 MINUTE) for expiry
  await run(
    `INSERT INTO otp_verifications (id, user_id, email, otp_hash, expires_at, attempts, verified)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, 0)`,
    [id, userId || null, email, otpHash, OTP_EXPIRY_MINUTES]
  );

  return otp; // caller sends via email — NEVER returned to API client
}

/**
 * verifyOtp — validate a submitted OTP.
 * Returns { success: true, userId } or { success: false, error, attemptsLeft? }
 */
async function verifyOtp(email, submittedOtp) {
  // Fetch most recent active (non-invalidated) OTP for this email
  const record = await get(
    `SELECT * FROM otp_verifications
     WHERE email = ? AND verified = 0
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  if (!record) {
    return { success: false, error: "No pending verification code found. Please request a new one." };
  }

  // MySQL returns DATETIME as JS Date object — compare with current time
  const expiresAt = record.expires_at instanceof Date
    ? record.expires_at
    : new Date(record.expires_at);

  if (new Date() > expiresAt) {
    await run("UPDATE otp_verifications SET verified = -1 WHERE id = ?", [record.id]);
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  // Check attempt limit before incrementing
  if (record.attempts >= MAX_ATTEMPTS) {
    await run("UPDATE otp_verifications SET verified = -1 WHERE id = ?", [record.id]);
    return { success: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  // Increment attempt counter
  await run(
    "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
    [record.id]
  );

  // Verify hash — bcrypt.compare is timing-safe
  const isMatch = await bcrypt.compare(String(submittedOtp), record.otp_hash);

  if (!isMatch) {
    const attemptsLeft = MAX_ATTEMPTS - (record.attempts + 1);
    if (attemptsLeft <= 0) {
      await run("UPDATE otp_verifications SET verified = -1 WHERE id = ?", [record.id]);
      return { success: false, error: "Too many incorrect attempts. Please request a new code." };
    }
    return { success: false, error: "Invalid verification code.", attemptsLeft };
  }

  // Mark as used
  await run(
    "UPDATE otp_verifications SET verified = 1, verified_at = NOW() WHERE id = ?",
    [record.id]
  );

  return { success: true, userId: record.user_id };
}

/**
 * canResend — checks whether the 60-second cooldown has elapsed.
 * Returns { allowed: boolean, secondsLeft: number }
 */
async function canResend(email) {
  const record = await get(
    `SELECT created_at FROM otp_verifications
     WHERE email = ? AND verified = 0
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  if (!record) return { allowed: true, secondsLeft: 0 };

  const createdAt = record.created_at instanceof Date
    ? record.created_at
    : new Date(record.created_at);

  const elapsed     = (Date.now() - createdAt.getTime()) / 1000;
  const secondsLeft = Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
  return { allowed: secondsLeft === 0, secondsLeft };
}

module.exports = { createOtp, verifyOtp, canResend };
