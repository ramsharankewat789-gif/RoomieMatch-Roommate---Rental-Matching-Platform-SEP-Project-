const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  register,
  login,
  googleAuthCallback,
  verifyGoogleOtp,
  resendOtp,
  getMe
} = require("../controllers/authController");

const { requireAuth } = require("../middleware/auth");

// ── Rate limiters ──────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: { error: "Too many OTP attempts. Please wait and try again." }
});

// ── Routes ─────────────────────────────────────────────────────────────────

// Email / password
router.post("/register",       authLimiter, register);
router.post("/login",          authLimiter, login);

// Google OAuth (receives Google ID token from frontend)
router.post("/google",         authLimiter, googleAuthCallback);

// OTP
router.post("/otp/verify",     otpLimiter,  verifyGoogleOtp);
router.post("/otp/resend",     otpLimiter,  resendOtp);

// Protected: get current user
router.get("/me",              requireAuth, getMe);

module.exports = router;
