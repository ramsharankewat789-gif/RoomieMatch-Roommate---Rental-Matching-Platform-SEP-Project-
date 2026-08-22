/**
 * authController.js — Email/password auth + Google OAuth + OTP handlers.
 */
const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");
const { run, get, all } = require("../database/db");
const { createOtp, verifyOtp, canResend } = require("../services/otpService");
const { sendOtpEmail } = require("../services/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helpers ────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function sanitizeUser(user) {
  // Strip sensitive fields before sending to client
  const { password_hash, ...safe } = user;
  // Parse JSON fields stored as strings
  try { safe.hobbies     = JSON.parse(safe.hobbies     || "[]"); } catch { safe.hobbies = []; }
  try { safe.preferences = JSON.parse(safe.preferences || "{}"); } catch { safe.preferences = {}; }
  return safe;
}

// ── Email / Password Registration ─────────────────────────────────────────

async function register(req, res) {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Validate allowed roles
    const allowedRoles = ["user", "tenant", "owner"];
    const assignedRole = allowedRoles.includes(role) ? "user" : "user"; // always 'user' for self-registration

    const existing = await get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId       = "u_" + uuidv4().replace(/-/g, "").substring(0, 16);

    await run(
      `INSERT INTO users (id, name, email, password_hash, role, phone, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [userId, name, email.toLowerCase(), passwordHash, assignedRole, phone || ""]
    );

    const user  = await get("SELECT * FROM users WHERE id = ?", [userId]);
    const token = signToken(userId);

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("[Register]", err.message);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

// ── Email / Password Login ─────────────────────────────────────────────────

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user.id);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("[Login]", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}

// ── Google OAuth — Initiate ────────────────────────────────────────────────

async function googleAuthCallback(req, res) {
  try {
    const { credential } = req.body; // Google One Tap / Sign-In button sends an ID token

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required." });
    }

    // ── Server-side validation — NEVER trust the frontend ─────────────────
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Confirm Google itself says the email is verified
    if (!payload.email_verified) {
      return res.status(401).json({ error: "Google account email is not verified. Please verify your Gmail first." });
    }

    const googleId = payload.sub;    // stable Google identifier
    const email    = payload.email;
    const name     = payload.name || email.split("@")[0];
    const picture  = payload.picture || null;

    // ── Find existing user by Google ID first, then by email ──────────────
    let user = await get("SELECT * FROM users WHERE google_id = ?", [googleId]);
    if (!user) {
      user = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
      if (user) {
        // Link existing email/password account to Google
        await run("UPDATE users SET google_id = ? WHERE id = ?", [googleId, user.id]);
        user = await get("SELECT * FROM users WHERE id = ?", [user.id]);
      }
    }

    // If user is admin, Google auth requires admin role check
    if (user && user.role === "admin") {
      // Generate OTP and send — admin still needs OTP
    }

    // ── Store pending Google auth for OTP step ────────────────────────────
    const pendingId  = uuidv4();
    const expiresAt  = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min window
    const isNewUser  = !user;

    // Cleanup old pending entries for this google_id
    await run("DELETE FROM google_auth_pending WHERE email = ?", [email]);
    await run(
      `INSERT INTO google_auth_pending (id, google_id, email, name, picture_url, email_verified, expires_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [pendingId, googleId, email, name, picture, expiresAt]
    );

    // ── Generate OTP and send to Gmail ────────────────────────────────────
    const userId = user ? user.id : null;
    const otp    = await createOtp(userId, email);
    await sendOtpEmail(email, otp);
    // otp is NOT returned in the response

    return res.json({
      pendingId,
      email,             // returned so frontend can show masked email
      isNewUser,
      message: `Verification code sent to your Gmail.`
    });
  } catch (err) {
    if (err.message && err.message.includes("Token used too late")) {
      return res.status(401).json({ error: "Google sign-in expired. Please try again." });
    }
    console.error("[GoogleAuth]", err.message);
    return res.status(500).json({ error: "Google authentication failed. Please try again." });
  }
}

// ── OTP Verification (Google flow) ────────────────────────────────────────

async function verifyGoogleOtp(req, res) {
  try {
    const { pendingId, otp } = req.body;

    if (!pendingId || !otp) {
      return res.status(400).json({ error: "Pending ID and OTP are required." });
    }

    // Retrieve pending Google auth
    const pending = await get(
      "SELECT * FROM google_auth_pending WHERE id = ? AND expires_at > datetime('now')",
      [pendingId]
    );
    if (!pending) {
      return res.status(400).json({ error: "Google sign-in session expired. Please start again." });
    }

    // Verify OTP
    const result = await verifyOtp(pending.email, otp);
    if (!result.success) {
      return res.status(400).json({ error: result.error, attemptsLeft: result.attemptsLeft });
    }

    // Cleanup pending entry
    await run("DELETE FROM google_auth_pending WHERE id = ?", [pendingId]);

    // Find or create user
    let user = await get("SELECT * FROM users WHERE google_id = ?", [pending.google_id]);
    if (!user) {
      user = await get("SELECT * FROM users WHERE email = ?", [pending.email.toLowerCase()]);
    }

    if (!user) {
      // New user — create account
      const newId = "u_" + uuidv4().replace(/-/g, "").substring(0, 16);
      await run(
        `INSERT INTO users (id, name, email, role, google_id, profile_image, is_verified)
         VALUES (?, ?, ?, 'user', ?, ?, 1)`,
        [newId, pending.name || pending.email, pending.email.toLowerCase(), pending.google_id, pending.picture_url]
      );
      user = await get("SELECT * FROM users WHERE id = ?", [newId]);
    } else {
      // Existing user — link Google ID if not already linked
      if (!user.google_id) {
        await run("UPDATE users SET google_id = ? WHERE id = ?", [pending.google_id, user.id]);
      }
      user = await get("SELECT * FROM users WHERE id = ?", [user.id]);
    }

    const token = signToken(user.id);
    return res.json({ token, user: sanitizeUser(user), isNewUser: result.userId === null });
  } catch (err) {
    console.error("[VerifyGoogleOtp]", err.message);
    return res.status(500).json({ error: "OTP verification failed. Please try again." });
  }
}

// ── OTP Resend ────────────────────────────────────────────────────────────

async function resendOtp(req, res) {
  try {
    const { pendingId } = req.body;

    if (!pendingId) {
      return res.status(400).json({ error: "Pending ID is required." });
    }

    const pending = await get(
      "SELECT * FROM google_auth_pending WHERE id = ? AND expires_at > datetime('now')",
      [pendingId]
    );
    if (!pending) {
      return res.status(400).json({ error: "Session expired. Please sign in with Google again." });
    }

    // Check cooldown
    const { allowed, secondsLeft } = await canResend(pending.email);
    if (!allowed) {
      return res.status(429).json({
        error: `Resend available in ${secondsLeft} seconds.`,
        secondsLeft
      });
    }

    const user   = await get("SELECT id FROM users WHERE email = ?", [pending.email.toLowerCase()]);
    const otp    = await createOtp(user ? user.id : null, pending.email);
    await sendOtpEmail(pending.email, otp);

    return res.json({ message: "Verification code resent." });
  } catch (err) {
    console.error("[ResendOtp]", err.message);
    return res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
}

// ── Get current user (from JWT) ───────────────────────────────────────────

async function getMe(req, res) {
  try {
    const user = await get("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch user." });
  }
}

module.exports = { register, login, googleAuthCallback, verifyGoogleOtp, resendOtp, getMe };
