/**
 * notificationRoutes.js
 *
 * GET    /api/notifications              List own notifications
 * PATCH  /api/notifications/read-all    Mark all as read
 * PATCH  /api/notifications/:id/read    Mark one as read
 * DELETE /api/notifications/:id         Delete one
 */
const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  listNotifications,
  markOneRead,
  markAllRead,
  deleteNotification
} = require("../controllers/notificationController");

// Note: read-all MUST come before /:id/read to avoid route collision
router.get("/",                requireAuth, listNotifications);
router.patch("/read-all",      requireAuth, markAllRead);
router.patch("/:id/read",      requireAuth, markOneRead);
router.delete("/:id",          requireAuth, deleteNotification);

module.exports = router;
