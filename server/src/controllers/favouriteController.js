/**
 * favouriteController.js — Saved/bookmarked properties per user.
 *
 * Endpoints:
 *   GET    /api/favourites                 List own saved properties
 *   POST   /api/favourites                 Save a property
 *   DELETE /api/favourites/:propertyId     Remove a saved property
 *   GET    /api/favourites/:propertyId/status  Check if a property is saved
 */
const { run, get, all } = require("../database/db");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── GET /api/favourites ───────────────────────────────────────────────────
async function listFavourites(req, res) {
  try {
    const userId = req.user.id;

    const rows = await all(
      `SELECT f.id AS fav_id, f.created_at AS saved_at,
              p.id, p.owner_id, p.title, p.address, p.city, p.type,
              p.bedrooms, p.bathrooms, p.price, p.deposit,
              p.available_from, p.status, p.is_verified,
              u.name AS owner_name,
              (SELECT image_path FROM property_images
               WHERE property_id = p.id AND is_primary = 1 LIMIT 1) AS cover_image
       FROM favourites f
       JOIN properties p ON f.property_id = p.id
       JOIN users      u ON p.owner_id     = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return res.json({
      favourites: rows.map(r => ({
        ...r,
        saved_at:       isoDate(r.saved_at),
        available_from: isoDate(r.available_from),
        images:         r.cover_image ? [r.cover_image] : []
      }))
    });
  } catch (err) {
    console.error("[ListFavourites]", err.message);
    return res.status(500).json({ error: "Failed to fetch favourites." });
  }
}

// ── POST /api/favourites ──────────────────────────────────────────────────
async function addFavourite(req, res) {
  try {
    const userId     = req.user.id;
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ error: "property_id is required." });
    }

    const property = await get("SELECT id FROM properties WHERE id = ?", [property_id]);
    if (!property) return res.status(404).json({ error: "Property not found." });

    // INSERT IGNORE skips silently if already favourited
    await run(
      "INSERT IGNORE INTO favourites (user_id, property_id) VALUES (?, ?)",
      [userId, property_id]
    );

    return res.status(201).json({ message: "Property saved to favourites." });
  } catch (err) {
    console.error("[AddFavourite]", err.message);
    return res.status(500).json({ error: "Failed to save property." });
  }
}

// ── DELETE /api/favourites/:propertyId ───────────────────────────────────
async function removeFavourite(req, res) {
  try {
    const userId     = req.user.id;
    const { propertyId } = req.params;

    await run(
      "DELETE FROM favourites WHERE user_id = ? AND property_id = ?",
      [userId, propertyId]
    );

    return res.json({ message: "Property removed from favourites." });
  } catch (err) {
    console.error("[RemoveFavourite]", err.message);
    return res.status(500).json({ error: "Failed to remove favourite." });
  }
}

// ── GET /api/favourites/:propertyId/status ────────────────────────────────
async function getFavouriteStatus(req, res) {
  try {
    const userId     = req.user.id;
    const { propertyId } = req.params;

    const row = await get(
      "SELECT id FROM favourites WHERE user_id = ? AND property_id = ?",
      [userId, propertyId]
    );

    return res.json({ isFavourited: !!row });
  } catch (err) {
    console.error("[GetFavouriteStatus]", err.message);
    return res.status(500).json({ error: "Failed to check favourite status." });
  }
}

module.exports = {
  listFavourites,
  addFavourite,
  removeFavourite,
  getFavouriteStatus
};
