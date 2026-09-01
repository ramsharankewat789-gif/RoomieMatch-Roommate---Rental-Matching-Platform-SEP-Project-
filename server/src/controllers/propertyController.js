/**
 * propertyController.js — Property listings CRUD.
 *
 * Endpoints:
 *   GET    /api/properties                   Public: search/filter/paginate
 *   POST   /api/properties                   Owner: create listing
 *   GET    /api/properties/:id               Public: single property with images/amenities/rules
 *   PUT    /api/properties/:id               Owner: update listing
 *   DELETE /api/properties/:id               Owner or Admin: delete listing
 *   PATCH  /api/properties/:id/verify        Admin: verify a property
 *   PATCH  /api/properties/:id/status        Owner: toggle active/inactive/rented
 *
 * Authorization:
 *   - GET routes are public (no auth required).
 *   - POST requires auth (any user can list a property).
 *   - PUT/DELETE require ownership or admin.
 *   - verify requires admin.
 */
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── Build full property response ───────────────────────────────────────────
async function buildPropertyResponse(propertyId) {
  const prop = await get("SELECT * FROM properties WHERE id = ?", [propertyId]);
  if (!prop) return null;

  const images = await all(
    `SELECT id, image_path, is_primary, sort_order
     FROM property_images
     WHERE property_id = ?
     ORDER BY is_primary DESC, sort_order ASC`,
    [propertyId],
  );

  const amenityRows = await all(
    "SELECT amenity FROM property_amenities WHERE property_id = ? ORDER BY id",
    [propertyId],
  );

  const ruleRows = await all(
    "SELECT rule FROM property_rules WHERE property_id = ? ORDER BY id",
    [propertyId],
  );

  const owner = await get(
    "SELECT id, name, profile_image, is_verified FROM users WHERE id = ?",
    [prop.owner_id],
  );

  return {
    ...prop,
    available_from: isoDate(prop.available_from),
    created_at: isoDate(prop.created_at),
    updated_at: isoDate(prop.updated_at),
    images: images.map((i) => i.image_path), // flat array for frontend compat
    imageData: images, // full objects for management UI
    amenities: amenityRows.map((r) => r.amenity),
    rules: ruleRows.map((r) => r.rule),
    owner: owner || null,
  };
}

