/**
 * notificationController.js — In-app notifications for all users.
 *
 * Endpoints:
 *   GET    /api/notifications              List own notifications (paginated)
 *   PATCH  /api/notifications/:id/read     Mark one as read
 *   PATCH  /api/notifications/read-all     Mark all as read
 *   DELETE /api/notifications/:id          Delete one notification
 *
 * Internal helper (used by other controllers):
 *   createNotification(userId, title, message, type, referenceId)
 */
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── Internal helper — called by applicationController etc. ────────────────
async function createNotification(userId, title, message, type = "general", referenceId = null) {
  const id = uuidv4();
  await run(
    `INSERT INTO notifications (id, user_id, title, message, type, reference_id, is_read)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [id, userId, title, message, type, referenceId]
  );
  return id;
}

// ── GET /api/notifications ─────────────────────────────────────────────────
async function listNotifications(req, res) {
  try {
    const userId = req.user.id;
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unread === "true";

    const conditions = ["user_id = ?"];
    const params     = [userId];

    if (unreadOnly) {
      conditions.push("is_read = 0");
    }

    const where = "WHERE " + conditions.join(" AND ");

    const [countRow] = await all(
      `SELECT COUNT(*) AS total FROM notifications ${where}`,
      params
    );

    const rows = await all(
      `SELECT id, title, message, type, reference_id, is_read, created_at
       FROM notifications
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const unreadCount = await all(
      "SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );

    return res.json({
      notifications: rows.map(n => ({ ...n, created_at: isoDate(n.created_at) })),
      unreadCount: unreadCount[0]?.cnt || 0,
      pagination: {
        total: countRow?.total || 0,
        page, limit,
        pages: Math.ceil((countRow?.total || 0) / limit)
      }
    });
  } catch (err) {
    console.error("[ListNotifications]", err.message);
    return res.status(500).json({ error: "Failed to fetch notifications." });
  }
}

// ── PATCH /api/notifications/:id/read ────────────────────────────────────
async function markOneRead(req, res) {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;

    const notif = await get(
      "SELECT id, user_id FROM notifications WHERE id = ?",
      [id]
    );
    if (!notif) return res.status(404).json({ error: "Notification not found." });
    if (notif.user_id !== userId) return res.status(403).json({ error: "Access denied." });

    await run("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
    return res.json({ message: "Notification marked as read." });
  } catch (err) {
    console.error("[MarkOneRead]", err.message);
    return res.status(500).json({ error: "Failed to update notification." });
  }
}

// ── PATCH /api/notifications/read-all ────────────────────────────────────
async function markAllRead(req, res) {
  try {
    await run(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    return res.json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("[MarkAllRead]", err.message);
    return res.status(500).json({ error: "Failed to update notifications." });
  }
}

// ── DELETE /api/notifications/:id ────────────────────────────────────────
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = await get(
      "SELECT id, user_id FROM notifications WHERE id = ?",
      [id]
    );
    if (!notif) return res.status(404).json({ error: "Notification not found." });
    if (notif.user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    await run("DELETE FROM notifications WHERE id = ?", [id]);
    return res.json({ message: "Notification deleted." });
  } catch (err) {
    console.error("[DeleteNotification]", err.message);
    return res.status(500).json({ error: "Failed to delete notification." });
  }
}

module.exports = {
  createNotification,
  listNotifications,
  markOneRead,
  markAllRead,
  deleteNotification
};
