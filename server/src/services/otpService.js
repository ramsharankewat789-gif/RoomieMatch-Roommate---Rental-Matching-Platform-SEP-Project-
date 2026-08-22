/**
 * otpService.js — Cryptographically secure OTP generation and verification.
 *
 * Security properties:
 *  - Uses crypto.randomInt (CSPRNG) — not Math.random()
 *  - Stores BCRYPT hash — not plaintext
 *  - 5-minute expiration
 *  - Max 5 attempts per OTP
 *  - Single-use: marked verified after first correct use
 *  - New OTP invalidates all previous OTPs for the same email
 */
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * generateOtp — creates a 6-digit numeric OTP string (zero-padded).
 */
function generateOtp() {
  // crypto.randomInt(min, max) is cryptographically secure
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

/**
 * createOtp — generates an OTP, hashes it, stores in DB.
 * Returns the PLAINTEXT otp (to be emailed — never stored or returned to client).
 *
 * @param {string|null} userId   null for Google pending (user not yet created)
 * @param {string}      email
 * @returns {string} plaintext OTP
 */
async function createOtp(userId, email) {
  // Invalidate all previous unverified OTPs for this email
  await run(
    "UPDATE otp_verifications SET verified = -1 WHERE email = ? AND verified = 0",
    [email]
  );

  const otp     = generateOtp();
  const salt    = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  const id         = uuidv4();
  const expiresAt  = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  await run(
    `INSERT INTO otp_verifications (id, user_id, email, otp_hash, expires_at, attempts, verified)
     VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [id, userId || null, email, otpHash, expiresAt]
  );

  // Return plaintext — caller must send it via email and NEVER expose it elsewhere
  return otp;
}

/**
 * verifyOtp — validates the submitted OTP.
 * Returns { success: true } or { success: false, error: string, attemptsLeft?: number }
 *
 * @param {string} email
 * @param {string} submittedOtp
 */
async function verifyOtp(email, submittedOtp) {
  // Get the most recent active OTP for this email
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

  // Check expiration
  if (new Date() > new Date(record.expires_at)) {
    await run("UPDATE otp_verifications SET verified = -1 WHERE id = ?", [record.id]);
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  // Check attempt limit
  if (record.attempts >= MAX_ATTEMPTS) {
    await run("UPDATE otp_verifications SET verified = -1 WHERE id = ?", [record.id]);
    return { success: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  // Increment attempts
  await run("UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?", [record.id]);

  // Verify hash
  const isMatch = await bcrypt.compare(String(submittedOtp), record.otp_hash);
  if (!isMatch) {
    const attemptsLeft = MAX_ATTEMPTS - (record.attempts + 1);
    if (attemptsLeft <= 0) {
      await run("UPDATE otp_verifications SET verified = -1 WHERE id = ?", [record.id]);
      return { success: false, error: "Too many incorrect attempts. Please request a new code." };
    }
    return {
      success: false,
      error: "Invalid verification code.",
      attemptsLeft
    };
  }

  // Mark as used
  await run(
    "UPDATE otp_verifications SET verified = 1, verified_at = datetime('now') WHERE id = ?",
    [record.id]
  );

  return { success: true, userId: record.user_id };
}

/**
 * canResend — checks if the 60-second cooldown has passed.
 * Returns { allowed: boolean, secondsLeft: number }
 */
async function canResend(email) {
  const record = await get(
    `SELECT created_at FROM otp_verifications
     WHERE email = ? AND verified = 0
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  );

  if (!record) return { allowed: true, secondsLeft: 0 };

  const elapsed = (Date.now() - new Date(record.created_at).getTime()) / 1000;
  const secondsLeft = Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
  return { allowed: secondsLeft === 0, secondsLeft };
}

module.exports = { createOtp, verifyOtp, canResend };
