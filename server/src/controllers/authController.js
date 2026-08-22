/**
 * authController.js — Email/password auth + Google OAuth + OTP handlers.
 */
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");
const { run, get, all, execute } = require("../database/db");
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

/**
 * sanitizeUser — strips sensitive fields and enriches with preferences/hobbies.
 * MySQL returns DATETIME as JS Date objects — convert to ISO strings for JSON responses.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const {
    password_hash,
    ...safe
  } = user;

  // Convert Date objects to ISO strings
  if (safe.created_at instanceof Date) safe.created_at = safe.created_at.toISOString();
  if (safe.updated_at instanceof Date) safe.updated_at = safe.updated_at.toISOString();

  return safe;
}

/**
 * buildUserResponse — fetches the full user + preferences + hobbies
 * from their respective normalized tables and returns a combined object.
 */
async function buildUserResponse(userId) {
  const user = await get("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) return null;

  // Fetch preferences
  const prefs = await get(
    "SELECT smoke, pet, cleanliness, sleep_schedule, social_life, cooking FROM user_preferences WHERE user_id = ?",
    [userId]
  );

  // Fetch hobbies
  const hobbyRows = await all(
    "SELECT hobby FROM user_hobbies WHERE user_id = ? ORDER BY id ASC",
    [userId]
  );

  const safe = sanitizeUser(user);
  safe.preferences = prefs
    ? {
        smoke:   prefs.smoke,
        pet:     prefs.pet,
        clean:   prefs.cleanliness,
        sleep:   prefs.sleep_schedule,
        social:  prefs.social_life,
        cooking: prefs.cooking
      }
    : {};
  safe.hobbies = hobbyRows.map(r => r.hobby);

  return safe;
}

// ── Email / Password Registration ─────────────────────────────────────────

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const emailLower = email.toLowerCase().trim();

    // Check duplicate
    const existing = await get("SELECT id FROM users WHERE email = ?", [emailLower]);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId       = uuidv4();

    await run(
      `INSERT INTO users (id, name, email, password_hash, role, phone, is_verified, email_verified)
       VALUES (?, ?, ?, ?, 'user', ?, 0, 0)`,
      [userId, name.trim(), emailLower, passwordHash, phone ? phone.trim() : null]
    );

    // Create default preferences row
    await run(
      "INSERT IGNORE INTO user_preferences (user_id) VALUES (?)",
      [userId]
    );

    const user  = await buildUserResponse(userId);
    const token = signToken(userId);

    return res.status(201).json({ token, user });
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

    const user = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const fullUser = await buildUserResponse(user.id);
    const token    = signToken(user.id);

    return res.json({ token, user: fullUser });
  } catch (err) {
    console.error("[Login]", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}

// ── Google OAuth ───────────────────────────────────────────────────────────

async function googleAuthCallback(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required." });
    }

    // Server-side validation — NEVER trust frontend-supplied email
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({
        error: "Google account email is not verified. Please verify your Gmail first."
      });
    }

    const googleId = payload.sub;   // stable, permanent Google identifier
    const email    = payload.email;
    const name     = payload.name || email.split("@")[0];
    const picture  = payload.picture || null;

    // Find existing user — prefer google_id match, then email match
    let user = await get("SELECT id, role FROM users WHERE google_id = ?", [googleId]);
    if (!user) {
      user = await get("SELECT id, role FROM users WHERE email = ?", [email.toLowerCase()]);
      if (user) {
        // Link Google ID to existing email/password account
        await run("UPDATE users SET google_id = ? WHERE id = ?", [googleId, user.id]);
      }
    }

    // Store pending Google auth session (cleaned up after OTP verification)
    const pendingId = uuidv4();

    // MySQL: ON DUPLICATE KEY UPDATE to handle repeated sign-in attempts
    await run(
      `INSERT INTO google_auth_pending (id, google_id, email, name, picture_url, email_verified, expires_at)
       VALUES (?, ?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
       ON DUPLICATE KEY UPDATE
         id = VALUES(id),
         name = VALUES(name),
         picture_url = VALUES(picture_url),
         expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)`,
      [pendingId, googleId, email, name, picture]
    );

    // Generate OTP and send to Google-verified Gmail address
    const userId = user ? user.id : null;
    const otp    = await createOtp(userId, email);
    await sendOtpEmail(email, otp);
    // otp is NOT returned in response

    return res.json({
      pendingId,
      email,       // returned so frontend can show masked version
      isNewUser: !user,
      message: "Verification code sent to your Gmail."
    });
  } catch (err) {
    if (err.message?.includes("Token used too late")) {
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

    // MySQL: compare DATETIME column with NOW()
    const pending = await get(
      "SELECT * FROM google_auth_pending WHERE id = ? AND expires_at > NOW()",
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

    // Clean up pending session
    await run("DELETE FROM google_auth_pending WHERE id = ?", [pendingId]);

    // Find or create user
    let user = await get("SELECT id FROM users WHERE google_id = ?", [pending.google_id]);
    if (!user) {
      user = await get("SELECT id FROM users WHERE email = ?", [pending.email.toLowerCase()]);
    }

    let isNewUser = false;
    if (!user) {
      // New account — created via Google
      isNewUser     = true;
      const newId   = uuidv4();
      await run(
        `INSERT INTO users (id, name, email, role, google_id, profile_image, is_verified, email_verified)
         VALUES (?, ?, ?, 'user', ?, ?, 1, 1)`,
        [newId, pending.name || pending.email, pending.email.toLowerCase(), pending.google_id, pending.picture_url]
      );
      // Create default preferences
      await run("INSERT IGNORE INTO user_preferences (user_id) VALUES (?)", [newId]);
      user = { id: newId };
    } else {
      // Link google_id if not already linked
      await run(
        "UPDATE users SET google_id = COALESCE(google_id, ?), email_verified = 1 WHERE id = ?",
        [pending.google_id, user.id]
      );
    }

    const fullUser = await buildUserResponse(user.id);
    const token    = signToken(user.id);

    return res.json({ token, user: fullUser, isNewUser });
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
      "SELECT * FROM google_auth_pending WHERE id = ? AND expires_at > NOW()",
      [pendingId]
    );
    if (!pending) {
      return res.status(400).json({ error: "Session expired. Please sign in with Google again." });
    }

    // Enforce resend cooldown
    const { allowed, secondsLeft } = await canResend(pending.email);
    if (!allowed) {
      return res.status(429).json({
        error: `Resend available in ${secondsLeft} seconds.`,
        secondsLeft
      });
    }

    const user = await get("SELECT id FROM users WHERE email = ?", [pending.email.toLowerCase()]);
    const otp  = await createOtp(user ? user.id : null, pending.email);
    await sendOtpEmail(pending.email, otp);

    return res.json({ message: "Verification code resent." });
  } catch (err) {
    console.error("[ResendOtp]", err.message);
    return res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
}

// ── Get current authenticated user ───────────────────────────────────────

async function getMe(req, res) {
  try {
    const user = await buildUserResponse(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user });
  } catch (err) {
    console.error("[GetMe]", err.message);
    return res.status(500).json({ error: "Failed to fetch user." });
  }
}

module.exports = {
  register,
  login,
  googleAuthCallback,
  verifyGoogleOtp,
  resendOtp,
  getMe
};
