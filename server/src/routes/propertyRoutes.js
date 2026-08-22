/**
 * propertyRoutes.js
 *
 * GET    /api/properties                 Public search/list
 * POST   /api/properties                 Owner: create
 * GET    /api/properties/:id             Public: single property
 * PUT    /api/properties/:id             Owner/Admin: update
 * DELETE /api/properties/:id             Owner/Admin: delete
 * PATCH  /api/properties/:id/verify      Admin: verify
 * PATCH  /api/properties/:id/status      Owner: toggle status
 *
 * Image routes remain in uploadRoutes.js:
 *   GET    /api/properties/:id/images
 *   POST   /api/properties/:id/images
 *   DELETE /api/properties/images/:imageId
 *   PATCH  /api/properties/images/:imageId/primary
 */
const express   = require("express");
const rateLimit = require("express-rate-limit");
const router    = express.Router();

const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
  updatePropertyStatus
} = require("../controllers/propertyController");

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  message: { error: "Too many property requests. Please try again later." }
});

// Optional auth middleware — attaches req.user if JWT present, but doesn't block unauthenticated requests
const { requireAuth: _requireAuth } = require("../middleware/auth");

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return next();
  return _requireAuth(req, res, next);
}

router.get("/",          optionalAuth,                   listProperties);
router.post("/",         requireAuth,  writeLimiter,     createProperty);
router.get("/:id",       optionalAuth,                   getProperty);
router.put("/:id",       requireAuth,  writeLimiter,     updateProperty);
router.delete("/:id",    requireAuth,                    deleteProperty);
router.patch("/:id/verify", requireAuth, requireAdmin,   verifyProperty);
router.patch("/:id/status", requireAuth,                 updatePropertyStatus);

module.exports = router;
