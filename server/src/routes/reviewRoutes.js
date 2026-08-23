/**
 * reviewRoutes.js
 *
 * GET  /api/reviews   List reviews (filter by targetProperty, targetUser, reviewerId)
 * POST /api/reviews   Submit a review (authenticated)
 */
const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../middleware/auth");
const { listReviews, submitReview } = require("../controllers/reviewController");

router.get("/",  listReviews);
router.post("/", requireAuth, submitReview);

module.exports = router;
