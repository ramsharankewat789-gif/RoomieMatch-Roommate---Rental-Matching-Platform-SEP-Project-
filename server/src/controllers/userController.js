/**
 * userController.js — User profile management.
 *
 * Endpoints:
 *   GET    /api/users              Admin: paginated list of all users
 *   GET    /api/users/:id          Get a single user profile (public fields)
 *   PATCH  /api/users/:id          Update own profile (auth required)
 *   DELETE /api/users/:id          Admin: delete a user account
 *   GET    /api/users/:id/verification  Get verification status (owner or admin)
 *
 * Role rules:
 *   - Any authenticated user can view public profiles.
 *   - Only the account owner or an admin can PATCH.
 *   - Only admins can DELETE or list all users.
 */
const { run, get, all, execute } = require("../database/db");

function isoDate(v) {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : v;
}

// ── Build full user response (same helper as authController) ───────────────
async function buildUserResponse(userId) {
  const user = await get("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) return null;

  const { password_hash, ...safe } = user;

  safe.created_at = isoDate(safe.created_at);
  safe.updated_at = isoDate(safe.updated_at);

  const prefs = await get(
    "SELECT smoke, pet, cleanliness, sleep_schedule, social_life, cooking, drinking, guests, food, working_hours FROM user_preferences WHERE user_id = ?",
    [userId]
  );
  safe.preferences = prefs
    ? { smoke: prefs.smoke, pet: prefs.pet, clean: prefs.cleanliness,
        sleep: prefs.sleep_schedule, social: prefs.social_life, cooking: prefs.cooking,
        drinking: prefs.drinking, guests: prefs.guests, food: prefs.food,
        working_hours: prefs.working_hours }
    : {};

  const hobbyRows = await all("SELECT hobby FROM user_hobbies WHERE user_id = ? ORDER BY id", [userId]);
  safe.hobbies = hobbyRows.map(r => r.hobby);

  const vdoc = await get(
    "SELECT status, document_type, submitted_at FROM verification_docs WHERE user_id = ?",
    [userId]
  );
  safe.verificationDoc = vdoc
    ? { status: vdoc.status, type: vdoc.document_type, submittedAt: isoDate(vdoc.submitted_at) }
    : { status: "NOT_SUBMITTED" };

  return safe;
}

// ── GET /api/users ────────────────────────────────────────────────────────
// Admin: full list with all fields, all users
// Authenticated non-admin: public-safe subset for roommate matching
async function listUsers(req, res) {
  try {
    const isAdmin = req.user?.role === "admin";
    const page    = Math.max(1, parseInt(req.query.page)  || 1);
    const limit   = Math.min(100, parseInt(req.query.limit) || 20);
    const offset  = (page - 1) * limit;

    const search     = req.query.search ? `%${req.query.search}%` : null;
    const roleFilter = req.query.role   || null;

    let whereClauses = [];
    let params       = [];

    if (search) {
      whereClauses.push("(u.name LIKE ? OR u.email LIKE ?)");
      params.push(search, search);
    }
    if (roleFilter) {
      whereClauses.push("u.role = ?");
      params.push(roleFilter);
    }

    // Non-admin callers only see other normal users (not admins, not themselves)
    if (!isAdmin) {
      whereClauses.push("u.role = 'user'");
      whereClauses.push("u.id != ?");
      params.push(req.user.id);
    }

    const where = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

    const [countRow] = await all(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    );

    // Admin gets email + verification status; non-admin gets public-safe fields only
    const selectCols = isAdmin
      ? `u.id, u.name, u.email, u.role, u.profile_image,
         u.phone, u.is_verified, u.email_verified, u.created_at,
         vd.status AS verification_status`
      : `u.id, u.name, u.role, u.profile_image,
         u.university, u.major, u.age, u.gender,
         u.budget_min, u.budget_max, u.bio, u.is_verified,
         p.smoke, p.pet, p.cleanliness, p.sleep_schedule, p.social_life, p.cooking`;

    const joinCols = isAdmin
      ? `LEFT JOIN verification_docs vd ON vd.user_id = u.id`
      : `LEFT JOIN user_preferences p ON p.user_id = u.id`;

    const users = await all(
      `SELECT ${selectCols}
       FROM users u
       ${joinCols}
       ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // For non-admin, reshape preferences into nested object and fetch hobbies
    let shaped = users;
    if (!isAdmin) {
      shaped = await Promise.all(users.map(async u => {
        const hobbyRows = await all(
          "SELECT hobby FROM user_hobbies WHERE user_id = ? ORDER BY id", [u.id]
        );
        return {
          id:           u.id,
          name:         u.name,
          role:         u.role,
          profile_image: u.profile_image,
          university:   u.university,
          major:        u.major,
          age:          u.age,
          gender:       u.gender,
          budget_min:   u.budget_min,
          budget_max:   u.budget_max,
          bio:          u.bio,
          is_verified:  u.is_verified,
          hobbies:      hobbyRows.map(r => r.hobby),
          preferences: {
            smoke:   u.smoke,
            pet:     u.pet,
            clean:   u.cleanliness,
            sleep:   u.sleep_schedule,
            social:  u.social_life,
            cooking: u.cooking,
          }
        };
      }));
    } else {
      shaped = users.map(u => ({ ...u, created_at: isoDate(u.created_at) }));
    }

    return res.json({
      users: shaped,
      pagination: {
        total: countRow?.total || 0,
        page, limit,
        pages: Math.ceil((countRow?.total || 0) / limit)
      }
    });
  } catch (err) {
    console.error("[ListUsers]", err.message);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
}

// ── GET /api/users/:id ─────────────────────────────────────────────────────
async function getUser(req, res) {
  try {
    const user = await buildUserResponse(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Non-admin callers don't see email_verified or raw google_id
    if (req.user?.role !== "admin" && req.user?.id !== req.params.id) {
      delete user.google_id;
      delete user.email_verified;
    }

    return res.json({ user });
  } catch (err) {
    console.error("[GetUser]", err.message);
    return res.status(500).json({ error: "Failed to fetch user." });
  }
}

// ── PATCH /api/users/:id ───────────────────────────────────────────────────
async function updateUser(req, res) {
  try {
    const { id }     = req.params;
    const requesterId = req.user.id;
    const isAdmin     = req.user.role === "admin";

    if (!isAdmin && requesterId !== id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const existing = await get("SELECT id FROM users WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "User not found." });

    const {
      name, phone, university, major,
      age, gender, city, budget_min, budget_max, bio,
      // preferences
      smoke, pet, clean, sleep, social, cooking, drinking, guests, food, working_hours,
      // hobbies
      hobbies
    } = req.body;

    // Build dynamic SET clause for users table
    const userUpdates = [];
    const userParams  = [];

    if (name       !== undefined) { userUpdates.push("name = ?");       userParams.push(name.trim()); }
    if (phone      !== undefined) { userUpdates.push("phone = ?");      userParams.push(phone || null); }
    if (university !== undefined) { userUpdates.push("university = ?"); userParams.push(university || null); }
    if (major      !== undefined) { userUpdates.push("major = ?");      userParams.push(major || null); }
    if (age        !== undefined) { userUpdates.push("age = ?");        userParams.push(Number(age) || null); }
    if (gender     !== undefined) { userUpdates.push("gender = ?");     userParams.push(gender || null); }
    if (city       !== undefined) { userUpdates.push("city = ?");       userParams.push(city || null); }
    if (budget_min !== undefined) { userUpdates.push("budget_min = ?"); userParams.push(Number(budget_min) || null); }
    if (budget_max !== undefined) { userUpdates.push("budget_max = ?"); userParams.push(Number(budget_max) || null); }
    if (bio        !== undefined) { userUpdates.push("bio = ?");        userParams.push(bio || null); }

    if (userUpdates.length > 0) {
      userParams.push(id);
      await run(
        `UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?`,
        userParams
      );
    }

    // Update preferences if any preference fields supplied
    const prefFields = { smoke, pet, clean, sleep, social, cooking, drinking, guests, food, working_hours };
    const prefUpdates = [];
    const prefParams  = [];

    const prefColumnMap = {
      smoke: "smoke", pet: "pet", clean: "cleanliness",
      sleep: "sleep_schedule", social: "social_life", cooking: "cooking",
      drinking: "drinking", guests: "guests", food: "food",
      working_hours: "working_hours"
    };

    for (const [key, col] of Object.entries(prefColumnMap)) {
      if (prefFields[key] !== undefined) {
        prefUpdates.push(`${col} = ?`);
        prefParams.push(prefFields[key]);
      }
    }

    if (prefUpdates.length > 0) {
      prefParams.push(id);
      // Ensure preferences row exists first
      await run("INSERT IGNORE INTO user_preferences (user_id) VALUES (?)", [id]);
      await run(
        `UPDATE user_preferences SET ${prefUpdates.join(", ")} WHERE user_id = ?`,
        prefParams
      );
    }

    // Replace hobbies if supplied (delete all then re-insert)
    if (Array.isArray(hobbies)) {
      await run("DELETE FROM user_hobbies WHERE user_id = ?", [id]);
      for (const hobby of hobbies) {
        const h = hobby.trim();
        if (h) {
          await run(
            "INSERT IGNORE INTO user_hobbies (user_id, hobby) VALUES (?, ?)",
            [id, h]
          );
        }
      }
    }

    const updated = await buildUserResponse(id);
    return res.json({ user: updated });
  } catch (err) {
    console.error("[UpdateUser]", err.message);
    return res.status(500).json({ error: "Failed to update profile." });
  }
}

// ── DELETE /api/users/:id  (admin only) ────────────────────────────────────
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: "Admins cannot delete their own account via this endpoint." });
    }

    const existing = await get("SELECT id FROM users WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "User not found." });

    await run("DELETE FROM users WHERE id = ?", [id]);

    return res.json({ message: "User account deleted." });
  } catch (err) {
    console.error("[DeleteUser]", err.message);
    return res.status(500).json({ error: "Failed to delete user." });
  }
}

// ── PATCH /api/users/:id/block  (admin only) ──────────────────────────────
async function blockUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: "Admins cannot block their own account." });
    }

    const existing = await get("SELECT id, name, role FROM users WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "User not found." });
    if (existing.role === "admin") {
      return res.status(400).json({ error: "Admin accounts cannot be blocked." });
    }

    await run("UPDATE users SET is_blocked = 1 WHERE id = ?", [id]);

    return res.json({ message: `${existing.name} has been blocked.` });
  } catch (err) {
    console.error("[BlockUser]", err.message);
    return res.status(500).json({ error: "Failed to block user." });
  }
}

// ── PATCH /api/users/:id/unblock  (admin only) ────────────────────────────
async function unblockUser(req, res) {
  try {
    const { id } = req.params;

    const existing = await get("SELECT id, name FROM users WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "User not found." });

    await run("UPDATE users SET is_blocked = 0 WHERE id = ?", [id]);

    return res.json({ message: `${existing.name} has been unblocked.` });
  } catch (err) {
    console.error("[UnblockUser]", err.message);
    return res.status(500).json({ error: "Failed to unblock user." });
  }
}

// ── GET /api/users/:id/verification  (owner or admin) ─────────────────────
async function getUserVerification(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const doc = await get(
      `SELECT id, document_type, status, rejection_reason,
              submitted_at, reviewed_at
       FROM verification_docs WHERE user_id = ?`,
      [id]
    );

    if (!doc) return res.json({ status: "NOT_SUBMITTED" });

    return res.json({
      ...doc,
      submitted_at: isoDate(doc.submitted_at),
      reviewed_at:  isoDate(doc.reviewed_at)
    });
  } catch (err) {
    console.error("[GetUserVerification]", err.message);
    return res.status(500).json({ error: "Failed to fetch verification." });
  }
}

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserVerification,
  buildUserResponse,
  blockUser,
  unblockUser,
};
