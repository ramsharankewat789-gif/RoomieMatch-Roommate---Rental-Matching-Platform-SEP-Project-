/**
 * init.js — Creates all tables if they don't exist.
 * Run once with: node src/database/init.js
 * Also called automatically on server start.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { run } = require("./db");

async function initDatabase() {
  console.log("Initialising RoomieMatch database...");

  // ── Users ──────────────────────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      role          TEXT NOT NULL DEFAULT 'user',
      google_id     TEXT UNIQUE,
      profile_image TEXT,
      phone         TEXT,
      university    TEXT,
      major         TEXT,
      age           INTEGER DEFAULT 20,
      gender        TEXT DEFAULT 'Other',
      budget        TEXT DEFAULT '$500 - $1,000',
      bio           TEXT DEFAULT '',
      hobbies       TEXT DEFAULT '[]',
      preferences   TEXT DEFAULT '{}',
      is_verified   INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    )
  `);

  // ── OTP Verifications ──────────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id           TEXT PRIMARY KEY,
      user_id      TEXT,
      email        TEXT NOT NULL,
      otp_hash     TEXT NOT NULL,
      expires_at   TEXT NOT NULL,
      attempts     INTEGER DEFAULT 0,
      verified     INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now')),
      verified_at  TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_otp_user  ON otp_verifications(user_id)`);

  // ── Identity Verification Documents ───────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS verification_docs (
      id               TEXT PRIMARY KEY,
      user_id          TEXT NOT NULL UNIQUE,
      document_path    TEXT NOT NULL,
      document_type    TEXT NOT NULL,
      status           TEXT NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT,
      submitted_at     TEXT DEFAULT (datetime('now')),
      reviewed_at      TEXT,
      reviewed_by      TEXT,
      FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_vdoc_status ON verification_docs(status)`);

  // ── Properties ─────────────────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS properties (
      id             TEXT PRIMARY KEY,
      owner_id       TEXT NOT NULL,
      title          TEXT NOT NULL,
      address        TEXT NOT NULL,
      city           TEXT NOT NULL DEFAULT 'Metro City',
      type           TEXT NOT NULL DEFAULT 'Apartment',
      bedrooms       INTEGER DEFAULT 1,
      bathrooms      REAL DEFAULT 1,
      price          REAL NOT NULL,
      deposit        REAL DEFAULT 0,
      description    TEXT DEFAULT '',
      amenities      TEXT DEFAULT '[]',
      rules          TEXT DEFAULT '[]',
      available_from TEXT,
      status         TEXT NOT NULL DEFAULT 'active',
      is_verified    INTEGER DEFAULT 0,
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ── Property Images ────────────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS property_images (
      id          TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      image_path  TEXT NOT NULL,
      is_primary  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_propimg_property ON property_images(property_id)`);

  // ── Google Auth Tokens (pending OTP state) ─────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS google_auth_pending (
      id            TEXT PRIMARY KEY,
      google_id     TEXT NOT NULL,
      email         TEXT NOT NULL,
      name          TEXT,
      picture_url   TEXT,
      email_verified INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      expires_at    TEXT NOT NULL
    )
  `);

  console.log("Database initialised successfully.");
}

module.exports = { initDatabase };

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
