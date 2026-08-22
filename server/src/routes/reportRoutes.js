/**
 * reportRoutes.js
 *
 * POST   /api/reports              Submit a report (any auth user)
 * GET    /api/reports              Admin: list all reports
 * GET    /api/reports/:id          Admin: single report
 * PATCH  /api/reports/:id          Admin: resolve / dismiss
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
const router  = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  submitReport,
  listReports,
  getReport,
  updateReport
} = require("../controllers/reportController");

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: "Too many reports submitted. Please try again later." }
});

router.post("/",    requireAuth, reportLimiter, submitReport);
router.get("/",     requireAuth, requireAdmin,  listReports);
router.get("/:id",  requireAuth, requireAdmin,  getReport);
router.patch("/:id",requireAuth, requireAdmin,  updateReport);

module.exports = router;
