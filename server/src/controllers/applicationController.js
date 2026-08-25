/**
 * applicationController.js — Rental application workflow.
 *
 * Endpoints:
 *   GET    /api/applications              Tenant: own applications | Owner: received
 *   POST   /api/applications              Tenant: submit application
 *   GET    /api/applications/:id          Get single application (tenant or owner)
 *   PATCH  /api/applications/:id/status   Owner: approve / reject
 *   DELETE /api/applications/:id          Tenant: cancel
 *
 * Authorization:
 *   - Tenants can only see and cancel their own applications.
 *   - Owners can only see and action applications for their own properties.
 *   - Admins can see all.
 *
 * Each status change appends a row to application_history.
 */
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");
const { createNotification } = require("./notificationController");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── Build full application response ───────────────────────────────────────
async function buildApplicationResponse(appId) {
  const app = await get("SELECT * FROM applications WHERE id = ?", [appId]);
  if (!app) return null;

  const history = await all(
    "SELECT status, label, changed_at FROM application_history WHERE application_id = ? ORDER BY changed_at ASC",
    [appId]
  );

  const property = await get(
    "SELECT id, title, address, city, price FROM properties WHERE id = ?",
    [app.property_id]
  );

  const tenant = await get(
    "SELECT id, name, email, profile_image, is_verified FROM users WHERE id = ?",
    [app.tenant_id]
  );

  return {
    ...app,
    applied_at: isoDate(app.applied_at),
    updated_at: isoDate(app.updated_at),
    history:    history.map(h => ({ ...h, changed_at: isoDate(h.changed_at) })),
    property:   property || null,
    tenant:     tenant   || null
  };
}

// ── GET /api/applications ─────────────────────────────────────────────────
async function listApplications(req, res) {
  try {
    const { id: userId, role } = req.user;
    const isAdmin = role === "admin";

    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const statusFilter = req.query.status || null;

    let conditions = [];
    let params     = [];

    if (!isAdmin) {
      // Return applications where the caller is tenant OR owner
      conditions.push("(a.tenant_id = ? OR a.owner_id = ?)");
      params.push(userId, userId);
    }

    if (statusFilter) {
      conditions.push("a.status = ?");
      params.push(statusFilter);
    }

    // Allow filtering by property (useful for owner's property page)
    if (req.query.propertyId) {
      conditions.push("a.property_id = ?");
      params.push(req.query.propertyId);
    }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const [countRow] = await all(
      `SELECT COUNT(*) AS total FROM applications a ${where}`, params
    );

    const rows = await all(
      `SELECT a.id, a.property_id, a.tenant_id, a.owner_id, a.status,
              a.message, a.applied_at, a.updated_at,
              p.title AS property_title, p.address AS property_address,
              p.price AS property_price,
              u.name AS tenant_name, u.profile_image AS tenant_image,
              u.is_verified AS tenant_verified
       FROM applications a
       JOIN properties p ON a.property_id = p.id
       JOIN users      u ON a.tenant_id   = u.id
       ${where}
       ORDER BY a.applied_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Fetch history for each application
    const appIds = rows.map(r => r.id);
    let historyMap = {};
    if (appIds.length > 0) {
      const placeholders = appIds.map(() => "?").join(",");
      const histRows = await all(
        `SELECT application_id, status, label, changed_at
         FROM application_history
         WHERE application_id IN (${placeholders})
         ORDER BY changed_at ASC`,
        appIds
      );
      for (const h of histRows) {
        if (!historyMap[h.application_id]) historyMap[h.application_id] = [];
        historyMap[h.application_id].push({
          status:     h.status,
          label:      h.label,
          changed_at: isoDate(h.changed_at)
        });
      }
    }

    return res.json({
      applications: rows.map(r => ({
        ...r,
        applied_at: isoDate(r.applied_at),
        updated_at: isoDate(r.updated_at),
        history:    historyMap[r.id] || []
      })),      pagination: {
        total: countRow?.total || 0,
        page, limit,
        pages: Math.ceil((countRow?.total || 0) / limit)
      }
    });
  } catch (err) {
    console.error("[ListApplications]", err.message);
    return res.status(500).json({ error: "Failed to fetch applications." });
  }
}

// ── POST /api/applications ────────────────────────────────────────────────
async function submitApplication(req, res) {
  try {
    const { property_id, message } = req.body;
    const tenantId = req.user.id;

    if (!property_id) {
      return res.status(400).json({ error: "property_id is required." });
    }

    // Check property exists
    const property = await get(
      "SELECT id, owner_id, title, status, is_verified FROM properties WHERE id = ?",
      [property_id]
    );
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }
    if (property.owner_id === tenantId) {
      return res.status(400).json({ error: "You cannot apply for your own property." });
    }
    if (property.status !== "active") {
      return res.status(400).json({ error: "This property is not currently available." });
    }

    // Prevent duplicate active application
    const existing = await get(
      "SELECT id FROM applications WHERE tenant_id = ? AND property_id = ? AND status NOT IN ('rejected','cancelled')",
      [tenantId, property_id]
    );
    if (existing) {
      return res.status(409).json({ error: "You already have an active application for this property." });
    }

    const appId = uuidv4();

    await run(
      `INSERT INTO applications (id, property_id, tenant_id, owner_id, status, message)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [appId, property_id, tenantId, property.owner_id, message || null]
    );

    // Record initial history entry
    await run(
      "INSERT INTO application_history (application_id, status, label) VALUES (?, 'pending', ?)",
      [appId, `Application submitted by ${req.user.name || tenantId}`]
    );

    // Notify the property owner
    try {
      await createNotification(
        property.owner_id,
        "New Application Received",
        `${req.user.name} applied for your property: "${property.title}"`,
        "application",
        appId
      );
    } catch (_) { /* non-fatal */ }

    const app = await buildApplicationResponse(appId);
    return res.status(201).json({ application: app });
  } catch (err) {
    console.error("[SubmitApplication]", err.message);
    return res.status(500).json({ error: "Failed to submit application." });
  }
}

