/**
 * upload.js — Multer-based file upload middleware.
 * Separate instances for profile images, verification docs, and property images.
 * All validation (MIME type, extension, size) happens here — backend enforces security.
 */
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// Ensure upload directories exist
const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads");
const dirs = ["profiles", "verifications", "properties"];
dirs.forEach((d) => {
  const p = path.join(UPLOAD_ROOT, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ── Allowed MIME types ─────────────────────────────────────────────────────
const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DOC_MIME_TYPES   = [...IMAGE_MIME_TYPES, "application/pdf"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const DOC_EXTENSIONS   = [...IMAGE_EXTENSIONS, ".pdf"];

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOAD_ROOT, subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      // Generate a UUID filename — prevents path traversal and original-name leakage
      cb(null, `${uuidv4()}${ext}`);
    }
  });
}

function imageFilter(_req, file, cb) {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!IMAGE_MIME_TYPES.includes(mime) || !IMAGE_EXTENSIONS.includes(ext)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Please upload a JPG, PNG, or WEBP image."));
  }
  cb(null, true);
}

function docFilter(_req, file, cb) {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!DOC_MIME_TYPES.includes(mime) || !DOC_EXTENSIONS.includes(ext)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Please upload a JPG, PNG, WEBP, or PDF document."));
  }
  cb(null, true);
}

// ── Profile image uploader ─────────────────────────────────────────────────
const profileUpload = multer({
  storage: makeStorage("profiles"),
  fileFilter: imageFilter,
  limits: { fileSize: Number(process.env.PROFILE_IMAGE_MAX_SIZE) || 5 * 1024 * 1024 }
});

// ── Verification document uploader ────────────────────────────────────────
const verificationUpload = multer({
  storage: makeStorage("verifications"),
  fileFilter: docFilter,
  limits: { fileSize: Number(process.env.VERIFICATION_DOC_MAX_SIZE) || 10 * 1024 * 1024 }
});

// ── Property images uploader ───────────────────────────────────────────────
const MAX_PROPERTY_IMAGES = Number(process.env.MAX_PROPERTY_IMAGES) || 6;
const propertyUpload = multer({
  storage: makeStorage("properties"),
  fileFilter: imageFilter,
  limits: {
    fileSize: Number(process.env.PROPERTY_IMAGE_MAX_SIZE) || 8 * 1024 * 1024,
    files: MAX_PROPERTY_IMAGES
  }
});

/**
 * handleMulterError — express error handler for multer errors.
 * Converts Multer errors to clean 400 JSON responses.
 */
function handleMulterError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image size exceeds the allowed limit." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: `You can upload up to ${MAX_PROPERTY_IMAGES} property images.` });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: err.field || "Unsupported file type." });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

module.exports = { profileUpload, verificationUpload, propertyUpload, handleMulterError, UPLOAD_ROOT };