// ── GET /api/properties ────────────────────────────────────────────────────
async function listProperties(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const {
      search,
      city,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      status,
      verified,
      ownerId,
    } = req.query;

    const conditions = [];
    const params = [];

    // Non-admin callers only see active properties
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      conditions.push("p.status = 'active'");
      if (!ownerId) {
        // Public search: only show verified properties unless owner is viewing their own
        conditions.push("p.is_verified = 1");
      }
    }

    if (ownerId) {
      conditions.push("p.owner_id = ?");
      params.push(ownerId);
    }
    if (search) {
      conditions.push(
        "(p.title LIKE ? OR p.address LIKE ? OR p.city LIKE ? OR p.description LIKE ?)",
      );
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (city) {
      conditions.push("p.city = ?");
      params.push(city);
    }
    if (type) {
      conditions.push("p.type = ?");
      params.push(type);
    }
    if (minPrice) {
      conditions.push("p.price >= ?");
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push("p.price <= ?");
      params.push(Number(maxPrice));
    }
    if (bedrooms) {
      conditions.push("p.bedrooms >= ?");
      params.push(Number(bedrooms));
    }
    if (status && isAdmin) {
      conditions.push("p.status = ?");
      params.push(status);
    }
    if (verified !== undefined && isAdmin) {
      conditions.push("p.is_verified = ?");
      params.push(verified === "true" ? 1 : 0);
    }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const [countRow] = await all(
      `SELECT COUNT(*) AS total FROM properties p ${where}`,
      params,
    );

    const rows = await all(
      `SELECT p.id, p.owner_id, p.title, p.address, p.city, p.type,
              p.bedrooms, p.bathrooms, p.price, p.deposit,
              p.available_from, p.status, p.is_verified,
              p.latitude, p.longitude, p.created_at,
              u.name AS owner_name, u.profile_image AS owner_image,
              (SELECT image_path FROM property_images
               WHERE property_id = p.id AND is_primary = 1 LIMIT 1) AS cover_image
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    // Attach amenities to each card
    const propertyIds = rows.map((r) => r.id);
    let amenitiesMap = {};
    if (propertyIds.length > 0) {
      const placeholders = propertyIds.map(() => "?").join(",");
      const amenityRows = await all(
        `SELECT property_id, amenity FROM property_amenities WHERE property_id IN (${placeholders})`,
        propertyIds,
      );
      for (const row of amenityRows) {
        if (!amenitiesMap[row.property_id]) amenitiesMap[row.property_id] = [];
        amenitiesMap[row.property_id].push(row.amenity);
      }
    }

    return res.json({
      properties: rows.map((p) => ({
        ...p,
        available_from: isoDate(p.available_from),
        created_at: isoDate(p.created_at),
        images: p.cover_image ? [p.cover_image] : [],
        amenities: amenitiesMap[p.id] || [],
      })),
      pagination: {
        total: countRow?.total || 0,
        page,
        limit,
        pages: Math.ceil((countRow?.total || 0) / limit),
      },
    });
  } catch (err) {
    console.error("[ListProperties]", err.message);
    return res.status(500).json({ error: "Failed to fetch properties." });
  }
}

// ── GET /api/properties/:id ────────────────────────────────────────────────
async function getProperty(req, res) {
  try {
    const prop = await buildPropertyResponse(req.params.id);
    if (!prop) return res.status(404).json({ error: "Property not found." });

    // Non-admin: hide inactive/unverified from non-owners
    const isOwner = req.user?.id === prop.owner_id;
    const isAdmin = req.user?.role === "admin";
    if (
      !isOwner &&
      !isAdmin &&
      (prop.status !== "active" || !prop.is_verified)
    ) {
      return res.status(404).json({ error: "Property not found." });
    }

    return res.json({ property: prop });
  } catch (err) {
    console.error("[GetProperty]", err.message);
    return res.status(500).json({ error: "Failed to fetch property." });
  }
}

// ── POST /api/properties ───────────────────────────────────────────────────
async function createProperty(req, res) {
  try {
    const {
      title,
      address,
      city,
      type,
      bedrooms,
      bathrooms,
      price,
      deposit,
      description,
      available_from,
      latitude,
      longitude,
      amenities = [],
      rules = [],
    } = req.body;

    if (!title || !address || !price) {
      return res
        .status(400)
        .json({ error: "Title, address, and price are required." });
    }

    const propId = uuidv4();

    await run(
      `INSERT INTO properties
         (id, owner_id, title, address, city, type, bedrooms, bathrooms,
          price, deposit, description, available_from, latitude, longitude, status, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)`,
      [
        propId,
        req.user.id,
        title.trim(),
        address.trim(),
        (city || "Metro City").trim(),
        type || "Apartment",
        Number(bedrooms) || 1,
        Number(bathrooms) || 1,
        Number(price),
        Number(deposit) || Number(price) || 0,
        (description || "").trim(),
        available_from || null,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
      ],
    );

    // Insert amenities
    for (const amenity of amenities) {
      const a = typeof amenity === "string" ? amenity.trim() : "";
      if (a) {
        await run(
          "INSERT IGNORE INTO property_amenities (property_id, amenity) VALUES (?, ?)",
          [propId, a],
        );
      }
    }

    // Insert rules
    for (const rule of rules) {
      const r = typeof rule === "string" ? rule.trim() : "";
      if (r) {
        await run(
          "INSERT INTO property_rules (property_id, rule) VALUES (?, ?)",
          [propId, r],
        );
      }
    }

    const property = await buildPropertyResponse(propId);
    return res.status(201).json({ property });
  } catch (err) {
    console.error("[CreateProperty]", err.message);
    return res.status(500).json({ error: "Failed to create property." });
  }
}

// ── PUT /api/properties/:id ────────────────────────────────────────────────
async function updateProperty(req, res) {
  try {
    const { id } = req.params;

    const existing = await get(
      "SELECT id, owner_id FROM properties WHERE id = ?",
      [id],
    );
    if (!existing)
      return res.status(404).json({ error: "Property not found." });

    if (existing.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    const {
      title,
      address,
      city,
      type,
      bedrooms,
      bathrooms,
      price,
      deposit,
      description,
      available_from,
      latitude,
      longitude,
      amenities,
      rules,
    } = req.body;

    // Build dynamic SET for scalar columns
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title.trim());
    }
    if (address !== undefined) {
      updates.push("address = ?");
      params.push(address.trim());
    }
    if (city !== undefined) {
      updates.push("city = ?");
      params.push(city.trim());
    }
    if (type !== undefined) {
      updates.push("type = ?");
      params.push(type);
    }
    if (bedrooms !== undefined) {
      updates.push("bedrooms = ?");
      params.push(Number(bedrooms));
    }
    if (latitude !== undefined) {
      updates.push("latitude = ?");
      params.push(latitude ? parseFloat(latitude) : null);
    }
    if (longitude !== undefined) {
      updates.push("longitude = ?");
      params.push(longitude ? parseFloat(longitude) : null);
    }
    if (bathrooms !== undefined) {
      updates.push("bathrooms = ?");
      params.push(Number(bathrooms));
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(Number(price));
    }
    if (deposit !== undefined) {
      updates.push("deposit = ?");
      params.push(Number(deposit));
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (available_from !== undefined) {
      updates.push("available_from = ?");
      params.push(available_from || null);
    }

    if (updates.length > 0) {
      params.push(id);
      await run(
        `UPDATE properties SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    // Replace amenities if supplied
    if (Array.isArray(amenities)) {
      await run("DELETE FROM property_amenities WHERE property_id = ?", [id]);
      for (const a of amenities) {
        const trimmed = typeof a === "string" ? a.trim() : "";
        if (trimmed) {
          await run(
            "INSERT IGNORE INTO property_amenities (property_id, amenity) VALUES (?, ?)",
            [id, trimmed],
          );
        }
      }
    }

    // Replace rules if supplied
    if (Array.isArray(rules)) {
      await run("DELETE FROM property_rules WHERE property_id = ?", [id]);
      for (const r of rules) {
        const trimmed = typeof r === "string" ? r.trim() : "";
        if (trimmed) {
          await run(
            "INSERT INTO property_rules (property_id, rule) VALUES (?, ?)",
            [id, trimmed],
          );
        }
      }
    }

    const property = await buildPropertyResponse(id);
    return res.json({ property });
  } catch (err) {
    console.error("[UpdateProperty]", err.message);
    return res.status(500).json({ error: "Failed to update property." });
  }
}

