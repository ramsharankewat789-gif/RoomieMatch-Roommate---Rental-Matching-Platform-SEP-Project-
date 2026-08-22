/**
 * applicationRoutes.js
 *
 * GET    /api/applications                  List (tenant: own | owner: received | admin: all)
 * POST   /api/applications                  Tenant: submit
 * GET    /api/applications/:id              Get single application
 * PATCH  /api/applications/:id/status       Owner/Admin: approve or reject
 * DELETE /api/applications/:id              Tenant: cancel
 */
const express   = require("express");
const rateLimit = require("express-rate-limit");
const router    = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  listApplications,
  submitApplication,
  getApplication,
  updateApplicationStatus,
  cancelApplication
} = require("../controllers/applicationController");

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: "Too many application requests. Please try again later." }
});

router.get("/",              requireAuth,               listApplications);
router.post("/",             requireAuth, submitLimiter, submitApplication);
router.get("/:id",           requireAuth,               getApplication);
router.patch("/:id/status",  requireAuth,               updateApplicationStatus);
router.delete("/:id",        requireAuth,               cancelApplication);

module.exports = router;