// ── GET /api/applications/:id ─────────────────────────────────────────────
async function getApplication(req, res) {
  try {
    const app = await buildApplicationResponse(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found." });

    const isAdmin  = req.user.role === "admin";
    const isTenant = req.user.id === app.tenant_id;
    const isOwner  = req.user.id === app.owner_id;

    if (!isAdmin && !isTenant && !isOwner) {
      return res.status(403).json({ error: "Access denied." });
    }

    return res.json({ application: app });
  } catch (err) {
    console.error("[GetApplication]", err.message);
    return res.status(500).json({ error: "Failed to fetch application." });
  }
}

// ── PATCH /api/applications/:id/status  (owner) ───────────────────────────
async function updateApplicationStatus(req, res) {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be 'approved' or 'rejected'.` });
    }

    const app = await get("SELECT * FROM applications WHERE id = ?", [id]);
    if (!app) return res.status(404).json({ error: "Application not found." });

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.id === app.owner_id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (app.status === "cancelled") {
      return res.status(400).json({ error: "Cannot update a cancelled application." });
    }

    await run(
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, id]
    );

    // If approved, mark property as rented
    if (status === "approved") {
      await run(
        "UPDATE properties SET status = 'rented' WHERE id = ?",
        [app.property_id]
      );
    }

    await run(
      "INSERT INTO application_history (application_id, status, label) VALUES (?, ?, ?)",
      [id, status, `Application ${status} by ${req.user.name || req.user.id}`]
    );

    // Notify the tenant
    try {
      const statusLabel = status === "approved" ? "Approved 🎉" : "Rejected";
      await createNotification(
        app.tenant_id,
        `Application ${statusLabel}`,
        `Your application for "${(await get("SELECT title FROM properties WHERE id=?", [app.property_id]))?.title || "a property"}" was ${status}.`,
        "application",
        id
      );
    } catch (_) { /* non-fatal */ }

    const updated = await buildApplicationResponse(id);
    return res.json({ application: updated });
  } catch (err) {
    console.error("[UpdateApplicationStatus]", err.message);
    return res.status(500).json({ error: "Failed to update application." });
  }
}

// ── DELETE /api/applications/:id  (tenant cancel) ─────────────────────────
async function cancelApplication(req, res) {
  try {
    const { id } = req.params;

    const app = await get("SELECT * FROM applications WHERE id = ?", [id]);
    if (!app) return res.status(404).json({ error: "Application not found." });

    if (req.user.id !== app.tenant_id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    if (["approved", "rejected", "cancelled"].includes(app.status)) {
      return res.status(400).json({ error: `Cannot cancel an application that is already '${app.status}'.` });
    }

    await run("UPDATE applications SET status = 'cancelled' WHERE id = ?", [id]);

    await run(
      "INSERT INTO application_history (application_id, status, label) VALUES (?, 'cancelled', ?)",
      [id, `Application cancelled by ${req.user.name || req.user.id}`]
    );

    return res.json({ message: "Application cancelled." });
  } catch (err) {
    console.error("[CancelApplication]", err.message);
    return res.status(500).json({ error: "Failed to cancel application." });
  }
}

module.exports = {
  listApplications,
  submitApplication,
  getApplication,
  updateApplicationStatus,
  cancelApplication
};