// ── DELETE /api/properties/:id ─────────────────────────────────────────────
async function deleteProperty(req, res) {
  try {
    const { id } = req.params;

    const existing = await get(
      "SELECT id, owner_id FROM properties WHERE id = ?",
      [id],
    );
    if (!existing)
      return res.status(404).json({ error: "Property not found." });

    if (existing.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    // FK CASCADE handles property_images, property_amenities, property_rules,
    // applications, favourites, reviews, reports
    await run("DELETE FROM properties WHERE id = ?", [id]);

    return res.json({ message: "Property deleted." });
  } catch (err) {
    console.error("[DeleteProperty]", err.message);
    return res.status(500).json({ error: "Failed to delete property." });
  }
}

// ── PATCH /api/properties/:id/verify  (admin) ─────────────────────────────
async function verifyProperty(req, res) {
  try {
    const { id } = req.params;

    const existing = await get("SELECT id FROM properties WHERE id = ?", [id]);
    if (!existing)
      return res.status(404).json({ error: "Property not found." });

    await run("UPDATE properties SET is_verified = 1 WHERE id = ?", [id]);

    return res.json({ message: "Property verified." });
  } catch (err) {
    console.error("[VerifyProperty]", err.message);
    return res.status(500).json({ error: "Failed to verify property." });
  }
}

// ── PATCH /api/properties/:id/status  (owner) ─────────────────────────────
async function updatePropertyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive", "rented"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${validStatuses.join(", ")}.` });
    }

    const existing = await get(
      "SELECT id, owner_id FROM properties WHERE id = ?",
      [id],
    );
    if (!existing)
      return res.status(404).json({ error: "Property not found." });

    if (existing.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    await run("UPDATE properties SET status = ? WHERE id = ?", [status, id]);

    return res.json({ message: `Property status updated to '${status}'.` });
  } catch (err) {
    console.error("[UpdatePropertyStatus]", err.message);
    return res.status(500).json({ error: "Failed to update status." });
  }
}

// ── PATCH /api/properties/:id/unverify  (admin) ───────────────────────────
async function unverifyProperty(req, res) {
  try {
    const { id } = req.params;
    const existing = await get("SELECT id FROM properties WHERE id = ?", [id]);
    if (!existing)
      return res.status(404).json({ error: "Property not found." });
    await run("UPDATE properties SET is_verified = 0 WHERE id = ?", [id]);
    return res.json({ message: "Property verification revoked." });
  } catch (err) {
    console.error("[UnverifyProperty]", err.message);
    return res.status(500).json({ error: "Failed to unverify property." });
  }
}

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
  unverifyProperty,
  updatePropertyStatus,
};
