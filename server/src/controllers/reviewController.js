/**
 * reviewController.js — Property and user reviews.
 *
 * GET  /api/reviews?targetProperty=&targetUser=&reviewerId=   List reviews
 * POST /api/reviews                                            Submit a review
 */
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");

function isoDate(v) {
  return !v ? null : v instanceof Date ? v.toISOString() : v;
}

// ── GET /api/reviews ─────────────────────────────────────────────────────
async function listReviews(req, res) {
  try {
    const { targetProperty, targetUser, reviewerId } = req.query;

    const conditions = [];
    const params     = [];

    if (targetProperty) { conditions.push("r.target_property = ?"); params.push(targetProperty); }
    if (targetUser)     { conditions.push("r.target_user = ?");     params.push(targetUser); }
    if (reviewerId)     { conditions.push("r.reviewer_id = ?");     params.push(reviewerId); }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const rows = await all(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              r.target_property, r.target_user,
              u.id   AS reviewer_id,
              u.name AS reviewer_name,
              u.profile_image AS reviewer_image,
              p.title AS property_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN properties p ON r.target_property = p.id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );

    const avgRating = rows.length
      ? (rows.reduce((s, r) => s + parseFloat(r.rating), 0) / rows.length).toFixed(1)
      : null;

    return res.json({
      reviews: rows.map(r => ({ ...r, created_at: isoDate(r.created_at) })),
      count:   rows.length,
      avgRating: avgRating ? parseFloat(avgRating) : null,
    });
  } catch (err) {
    console.error("[ListReviews]", err.message);
    return res.status(500).json({ error: "Failed to fetch reviews." });
  }
}

// ── POST /api/reviews ────────────────────────────────────────────────────
async function submitReview(req, res) {
  try {
    const { rating, comment, target_property, target_user } = req.body;
    const reviewerId = req.user.id;

    if (!rating || (!target_property && !target_user)) {
      return res.status(400).json({ error: "rating and a target (target_property or target_user) are required." });
    }
    const r = parseFloat(rating);
    if (isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }
    if (target_user && target_user === reviewerId) {
      return res.status(400).json({ error: "You cannot review yourself." });
    }

    // Validate targets exist
    if (target_property) {
      const prop = await get("SELECT id FROM properties WHERE id = ?", [target_property]);
      if (!prop) return res.status(404).json({ error: "Property not found." });
    }
    if (target_user) {
      const user = await get("SELECT id FROM users WHERE id = ?", [target_user]);
      if (!user) return res.status(404).json({ error: "User not found." });
    }

    const id = uuidv4();
    await run(
      `INSERT INTO reviews (id, reviewer_id, target_property, target_user, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, reviewerId, target_property || null, target_user || null, r, (comment || "").trim() || null]
    );

    const row = await get(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS reviewer_name, u.profile_image AS reviewer_image
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    return res.status(201).json({ review: { ...row, created_at: isoDate(row.created_at) } });
  } catch (err) {
    console.error("[SubmitReview]", err.message);
    return res.status(500).json({ error: "Failed to submit review." });
  }
}

module.exports = { listReviews, submitReview };
