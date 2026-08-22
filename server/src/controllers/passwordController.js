/**
 * passwordController.js — Forgot password + reset password flow.
 *
 * Flow:
 *   1. POST /api/auth/forgot-password   { email }
 *      → generates a secure token, stores its hash, emails a reset link
 *   2. POST /api/auth/reset-password    { token, newPassword }
 *      → validates token, updates password_hash, invalidates token
 *   3. PATCH /api/auth/change-password  { currentPassword, newPassword }  (JWT required)
 *      → changes password for authenticated user
 *
 * Security:
 *   - Only the bcrypt hash of the reset token is stored — plaintext is emailed only
 *   - Token expires in 1 hour
 *   - Token is single-use
 *   - Response is always identical whether email exists or not (prevents enumeration)
 */
const crypto  = require("crypto");
const bcrypt  = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { run, get } = require("../database/db");
const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
  });
}

// ── POST /api/auth/forgot-password ─────────────────────────────────────────
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Always return 200 regardless of whether the email exists (prevents enumeration)
    const user = await get(
      "SELECT id, name, email FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (user) {
      // Generate a cryptographically secure random token
      const rawToken   = crypto.randomBytes(32).toString("hex");
      const salt       = await bcrypt.genSalt(10);
      const tokenHash  = await bcrypt.hash(rawToken, salt);
      const tokenId    = uuidv4();

      // Invalidate any previous unused tokens for this user
      await run(
        "UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0",
        [user.id]
      );

      // Store hashed token — expires in 1 hour
      await run(
        `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), 0)`,
        [tokenId, user.id, tokenHash]
      );

      // Build reset URL pointing to the frontend page
      const clientUrl  = process.env.CLIENT_URL || "http://localhost:5173";
      const resetUrl   = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      // Send email — rawToken is NOT logged
      try {
        const transporter = getTransporter();
        await transporter.sendMail({
          from:    process.env.EMAIL_FROM || '"RoomieMatch" <no-reply@roomiematch.com>',
          to:      user.email,
          subject: "RoomieMatch — Reset Your Password",
          text: `Hi ${user.name},\n\nYou requested a password reset for your RoomieMatch account.\n\nClick the link below to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— The RoomieMatch Team`,
          html: `
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;background:#f6fafe;margin:0;padding:0}
.c{max-width:480px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #c2c7d0;overflow:hidden}
.h{background:#325e8c;padding:24px 32px;text-align:center}
.h h1{color:#fff;margin:0;font-size:20px}
.b{padding:32px}
.btn{display:inline-block;background:#325e8c;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;margin:20px 0}
.f{background:#f0f4f8;padding:16px 32px;text-align:center;font-size:11px;color:#727780}
</style></head><body>
<div class="c">
  <div class="h"><h1>🏠 RoomieMatch</h1></div>
  <div class="b">
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>You requested a password reset. Click the button below — the link is valid for <strong>1 hour</strong>.</p>
    <div style="text-align:center"><a class="btn" href="${resetUrl}">Reset Password</a></div>
    <p style="font-size:12px;color:#727780">If you did not request this, ignore this email. Your password will not change.</p>
  </div>
  <div class="f">© ${new Date().getFullYear()} RoomieMatch. All rights reserved.</div>
</div></body></html>`
        });
      } catch (emailErr) {
        // Email failure is non-fatal — log it server-side, don't expose to client
        console.error("[ForgotPassword] Email send failed:", emailErr.message);
      }
    }

    // Always return the same response
    return res.json({
      message: "If that email is registered, you will receive password reset instructions shortly."
    });
  } catch (err) {
    console.error("[ForgotPassword]", err.message);
    return res.status(500).json({ error: "Failed to process request. Please try again." });
  }
}

// ── POST /api/auth/reset-password ──────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: "Token, email, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const user = await get(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link." });
    }

    // Find the most recent valid (unused, non-expired) token for this user
    const tokenRecord = await get(
      `SELECT id, token_hash FROM password_reset_tokens
       WHERE user_id = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    if (!tokenRecord) {
      return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
    }

    // Constant-time comparison via bcrypt
    const isMatch = await bcrypt.compare(token, tokenRecord.token_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid or expired reset link." });
    }

    // Hash and store the new password
    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await run(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, user.id]
    );

    // Invalidate all reset tokens for this user
    await run(
      "UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?",
      [user.id]
    );

    return res.json({ message: "Password updated successfully. You can now sign in." });
  } catch (err) {
    console.error("[ResetPassword]", err.message);
    return res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
}

// ── PATCH /api/auth/change-password  (requires JWT) ───────────────────────
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = await get(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: "User not found." });

    // Google-only accounts don't have a password
    if (!user.password_hash) {
      return res.status(400).json({
        error: "This account uses Google sign-in. Password change is not available."
      });
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await run(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, req.user.id]
    );

    return res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("[ChangePassword]", err.message);
    return res.status(500).json({ error: "Failed to change password." });
  }
}

module.exports = { forgotPassword, resetPassword, changePassword };
