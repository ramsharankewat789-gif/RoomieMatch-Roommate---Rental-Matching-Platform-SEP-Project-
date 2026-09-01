/**
 * migrate.js — Creates the RoomieMatch MySQL database schema.
 *
 * Run:  npm run db:migrate
 *
 * Safe to run multiple times — all statements use CREATE TABLE IF NOT EXISTS.
 * Tables are created in dependency order (parents before children).
 */
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const mysql = require("mysql2/promise");

async function migrate() {
  // Connect without specifying a database first so we can CREATE it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const db = process.env.DB_NAME || "roomiematch";
  console.log(`[Migrate] Creating database '${db}' if it does not exist...`);
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.query(`USE \`${db}\``);
  console.log(`[Migrate] Using database '${db}'.`);

  const tables = [
    // ── 1. users ──────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS users (
      id             VARCHAR(36)   NOT NULL,
      name           VARCHAR(255)  NOT NULL,
      email          VARCHAR(255)  NOT NULL,
      password_hash  VARCHAR(255)  NULL         COMMENT 'NULL for Google-only accounts',
      role           ENUM('user','admin') NOT NULL DEFAULT 'user',
      google_id      VARCHAR(255)  NULL,
      profile_image  VARCHAR(500)  NULL,
      phone          VARCHAR(50)   NULL,
      university     VARCHAR(255)  NULL,
      major          VARCHAR(255)  NULL,
      age            TINYINT UNSIGNED NULL,
      gender         VARCHAR(50)   NULL,
      city           VARCHAR(100)  NULL,
      budget_min     INT UNSIGNED  NULL,
      budget_max     INT UNSIGNED  NULL,
      bio            TEXT          NULL,
      is_verified    TINYINT(1)    NOT NULL DEFAULT 0,
      is_blocked     TINYINT(1)    NOT NULL DEFAULT 0,
      email_verified TINYINT(1)    NOT NULL DEFAULT 0,
      created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_email     (email),
      UNIQUE KEY uq_google_id (google_id),
      INDEX idx_role          (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 2. user_preferences ───────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS user_preferences (
      id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      user_id        VARCHAR(36)   NOT NULL,
      smoke          VARCHAR(50)   NOT NULL DEFAULT 'No',
      pet            VARCHAR(100)  NOT NULL DEFAULT 'No Pets',
      cleanliness    VARCHAR(50)   NOT NULL DEFAULT 'Medium',
      sleep_schedule VARCHAR(50)   NOT NULL DEFAULT 'Early Bird',
      social_life    VARCHAR(50)   NOT NULL DEFAULT 'Medium',
      cooking        VARCHAR(50)   NOT NULL DEFAULT 'Sometimes',
      drinking       VARCHAR(50)   NOT NULL DEFAULT 'No',
      guests         VARCHAR(50)   NOT NULL DEFAULT 'Occasionally',
      food           VARCHAR(50)   NOT NULL DEFAULT 'No Preference',
      working_hours  VARCHAR(50)   NOT NULL DEFAULT 'Regular Hours',
      updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_user (user_id),
      CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 3. user_hobbies ───────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS user_hobbies (
      id       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      user_id  VARCHAR(36)   NOT NULL,
      hobby    VARCHAR(100)  NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_user_hobby (user_id, hobby),
      INDEX idx_user (user_id),
      CONSTRAINT fk_hobby_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 4. password_reset_tokens ──────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id          VARCHAR(36)   NOT NULL,
      user_id     VARCHAR(36)   NOT NULL,
      token_hash  VARCHAR(255)  NOT NULL,
      expires_at  DATETIME      NOT NULL,
      used        TINYINT(1)    NOT NULL DEFAULT 0,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_token   (token_hash),
      INDEX idx_user    (user_id),
      CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 5. otp_verifications ──────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS otp_verifications (
      id          VARCHAR(36)   NOT NULL,
      user_id     VARCHAR(36)   NULL         COMMENT 'NULL until user is created',
      email       VARCHAR(255)  NOT NULL,
      otp_hash    VARCHAR(255)  NOT NULL,
      expires_at  DATETIME      NOT NULL,
      attempts    TINYINT       NOT NULL DEFAULT 0,
      verified    TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '0=pending 1=verified -1=invalidated',
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      verified_at DATETIME      NULL,
      PRIMARY KEY (id),
      INDEX idx_email (email),
      INDEX idx_user  (user_id),
      CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 6. google_auth_pending ─────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS google_auth_pending (
      id             VARCHAR(36)   NOT NULL,
      google_id      VARCHAR(255)  NOT NULL,
      email          VARCHAR(255)  NOT NULL,
      name           VARCHAR(255)  NULL,
      picture_url    VARCHAR(500)  NULL,
      email_verified TINYINT(1)    NOT NULL DEFAULT 0,
      expires_at     DATETIME      NOT NULL,
      created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_email   (email),
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 7. verification_docs ──────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS verification_docs (
      id               VARCHAR(36)   NOT NULL,
      user_id          VARCHAR(36)   NOT NULL,
      document_path    VARCHAR(500)  NOT NULL,
      document_type    VARCHAR(100)  NOT NULL,
      status           ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT          NULL,
      submitted_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at      DATETIME      NULL,
      reviewed_by      VARCHAR(36)   NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_user   (user_id),
      INDEX idx_status     (status),
      CONSTRAINT fk_vdoc_user     FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_vdoc_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 8. properties ─────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS properties (
      id             VARCHAR(36)   NOT NULL,
      owner_id       VARCHAR(36)   NOT NULL,
      title          VARCHAR(255)  NOT NULL,
      address        VARCHAR(500)  NOT NULL,
      city           VARCHAR(100)  NOT NULL DEFAULT 'Metro City',
      latitude       DECIMAL(10,7) NULL,
      longitude      DECIMAL(10,7) NULL,
      type           ENUM('Apartment','Townhouse','Studio','House') NOT NULL DEFAULT 'Apartment',
      bedrooms       TINYINT UNSIGNED NOT NULL DEFAULT 1,
      bathrooms      DECIMAL(3,1)  NOT NULL DEFAULT 1.0,
      price          DECIMAL(10,2) NOT NULL,
      deposit        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      description    TEXT          NULL,
      available_from DATE          NULL,
      status         ENUM('active','rented','inactive') NOT NULL DEFAULT 'active',
      is_verified    TINYINT(1)    NOT NULL DEFAULT 0,
      created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_owner    (owner_id),
      INDEX idx_status   (status),
      INDEX idx_city     (city),
      INDEX idx_price    (price),
      INDEX idx_verified (is_verified),
      CONSTRAINT fk_prop_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 9. property_amenities ─────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS property_amenities (
      id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      property_id VARCHAR(36)   NOT NULL,
      amenity     VARCHAR(100)  NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_prop_amenity (property_id, amenity),
      INDEX idx_property (property_id),
      CONSTRAINT fk_amenity_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 10. property_rules ────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS property_rules (
      id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      property_id VARCHAR(36)   NOT NULL,
      rule        VARCHAR(255)  NOT NULL,
      PRIMARY KEY (id),
      INDEX idx_property (property_id),
      CONSTRAINT fk_rule_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 11. property_images ───────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS property_images (
      id          VARCHAR(36)   NOT NULL,
      property_id VARCHAR(36)   NOT NULL,
      image_path  VARCHAR(500)  NOT NULL,
      is_primary  TINYINT(1)    NOT NULL DEFAULT 0,
      sort_order  TINYINT       NOT NULL DEFAULT 0,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_property (property_id),
      CONSTRAINT fk_img_prop FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 12. applications ──────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS applications (
      id          VARCHAR(36)   NOT NULL,
      property_id VARCHAR(36)   NOT NULL,
      tenant_id   VARCHAR(36)   NOT NULL,
      owner_id    VARCHAR(36)   NOT NULL,
      status      ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
      message     TEXT          NULL,
      applied_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_tenant_property (tenant_id, property_id),
      INDEX idx_tenant    (tenant_id),
      INDEX idx_owner     (owner_id),
      INDEX idx_property  (property_id),
      INDEX idx_status    (status),
      CONSTRAINT fk_app_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      CONSTRAINT fk_app_tenant   FOREIGN KEY (tenant_id)   REFERENCES users(id)       ON DELETE CASCADE,
      CONSTRAINT fk_app_owner    FOREIGN KEY (owner_id)    REFERENCES users(id)        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 13. application_history ───────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS application_history (
      id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      application_id VARCHAR(36)   NOT NULL,
      status         VARCHAR(50)   NOT NULL,
      label          VARCHAR(255)  NOT NULL,
      changed_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_application (application_id),
      CONSTRAINT fk_history_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 14. conversations ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS conversations (
      id          VARCHAR(36)   NOT NULL,
      property_id VARCHAR(36)   NULL,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_property (property_id),
      CONSTRAINT fk_conv_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 15. conversation_participants ─────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS conversation_participants (
      id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      conversation_id VARCHAR(36)   NOT NULL,
      user_id         VARCHAR(36)   NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_conv_user (conversation_id, user_id),
      INDEX idx_user (user_id),
      CONSTRAINT fk_cp_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      CONSTRAINT fk_cp_user FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 16. messages ──────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS messages (
      id              VARCHAR(36)   NOT NULL,
      conversation_id VARCHAR(36)   NOT NULL,
      sender_id       VARCHAR(36)   NOT NULL,
      body            TEXT          NOT NULL,
      is_read         TINYINT(1)    NOT NULL DEFAULT 0,
      created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_conversation (conversation_id),
      INDEX idx_sender       (sender_id),
      INDEX idx_created      (created_at),
      CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 17. notifications ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS notifications (
      id           VARCHAR(36)   NOT NULL,
      user_id      VARCHAR(36)   NOT NULL,
      title        VARCHAR(255)  NOT NULL,
      message      TEXT          NOT NULL,
      type         ENUM('message','application','verification','general') NOT NULL DEFAULT 'general',
      reference_id VARCHAR(36)   NULL,
      is_read      TINYINT(1)    NOT NULL DEFAULT 0,
      created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_user      (user_id),
      INDEX idx_read      (user_id, is_read),
      INDEX idx_created   (created_at),
      CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 18. reviews ───────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS reviews (
      id               VARCHAR(36)   NOT NULL,
      reviewer_id      VARCHAR(36)   NOT NULL,
      target_property  VARCHAR(36)   NULL  COMMENT 'Set for property reviews',
      target_user      VARCHAR(36)   NULL  COMMENT 'Set for roommate reviews',
      rating           DECIMAL(2,1)  NOT NULL,
      comment          TEXT          NULL,
      created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_reviewer       (reviewer_id),
      INDEX idx_target_prop    (target_property),
      INDEX idx_target_user    (target_user),
      CONSTRAINT fk_rev_reviewer FOREIGN KEY (reviewer_id)     REFERENCES users(id)       ON DELETE CASCADE,
      CONSTRAINT fk_rev_property FOREIGN KEY (target_property) REFERENCES properties(id)  ON DELETE CASCADE,
      CONSTRAINT fk_rev_user     FOREIGN KEY (target_user)     REFERENCES users(id)       ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 19. reports ───────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS reports (
      id                    VARCHAR(36)   NOT NULL,
      reporter_id           VARCHAR(36)   NOT NULL,
      reported_user_id      VARCHAR(36)   NULL,
      reported_property_id  VARCHAR(36)   NULL,
      title                 VARCHAR(255)  NOT NULL,
      reason                TEXT          NOT NULL,
      status                ENUM('pending','resolved','dismissed') NOT NULL DEFAULT 'pending',
      resolution            TEXT          NULL,
      created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at           DATETIME      NULL,
      resolved_by           VARCHAR(36)   NULL,
      PRIMARY KEY (id),
      INDEX idx_status      (status),
      INDEX idx_reporter    (reporter_id),
      CONSTRAINT fk_rep_reporter  FOREIGN KEY (reporter_id)          REFERENCES users(id)      ON DELETE CASCADE,
      CONSTRAINT fk_rep_user      FOREIGN KEY (reported_user_id)     REFERENCES users(id)      ON DELETE SET NULL,
      CONSTRAINT fk_rep_property  FOREIGN KEY (reported_property_id) REFERENCES properties(id) ON DELETE SET NULL,
      CONSTRAINT fk_rep_resolver  FOREIGN KEY (resolved_by)          REFERENCES users(id)      ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 20. favourites ────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS favourites (
      id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      user_id     VARCHAR(36)   NOT NULL,
      property_id VARCHAR(36)   NOT NULL,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_user_property (user_id, property_id),
      INDEX idx_user (user_id),
      CONSTRAINT fk_fav_user     FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
      CONSTRAINT fk_fav_property FOREIGN KEY (property_id) REFERENCES properties(id)  ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 21. email_verification_tokens ─────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id          VARCHAR(36)   NOT NULL,
      user_id     VARCHAR(36)   NOT NULL,
      token_hash  VARCHAR(255)  NOT NULL,
      expires_at  DATETIME      NOT NULL,
      used        TINYINT(1)    NOT NULL DEFAULT 0,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_token (token_hash),
      INDEX idx_user  (user_id),
      CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // ── 22. compatibility_scores ───────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS compatibility_scores (
      id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
      user_id          VARCHAR(36)   NOT NULL,
      candidate_id     VARCHAR(36)   NOT NULL,
      score            TINYINT UNSIGNED NOT NULL DEFAULT 0,
      budget_score     TINYINT UNSIGNED NOT NULL DEFAULT 0,
      lifestyle_score  TINYINT UNSIGNED NOT NULL DEFAULT 0,
      interests_score  TINYINT UNSIGNED NOT NULL DEFAULT 0,
      calculated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_pair (user_id, candidate_id),
      INDEX idx_user  (user_id),
      INDEX idx_score (user_id, score DESC),
      CONSTRAINT fk_cs_user      FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_cs_candidate FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  // ── 21. email_verification_tokens ──────────────────────────────────
  // (This block was erroneously placed — moved to proper array entry above)

  let created = 0;
  for (const ddl of tables) {
    const tableName =
      (ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/) || [])[1] || "?";
    try {
      await conn.query(ddl);
      console.log(`  ✓ ${tableName}`);
      created++;
    } catch (err) {
      console.error(`  ✗ ${tableName}: ${err.message}`);
      throw err;
    }
  }

  console.log(`\n[Migrate] Done — ${created}/${tables.length} tables ready.\n`);
  await conn.end();
}

migrate().catch((err) => {
  console.error("\n[Migrate] FAILED:", err.message);
  process.exit(1);
});
