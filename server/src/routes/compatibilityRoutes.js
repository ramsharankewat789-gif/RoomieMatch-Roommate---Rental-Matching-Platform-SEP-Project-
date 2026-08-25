/**
 * compatibilityRoutes.js
 *
 * GET  /api/compatibility        Retrieve stored scores for current user
 * POST /api/compatibility/save   Save batch of computed scores
 */
const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../middleware/auth");
const { saveScores, getScores } = require("../controllers/compatibilityController");

router.get("/",      requireAuth, getScores);
router.post("/save", requireAuth, saveScores);

module.exports = router;
