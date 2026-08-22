/**
 * auth.js — JWT authentication + role-authorization middleware.
 *
 * MySQL change: db.get() now returns a Promise<row|null> from mysql2 pool.
 * Interface is identical — no other changes needed.
 */
const jwt = require("jsonwebtoken");
const { get } = require("../database/db");

/**
 * requireAuth — verifies the Bearer JWT from Authorization header.
 * On success attaches req.user = { id, email, role, name }.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm user still exists in MySQL
    const user = await get(
      "SELECT id, email, role, name FROM users WHERE id = ?",
      [payload.sub]
    );
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
 * requireOwnership — checks that req.user.id matches the target user ID.
 * Admins bypass this check. Must follow requireAuth.
 *
 * The target ID is read from req.params.userId first, then req.body.userId.
 */
function requireOwnership(req, res, next) {
  const targetId = req.params.userId || req.body.userId;
  if (req.user.role === "admin") return next();
  if (req.user.id !== targetId) {
    return res.status(403).json({ error: "Access denied." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireOwnership };
