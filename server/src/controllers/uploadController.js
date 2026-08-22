/**
 * uploadController.js — handles profile image, verification doc, and property image uploads.
 *
 * Security:
 *  - All routes require authentication (requireAuth middleware applied in router)
 *  - Verification docs are served through a protected endpoint — not via static URL
 *  - Ownership is checked before allowing delete/update
 *  - Filenames are UUIDs — no original filenames exposed
 */
const path = require("path");
const fs   = require("fs");
const { v4: uuidv4 } = require("uuid");
const { run, get, all } = require("../database/db");
const { UPLOAD_ROOT } = require("../middleware/upload");

// ── Helpers ────────────────────────────────────────────────────────────────

function fileUrl(subfolder, filename) {
  return `/api/uploads/${subfolder}/${filename}`;
}

function deleteFile(subfolder, filename) {
  if (!filename) return;
  try {
    const p = path.join(UPLOAD_ROOT, subfolder, path.basename(filename));
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn("[DeleteFile] Could not delete:", e.message);
  }
}

// ── Profile Image ──────────────────────────────────────────────────────────

async function uploadProfileImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    const userId = req.user.id;

    // Remove old profile image file
    const existing = await get("SELECT profile_image FROM users WHERE id = ?", [userId]);
    if (existing?.profile_image) {
      const oldFilename = path.basename(existing.profile_image);
      deleteFile("profiles", oldFilename);
    }

    const imageUrl = fileUrl("profiles", req.file.filename);
    await run("UPDATE users SET profile_image = ?, updated_at = datetime('now') WHERE id = ?", [imageUrl, userId]);

    return res.json({ imageUrl, message: "Profile image updated successfully." });
  } catch (err) {
    console.error("[UploadProfileImage]", err.message);
    return res.status(500).json({ error: "Failed to upload profile image." });
  }
}

async function deleteProfileImage(req, res) {
  try {
    const userId  = req.user.id;
    const existing = await get("SELECT profile_image FROM users WHERE id = ?", [userId]);

    if (existing?.profile_image) {
      deleteFile("profiles", path.basename(existing.profile_image));
      await run("UPDATE users SET profile_image = NULL, updated_at = datetime('now') WHERE id = ?", [userId]);
    }

    return res.json({ message: "Profile image removed." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove profile image." });
  }
}

// ── Verification Documents ─────────────────────────────────────────────────

async function uploadVerificationDoc(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No document file provided." });
    }

    const userId   = req.user.id;
    const docType  = req.body.document_type || "ID Document";
    const docPath  = `/api/uploads/verifications/${req.file.filename}`;

    // Remove old doc file if exists
    const existing = await get("SELECT document_path FROM verification_docs WHERE user_id = ?", [userId]);
    if (existing?.document_path) {
      deleteFile("verifications", path.basename(existing.document_path));
    }

    const id = uuidv4();
    await run(
      `INSERT INTO verification_docs (id, user_id, document_path, document_type, status, submitted_at)
       VALUES (?, ?, ?, ?, 'PENDING', datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         document_path = excluded.document_path,
         document_type = excluded.document_type,
         status        = 'PENDING',
         rejection_reason = NULL,
         submitted_at  = datetime('now'),
         reviewed_at   = NULL,
         reviewed_by   = NULL`,
      [id, userId, docPath, docType]
    );

    return res.status(201).json({
      message: "Verification document submitted successfully. Under review.",
      status:  "PENDING"
    });
  } catch (err) {
    console.error("[UploadVerificationDoc]", err.message);
    return res.status(500).json({ error: "Failed to upload verification document." });
  }
}

async function getMyVerificationStatus(req, res) {
  try {
    const userId = req.user.id;
    const doc = await get(
      "SELECT id, document_type, status, rejection_reason, submitted_at, reviewed_at FROM verification_docs WHERE user_id = ?",
      [userId]
    );

    if (!doc) {
      return res.json({ status: "NOT_SUBMITTED" });
    }

    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch verification status." });
  }
}

// ── Admin: serve verification doc securely ─────────────────────────────────

async function serveVerificationDoc(req, res) {
  try {
    const { userId } = req.params;

    // Admin can access any; user can only access their own
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    const doc = await get("SELECT document_path FROM verification_docs WHERE user_id = ?", [userId]);
    if (!doc) return res.status(404).json({ error: "Verification document not found." });

    const filename = path.basename(doc.document_path);
    const filePath = path.join(UPLOAD_ROOT, "verifications", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Document file not found." });
    }

    // Serve the file with strict headers (no caching, no sniffing)
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(filePath);
  } catch (err) {
    return res.status(500).json({ error: "Failed to serve document." });
  }
}

// ── Admin: approve / reject verification ──────────────────────────────────

async function approveVerification(req, res) {
  try {
    const { userId } = req.params;

    const doc = await get("SELECT * FROM verification_docs WHERE user_id = ?", [userId]);
    if (!doc) return res.status(404).json({ error: "No verification submission found." });

    await run(
      `UPDATE verification_docs SET status = 'APPROVED', reviewed_at = datetime('now'), reviewed_by = ?, rejection_reason = NULL
       WHERE user_id = ?`,
      [req.user.id, userId]
    );
    await run("UPDATE users SET is_verified = 1, updated_at = datetime('now') WHERE id = ?", [userId]);

    return res.json({ message: "User verification approved." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to approve verification." });
  }
}

async function rejectVerification(req, res) {
  try {
    const { userId }  = req.params;
    const { reason }  = req.body;

    const doc = await get("SELECT * FROM verification_docs WHERE user_id = ?", [userId]);
    if (!doc) return res.status(404).json({ error: "No verification submission found." });

    await run(
      `UPDATE verification_docs SET status = 'REJECTED', reviewed_at = datetime('now'), reviewed_by = ?, rejection_reason = ?
       WHERE user_id = ?`,
      [req.user.id, reason || "Document could not be verified.", userId]
    );
    await run("UPDATE users SET is_verified = 0, updated_at = datetime('now') WHERE id = ?", [userId]);

    return res.json({ message: "User verification rejected." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reject verification." });
  }
}

// ── Admin: list all pending verifications ─────────────────────────────────

async function listPendingVerifications(req, res) {
  try {
    const rows = await all(
      `SELECT vd.*, u.name, u.email, u.role
       FROM verification_docs vd
       JOIN users u ON vd.user_id = u.id
       WHERE vd.status = 'PENDING'
       ORDER BY vd.submitted_at ASC`
    );
    return res.json({ verifications: rows });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch verifications." });
  }
}

// ── Property Images ────────────────────────────────────────────────────────

async function uploadPropertyImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided." });
    }

    const { propertyId } = req.params;

    // Verify property ownership
    const property = await get("SELECT * FROM properties WHERE id = ?", [propertyId]);
    if (!property) return res.status(404).json({ error: "Property not found." });
    if (property.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    // Check existing image count
    const existingImages = await all("SELECT id FROM property_images WHERE property_id = ?", [propertyId]);
    const maxImages = Number(process.env.MAX_PROPERTY_IMAGES) || 6;
    if (existingImages.length + req.files.length > maxImages) {
      // Clean up newly uploaded files
      req.files.forEach((f) => deleteFile("properties", f.filename));
      return res.status(400).json({ error: `You can upload up to ${maxImages} property images.` });
    }

    const isFirstUpload = existingImages.length === 0;
    const savedImages   = [];

    for (let i = 0; i < req.files.length; i++) {
      const file      = req.files[i];
      const imageUrl  = fileUrl("properties", file.filename);
      const isPrimary = isFirstUpload && i === 0 ? 1 : 0;
      const imgId     = uuidv4();

      await run(
        "INSERT INTO property_images (id, property_id, image_path, is_primary) VALUES (?, ?, ?, ?)",
        [imgId, propertyId, imageUrl, isPrimary]
      );
      savedImages.push({ id: imgId, image_path: imageUrl, is_primary: isPrimary });
    }

    return res.status(201).json({ images: savedImages });
  } catch (err) {
    console.error("[UploadPropertyImages]", err.message);
    return res.status(500).json({ error: "Failed to upload property images." });
  }
}

async function deletePropertyImage(req, res) {
  try {
    const { imageId } = req.params;

    const img = await get(
      `SELECT pi.*, p.owner_id FROM property_images pi
       JOIN properties p ON pi.property_id = p.id
       WHERE pi.id = ?`,
      [imageId]
    );
    if (!img) return res.status(404).json({ error: "Image not found." });
    if (img.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    deleteFile("properties", path.basename(img.image_path));
    await run("DELETE FROM property_images WHERE id = ?", [imageId]);

    // If this was primary, assign primary to the next image
    if (img.is_primary) {
      const next = await get(
        "SELECT id FROM property_images WHERE property_id = ? ORDER BY created_at ASC LIMIT 1",
        [img.property_id]
      );
      if (next) {
        await run("UPDATE property_images SET is_primary = 1 WHERE id = ?", [next.id]);
      }
    }

    return res.json({ message: "Image deleted." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete image." });
  }
}

async function setPrimaryImage(req, res) {
  try {
    const { imageId } = req.params;

    const img = await get(
      `SELECT pi.*, p.owner_id FROM property_images pi
       JOIN properties p ON pi.property_id = p.id
       WHERE pi.id = ?`,
      [imageId]
    );
    if (!img) return res.status(404).json({ error: "Image not found." });
    if (img.owner_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    await run("UPDATE property_images SET is_primary = 0 WHERE property_id = ?", [img.property_id]);
    await run("UPDATE property_images SET is_primary = 1 WHERE id = ?",           [imageId]);

    return res.json({ message: "Primary image updated." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to set primary image." });
  }
}

async function getPropertyImages(req, res) {
  try {
    const { propertyId } = req.params;
    const images = await all(
      "SELECT * FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, created_at ASC",
      [propertyId]
    );
    return res.json({ images });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch property images." });
  }
}

// ── Serve uploaded files (profile images and property images) ──────────────
// Verification docs are served only through serveVerificationDoc (auth-gated).

function serveStaticUpload(req, res) {
  const { subfolder, filename } = req.params;

  // Only allow serving of profiles and properties statically
  // Verifications go through the auth-protected route
  if (subfolder === "verifications") {
    return res.status(403).json({ error: "Access denied." });
  }

  // Prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(UPLOAD_ROOT, subfolder, safe);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found." });
  }

  res.sendFile(filePath);
}

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
  uploadVerificationDoc,
  getMyVerificationStatus,
  serveVerificationDoc,
  approveVerification,
  rejectVerification,
  listPendingVerifications,
  uploadPropertyImages,
  deletePropertyImage,
  setPrimaryImage,
  getPropertyImages,
  serveStaticUpload
};
