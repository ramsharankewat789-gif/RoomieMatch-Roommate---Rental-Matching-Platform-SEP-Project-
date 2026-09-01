const express = require("express");
const router  = express.Router();

const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  profileUpload,
  verificationUpload,
  propertyUpload,
  handleMulterError
} = require("../middleware/upload");

const {
  uploadProfileImage,
  deleteProfileImage,
  uploadVerificationDoc,
  getMyVerificationStatus,
  serveVerificationDoc,
  approveVerification,
  rejectVerification,
  unverifyUser,
  listAllVerifications,
  listPendingVerifications,
  uploadPropertyImages,
  deletePropertyImage,
  setPrimaryImage,
  getPropertyImages,
  serveStaticUpload
} = require("../controllers/uploadController");

// ── Profile images ─────────────────────────────────────────────────────────
router.post(
  "/profile",
  requireAuth,
  profileUpload.single("image"),
  handleMulterError,
  uploadProfileImage
);
router.delete("/profile", requireAuth, deleteProfileImage);

// ── Verification documents ─────────────────────────────────────────────────
router.post(
  "/verification",
  requireAuth,
  verificationUpload.single("document"),
  handleMulterError,
  uploadVerificationDoc
);
router.get("/verification/status",          requireAuth,               getMyVerificationStatus);
router.get("/verification/doc/:userId",     requireAuth,               serveVerificationDoc);
router.post("/verification/:userId/approve",requireAuth, requireAdmin,  approveVerification);
router.post("/verification/:userId/reject", requireAuth, requireAdmin,  rejectVerification);
router.post("/verification/:userId/unverify",requireAuth, requireAdmin, unverifyUser);
router.get("/verification/pending",         requireAuth, requireAdmin,  listPendingVerifications);
router.get("/verification/all",             requireAuth, requireAdmin,  listAllVerifications);

// ── Property images ────────────────────────────────────────────────────────
router.get("/properties/:propertyId/images",               requireAuth, getPropertyImages);
router.post(
  "/properties/:propertyId/images",
  requireAuth,
  propertyUpload.array("images", 6),
  handleMulterError,
  uploadPropertyImages
);
router.delete("/properties/images/:imageId", requireAuth, deletePropertyImage);
router.patch("/properties/images/:imageId/primary", requireAuth, setPrimaryImage);

// ── Static file serving (profiles + properties only; verifications are auth-gated above) ──
router.get("/uploads/:subfolder/:filename", serveStaticUpload);

module.exports = router;
