/**
 * reportController.js — Abuse/content reports.
 *
 * Endpoints:
 *   POST   /api/reports                    Submit a report (any authenticated user)
 *   GET    /api/reports                    Admin: list all reports (paginated, filterable)
 *   GET    /api/reports/:id                Admin: single report detail
 *   PATCH  /api/reports/:id                Admin: resolve or dismiss
 */
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── POST /api/reports ─────────────────────────────────────────────────────
async function submitReport(req, res) {
  try {
    const {
      title,
      reason,
      reported_user_id,
      reported_property_id
    } = req.body;

    if (!title || !reason) {
      return res.status(400).json({ error: "Title and reason are required." });
    }
    if (!reported_user_id && !reported_property_id) {
      return res.status(400).json({ error: "Either reported_user_id or reported_property_id is required." });
    }

    // Validate targets exist
    if (reported_user_id) {
      const user = await get("SELECT id FROM users WHERE id = ?", [reported_user_id]);
      if (!user) return res.status(404).json({ error: "Reported user not found." });
      if (reported_user_id === req.user.id) {
        return res.status(400).json({ error: "You cannot report yourself." });
      }
    }
    if (reported_property_id) {
      const prop = await get("SELECT id FROM properties WHERE id = ?", [reported_property_id]);
      if (!prop) return res.status(404).json({ error: "Reported property not found." });
    }

    const id = uuidv4();
    await run(
      `INSERT INTO reports
         (id, reporter_id, reported_user_id, reported_property_id, title, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [id, req.user.id, reported_user_id || null, reported_property_id || null, title.trim(), reason.trim()]
    );

    return res.status(201).json({ message: "Report submitted successfully.", reportId: id });
  } catch (err) {
    console.error("[SubmitReport]", err.message);
    return res.status(500).json({ error: "Failed to submit report." });
  }
}

// ── GET /api/reports  (admin) ─────────────────────────────────────────────
async function listReports(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || null;

    const conditions = [];
    const params     = [];

    if (statusFilter) {
      conditions.push("r.status = ?");
      params.push(statusFilter);
    }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const [countRow] = await all(
      `SELECT COUNT(*) AS total FROM reports r ${where}`, params
    );

    const rows = await all(
      `SELECT r.id, r.title, r.reason, r.status, r.resolution,
              r.created_at, r.resolved_at,
              reporter.id AS reporter_id, reporter.name AS reporter_name,
              reporter.email AS reporter_email,
              ru.id AS reported_user_id, ru.name AS reported_user_name,
              rp.id AS reported_property_id, rp.title AS reported_property_title,
              resolver.name AS resolved_by_name
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       LEFT JOIN users ru     ON r.reported_user_id     = ru.id
       LEFT JOIN properties rp ON r.reported_property_id = rp.id
       LEFT JOIN users resolver ON r.resolved_by        = resolver.id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      reports: rows.map(r => ({
        ...r,
        created_at:  isoDate(r.created_at),
        resolved_at: isoDate(r.resolved_at)
      })),
      pagination: {
        total: countRow?.total || 0,
        page, limit,
        pages: Math.ceil((countRow?.total || 0) / limit)
      }
    });
  } catch (err) {
    console.error("[ListReports]", err.message);
    return res.status(500).json({ error: "Failed to fetch reports." });
  }
}

// ── GET /api/reports/:id  (admin) ─────────────────────────────────────────
async function getReport(req, res) {
  try {
    const row = await get(
      `SELECT r.*,
              reporter.name AS reporter_name, reporter.email AS reporter_email,
              ru.name AS reported_user_name,
              rp.title AS reported_property_title
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       LEFT JOIN users ru      ON r.reported_user_id     = ru.id
       LEFT JOIN properties rp ON r.reported_property_id = rp.id
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: "Report not found." });

    return res.json({
      report: {
        ...row,
        created_at:  isoDate(row.created_at),
        resolved_at: isoDate(row.resolved_at)
      }
    });
  } catch (err) {
    console.error("[GetReport]", err.message);
    return res.status(500).json({ error: "Failed to fetch report." });
  }
}

// ── PATCH /api/reports/:id  (admin) ──────────────────────────────────────
async function updateReport(req, res) {
  try {
    const { id }         = req.params;
    const { status, resolution } = req.body;

    const validStatuses = ["resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status must be 'resolved' or 'dismissed'." });
    }

    const existing = await get("SELECT id FROM reports WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Report not found." });

    await run(
      `UPDATE reports
       SET status = ?, resolution = ?, resolved_at = NOW(), resolved_by = ?
       WHERE id = ?`,
      [status, resolution || null, req.user.id, id]
    );

    return res.json({ message: `Report marked as ${status}.` });
  } catch (err) {
    console.error("[UpdateReport]", err.message);
    return res.status(500).json({ error: "Failed to update report." });
  }
}

module.exports = { submitReport, listReports, getReport, updateReport };
