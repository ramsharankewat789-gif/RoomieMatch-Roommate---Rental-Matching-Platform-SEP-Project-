/**
 * adminController.js — Admin-only dashboard statistics and bulk operations.
 *
 * Endpoints:
 *   GET /api/admin/stats      Summary counts for the dashboard
 *   GET /api/admin/activity   Recent activity feed (latest users, properties, apps)
 */
const { all, get } = require("../database/db");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────
async function getStats(req, res) {
  try {
    // Run all count queries in parallel
    const [
      usersRow,
      tenantsRow,
      ownersRow,
      propertiesRow,
      activePropsRow,
      pendingVerifRow,
      pendingAppsRow,
      pendingReportsRow,
      messagesRow,
      revenueRow,
    ] = await Promise.all([
      get("SELECT COUNT(*) AS cnt FROM users WHERE role = 'user'"),
      get("SELECT COUNT(DISTINCT tenant_id) AS cnt FROM applications"),
      get("SELECT COUNT(DISTINCT owner_id) AS cnt FROM properties"),
      get("SELECT COUNT(*) AS cnt FROM properties"),
      get("SELECT COUNT(*) AS cnt FROM properties WHERE status = 'active' AND is_verified = 1"),
      get("SELECT COUNT(*) AS cnt FROM verification_docs WHERE status = 'PENDING'"),
      get("SELECT COUNT(*) AS cnt FROM applications WHERE status = 'pending'"),
      get("SELECT COUNT(*) AS cnt FROM reports WHERE status = 'pending'"),
      get("SELECT COUNT(*) AS cnt FROM messages"),
      get("SELECT COALESCE(SUM(price), 0) AS total FROM properties WHERE status = 'rented'"),
    ]);

    // Month-over-month new users (last 30 days vs 30-60 days ago)
    const newUsersThisMonth = await get(
      "SELECT COUNT(*) AS cnt FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const newUsersLastMonth = await get(
      "SELECT COUNT(*) AS cnt FROM users WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 60 DAY) AND DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    // Properties added in last 30 days
    const newPropsThisMonth = await get(
      "SELECT COUNT(*) AS cnt FROM properties WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    // Approved applications this month
    const approvedThisMonth = await get(
      "SELECT COUNT(*) AS cnt FROM applications WHERE status = 'approved' AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    return res.json({
      users: {
        total:     usersRow?.cnt        || 0,
        tenants:   tenantsRow?.cnt      || 0,
        owners:    ownersRow?.cnt       || 0,
        newThisMonth: newUsersThisMonth?.cnt || 0,
        newLastMonth: newUsersLastMonth?.cnt || 0,
      },
      properties: {
        total:          propertiesRow?.cnt    || 0,
        active:         activePropsRow?.cnt   || 0,
        newThisMonth:   newPropsThisMonth?.cnt || 0,
      },
      applications: {
        pending:         pendingAppsRow?.cnt   || 0,
        approvedThisMonth: approvedThisMonth?.cnt || 0,
      },
      verifications: {
        pending: pendingVerifRow?.cnt || 0,
      },
      reports: {
        pending: pendingReportsRow?.cnt || 0,
      },
      messages: {
        total: messagesRow?.cnt || 0,
      },
      revenue: {
        totalRentedMonthly: parseFloat(revenueRow?.total) || 0,
      }
    });
  } catch (err) {
    console.error("[GetStats]", err.message);
    return res.status(500).json({ error: "Failed to fetch statistics." });
  }
}

// ── GET /api/admin/activity ───────────────────────────────────────────────
async function getActivity(req, res) {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    const [recentUsers, recentProperties, recentApplications, recentReports] = await Promise.all([
      all(
        `SELECT id, name, email, role, created_at
         FROM users ORDER BY created_at DESC LIMIT ?`,
        [limit]
      ),
      all(
        `SELECT p.id, p.title, p.city, p.price, p.status, p.is_verified, p.created_at,
                u.name AS owner_name
         FROM properties p JOIN users u ON p.owner_id = u.id
         ORDER BY p.created_at DESC LIMIT ?`,
        [limit]
      ),
      all(
        `SELECT a.id, a.status, a.applied_at,
                p.title AS property_title,
                t.name  AS tenant_name
         FROM applications a
         JOIN properties p ON a.property_id = p.id
         JOIN users t      ON a.tenant_id   = t.id
         ORDER BY a.applied_at DESC LIMIT ?`,
        [limit]
      ),
      all(
        `SELECT r.id, r.title, r.status, r.created_at,
                u.name AS reporter_name
         FROM reports r JOIN users u ON r.reporter_id = u.id
         ORDER BY r.created_at DESC LIMIT ?`,
        [limit]
      ),
    ]);

    return res.json({
      recentUsers:        recentUsers.map(u => ({ ...u, created_at: isoDate(u.created_at) })),
      recentProperties:   recentProperties.map(p => ({ ...p, created_at: isoDate(p.created_at) })),
      recentApplications: recentApplications.map(a => ({ ...a, applied_at: isoDate(a.applied_at) })),
      recentReports:      recentReports.map(r => ({ ...r, created_at: isoDate(r.created_at) })),
    });
  } catch (err) {
    console.error("[GetActivity]", err.message);
    return res.status(500).json({ error: "Failed to fetch activity." });
  }
}

module.exports = { getStats, getActivity };
