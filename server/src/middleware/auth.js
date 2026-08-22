/**
 * auth.js — JWT authentication + role-authorization middleware.
 */
const jwt = require("jsonwebtoken");
const { get } = require("../database/db");

/**
 * requireAuth — verifies the JWT from Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm user still exists in DB
    const user = await get("SELECT id, email, role, name FROM users WHERE id = ?", [payload.sub]);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
}

/**
 * requireAdmin — must follow requireAuth.
 * Only allows users with role === 'admin'.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrator access required." });
  }
  next();
}

/**
 * requireOwnership — checks req.user.id === req.params.userId (or req.body.userId).
 * Must follow requireAuth.
 */
function requireOwnership(req, res, next) {
  const targetId = req.params.userId || req.body.userId;
  if (req.user.role === "admin") return next(); // admins bypass ownership check
  if (req.user.id !== targetId) {
    return res.status(403).json({ error: "Access denied." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireOwnership };
