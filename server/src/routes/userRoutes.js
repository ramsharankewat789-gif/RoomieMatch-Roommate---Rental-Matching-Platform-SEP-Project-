/**
 * userRoutes.js — User profile endpoints.
 *
 * GET    /api/users              Admin: list all users (paginated, searchable)
 * GET    /api/users/:id          Get user profile (any authenticated user)
 * PATCH  /api/users/:id          Update profile (own account or admin)
 * DELETE /api/users/:id          Admin: delete user
 * GET    /api/users/:id/verification  View verification status (own or admin)
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserVerification,
  blockUser,
  unblockUser,
} = require("../controllers/userController");

const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many profile updates. Please try again later." }
});

// Admin: full list with all fields
// Authenticated non-admin: public-safe subset (for roommate matching)
router.get("/",                   requireAuth,                      listUsers);
router.get("/:id",                requireAuth,                      getUser);
router.patch("/:id",              requireAuth, profileUpdateLimiter, updateUser);
router.delete("/:id",             requireAuth, requireAdmin,         deleteUser);
router.get("/:id/verification",   requireAuth,                       getUserVerification);
router.patch("/:id/block",        requireAuth, requireAdmin,         blockUser);
router.patch("/:id/unblock",      requireAuth, requireAdmin,         unblockUser);

module.exports = router;
