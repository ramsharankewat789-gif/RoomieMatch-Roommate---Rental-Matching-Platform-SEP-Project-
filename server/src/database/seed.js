/**
 * seed.js — Populates the roomiematch database with demo data.
 *
 * Run:  npm run db:seed
 *
 * Safe to re-run — uses INSERT IGNORE / ON DUPLICATE KEY UPDATE so existing
 * rows are never duplicated. Wipe with: DROP DATABASE roomiematch; npm run db:migrate
 *
 * All users share the same unified 'user' role — every account can both
 * search/apply for properties AND list/manage their own properties.
 *
 * Demo accounts (password: password123):
 *   admin@roomiematch.com  → Admin panel
 *   alex@user.com          → Regular user
 *   sarah@user.com         → Regular user (has listed properties)
 *   marcus@user.com        → Regular user
 *   chloe@user.com         → Regular user (unverified)
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");

// ── helpers ────────────────────────────────────────────────────────────────
async function hash(plain) {
  return bcrypt.hash(plain, 10);
}

// Fixed UUIDs so re-runs are idempotent
const ID = {
  admin:   "00000000-0000-0000-0000-000000000001",
  alex:    "00000000-0000-0000-0000-000000000002",
  sarah:   "00000000-0000-0000-0000-000000000003",
  marcus:  "00000000-0000-0000-0000-000000000004",
  chloe:   "00000000-0000-0000-0000-000000000005",
  prop1:   "00000000-0000-0000-1000-000000000001",
  prop2:   "00000000-0000-0000-1000-000000000002",
  prop3:   "00000000-0000-0000-1000-000000000003",
  prop4:   "00000000-0000-0000-1000-000000000004",
  app1:    "00000000-0000-0000-2000-000000000001",
  app2:    "00000000-0000-0000-2000-000000000002",
};

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "roomiematch",
    multipleStatements: true,
  });

  console.log("[Seed] Connected to MySQL.\n");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("[Seed] Inserting users...");
  const pw = await hash("password123");

  const users = [
    // id, name, email, password_hash, role, phone, university, major, age, gender, budget_min, budget_max, bio, is_verified, email_verified
    [
      ID.admin, "Alex Admin", "admin@roomiematch.com", pw,
      "admin", "+1 (555) 015-8899",
      null, null, null, null, null, null,
      "Platform administrator.",
      1, 1
    ],
    [
      ID.alex, "Alex Mercer", "alex@user.com", pw,
      "user", "+1 (555) 019-9234",
      "State University", "Computer Science", 21, "Male", 800, 1200,
      "CS junior looking for a quiet study space and a friendly roommate. I enjoy hiking, coding side projects, and cooking.",
      1, 1
    ],
    [
      ID.sarah, "Sarah Jenkins", "sarah@user.com", pw,
      "user", "+1 (555) 012-3456",
      "City College", "Business Management", 28, "Female", 1000, 1500,
      "Experienced with property management and happy to help students find great housing near campus.",
      1, 1
    ],
    [
      ID.marcus, "Marcus Brody", "marcus@user.com", pw,
      "user", "+1 (555) 014-4589",
      "State University", "Business Administration", 22, "Male", 900, 1300,
      "Outgoing senior in business. Very active, loves soccer, and is looking for a roommate who doesn't mind occasional study groups.",
      1, 1
    ],
    [
      ID.chloe, "Chloe Henderson", "chloe@user.com", pw,
      "user", "+1 (555) 017-7722",
      "State University", "Graphic Design", 20, "Female", 700, 1050,
      "Sophomore doing graphic design. I keep my space very clean and decorated. Love indoor plants, cafe hopping, and indie music.",
      0, 1
    ],
  ];

  for (const u of users) {
    await conn.execute(
      `INSERT INTO users
         (id, name, email, password_hash, role, phone,
          university, major, age, gender, budget_min, budget_max, bio,
          is_verified, email_verified)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), email=VALUES(email)`,
      u
    );
  }
  console.log(`  ✓ ${users.length} users`);

  // ── 2. User preferences ───────────────────────────────────────────────────
  console.log("[Seed] Inserting user preferences...");
  const prefs = [
    // user_id, smoke, pet, cleanliness, sleep_schedule, social_life, cooking
    [ID.admin,  "No", "No Pets",            "Medium", "Early Bird", "Medium",   "Sometimes"],
    [ID.alex,   "No", "No Pets",            "High",   "Night Owl",  "Medium",   "Often"],
    [ID.sarah,  "No", "Pets Allowed",       "High",   "Early Bird", "Medium",   "Sometimes"],
    [ID.marcus, "No", "Pets Allowed",       "Medium", "Early Bird", "High",     "Sometimes"],
    [ID.chloe,  "No", "Dog or Cat Allowed", "High",   "Night Owl",  "High",     "Often"],
  ];
  for (const p of prefs) {
    await conn.execute(
      `INSERT INTO user_preferences (user_id, smoke, pet, cleanliness, sleep_schedule, social_life, cooking)
       VALUES (?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE smoke=VALUES(smoke)`,
      p
    );
  }
  console.log(`  ✓ ${prefs.length} preference rows`);

  // ── 3. User hobbies ───────────────────────────────────────────────────────
  console.log("[Seed] Inserting hobbies...");
  const hobbies = [
    [ID.alex,   "Coding"],
    [ID.alex,   "Hiking"],
    [ID.alex,   "Cooking"],
    [ID.alex,   "Board Games"],
    [ID.sarah,  "Real Estate"],
    [ID.sarah,  "Gardening"],
    [ID.sarah,  "Cooking"],
    [ID.marcus, "Soccer"],
    [ID.marcus, "Netflix"],
    [ID.marcus, "Cooking"],
    [ID.marcus, "Photography"],
    [ID.chloe,  "Painting"],
    [ID.chloe,  "Indoor Plants"],
    [ID.chloe,  "Indie Music"],
    [ID.chloe,  "Thrifting"],
  ];
  for (const h of hobbies) {
    await conn.execute(
      "INSERT IGNORE INTO user_hobbies (user_id, hobby) VALUES (?,?)",
      h
    );
  }
  console.log(`  ✓ ${hobbies.length} hobby rows`);

  // ── 4. Verification docs ──────────────────────────────────────────────────
  console.log("[Seed] Inserting verification docs...");
  const vdocs = [
    // id, user_id, document_path, document_type, status, reviewed_by
    [uuidv4(), ID.alex,   "/api/uploads/verifications/demo-alex.pdf",   "ID Document", "APPROVED", ID.admin],
    [uuidv4(), ID.sarah,  "/api/uploads/verifications/demo-sarah.pdf",  "ID Document", "APPROVED", ID.admin],
    [uuidv4(), ID.marcus, "/api/uploads/verifications/demo-marcus.pdf", "ID Document", "APPROVED", ID.admin],
    [uuidv4(), ID.chloe,  "/api/uploads/verifications/demo-chloe.pdf",  "ID Document", "PENDING",  null],
  ];
  for (const d of vdocs) {
    await conn.execute(
      `INSERT INTO verification_docs
         (id, user_id, document_path, document_type, status, submitted_at, reviewed_at, reviewed_by)
       VALUES (?, ?, ?, ?, ?, NOW(), ${d[5] ? "NOW()" : "NULL"}, ?)
       ON DUPLICATE KEY UPDATE status=VALUES(status)`,
      [d[0], d[1], d[2], d[3], d[4], d[5]]
    );
  }
  console.log(`  ✓ ${vdocs.length} verification doc rows`);

  // ── 5. Properties ─────────────────────────────────────────────────────────
  console.log("[Seed] Inserting properties...");
  const properties = [
    // id, owner_id, title, address, city, type, bedrooms, bathrooms, price, deposit, description, available_from, status, is_verified
    [
      ID.prop1, ID.sarah,
      "University Gardens Apartment",
      "104 University Ave, Suite 3B",
      "Metro City", "Apartment", 2, 2.0, 950.00, 950.00,
      "Spacious 2-bedroom apartment just a short 5-minute walk to the main gates of State University. Fully furnished kitchen, central heating & air conditioning, high-speed fiber internet, and on-site laundry facilities. Quiet building perfect for studious tenants.",
      "2026-09-01", "active", 1
    ],
    [
      ID.prop2, ID.sarah,
      "Modern Townhouse with Backyard",
      "452 Maple Street",
      "Metro City", "Townhouse", 3, 2.5, 1250.00, 1250.00,
      "Beautiful 3-bedroom, 2.5-bathroom townhouse with a modern open-concept kitchen, hardwood floors, and a lovely fenced backyard. Private parking included. Utilities (water/gas) are partially included in rent.",
      "2026-09-15", "active", 1
    ],
    [
      ID.prop3, ID.sarah,
      "Cozy Studio near Library",
      "88 College Road, Apt 1A",
      "Metro City", "Studio", 1, 1.0, 750.00, 750.00,
      "Cozy studio apartment situated right next to the campus library and student union center. Features a kitchenette, modern bathroom, and pull-down Murphy bed. Ideal for single graduate students or busy juniors.",
      "2026-10-01", "active", 0
    ],
    [
      ID.prop4, ID.sarah,
      "Sunny 4-Bed Student House",
      "17 Oak Lane",
      "Metro City", "House", 4, 2.0, 1800.00, 1800.00,
      "Bright 4-bedroom house perfect for a group of students. Large communal kitchen and lounge, two bathrooms, private garden, and street parking. A 10-minute bus ride to the university main campus.",
      "2026-09-01", "active", 1
    ],
  ];
  for (const p of properties) {
    await conn.execute(
      `INSERT INTO properties
         (id, owner_id, title, address, city, type, bedrooms, bathrooms,
          price, deposit, description, available_from, status, is_verified)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title)`,
      p
    );
  }
  console.log(`  ✓ ${properties.length} properties`);

  // ── 6. Property amenities ─────────────────────────────────────────────────
  console.log("[Seed] Inserting amenities...");
  const amenities = [
    [ID.prop1, "Wifi"],
    [ID.prop1, "Air Conditioning"],
    [ID.prop1, "On-site Laundry"],
    [ID.prop1, "Parking Spot"],
    [ID.prop1, "Fully Furnished"],
    [ID.prop1, "Dishwasher"],
    [ID.prop2, "Wifi"],
    [ID.prop2, "Air Conditioning"],
    [ID.prop2, "In-unit Laundry"],
    [ID.prop2, "Private Backyard"],
    [ID.prop2, "Garage Parking"],
    [ID.prop2, "Dishwasher"],
    [ID.prop3, "Wifi"],
    [ID.prop3, "Heating"],
    [ID.prop3, "On-site Laundry"],
    [ID.prop3, "Security Access"],
    [ID.prop4, "Wifi"],
    [ID.prop4, "Garden"],
    [ID.prop4, "Street Parking"],
    [ID.prop4, "Near Bus Stop"],
    [ID.prop4, "Large Kitchen"],
  ];
  for (const a of amenities) {
    await conn.execute(
      "INSERT IGNORE INTO property_amenities (property_id, amenity) VALUES (?,?)",
      a
    );
  }
  console.log(`  ✓ ${amenities.length} amenity rows`);

  // ── 7. Property rules ─────────────────────────────────────────────────────
  console.log("[Seed] Inserting rules...");
  const rules = [
    [ID.prop1, "No smoking"],
    [ID.prop1, "No loud parties after 10 PM"],
    [ID.prop1, "Cats allowed"],
    [ID.prop2, "No smoking"],
    [ID.prop2, "No pets"],
    [ID.prop2, "Quiet hours from 11 PM"],
    [ID.prop3, "No smoking"],
    [ID.prop3, "Pets allowed with deposit"],
    [ID.prop4, "No smoking indoors"],
    [ID.prop4, "Bills split equally"],
    [ID.prop4, "Shared cleaning rota"],
  ];
  for (const r of rules) {
    await conn.execute(
      "INSERT INTO property_rules (property_id, rule) VALUES (?,?) ON DUPLICATE KEY UPDATE rule=VALUES(rule)",
      r
    );
  }
  console.log(`  ✓ ${rules.length} rule rows`);

  // ── 8. Applications ───────────────────────────────────────────────────────
  console.log("[Seed] Inserting applications...");

  // app1: Alex applied for prop1 (pending)
  await conn.execute(
    `INSERT INTO applications (id, property_id, tenant_id, owner_id, status, message, applied_at)
     VALUES (?, ?, ?, ?, 'pending', ?, DATE_SUB(NOW(), INTERVAL 7 DAY))
     ON DUPLICATE KEY UPDATE status=VALUES(status)`,
    [
      ID.app1, ID.prop1, ID.alex, ID.sarah,
      "Hi Sarah, I am a Computer Science junior at State University. I am very interested in this room since it is so close to campus. I am quiet, clean, and always pay rent on time. Let me know if we can arrange a viewing!"
    ]
  );
  await conn.execute(
    `INSERT IGNORE INTO application_history (application_id, status, label, changed_at)
     VALUES (?, 'pending', 'Application submitted by Alex Mercer', DATE_SUB(NOW(), INTERVAL 7 DAY))`,
    [ID.app1]
  );

  // app2: Marcus applied for prop2 (approved)
  await conn.execute(
    `INSERT INTO applications (id, property_id, tenant_id, owner_id, status, message, applied_at)
     VALUES (?, ?, ?, ?, 'approved', ?, DATE_SUB(NOW(), INTERVAL 10 DAY))
     ON DUPLICATE KEY UPDATE status=VALUES(status)`,
    [
      ID.app2, ID.prop2, ID.marcus, ID.sarah,
      "Hello Mrs. Jenkins, I am interested in renting a room in the Townhouse. I have a clean credit record and a stable co-signer."
    ]
  );
  await conn.execute(
    `INSERT IGNORE INTO application_history (application_id, status, label, changed_at)
     VALUES
       (?, 'pending',  'Application submitted by Marcus Brody',   DATE_SUB(NOW(), INTERVAL 10 DAY)),
       (?, 'approved', 'Application approved by Sarah Jenkins',   DATE_SUB(NOW(), INTERVAL 8 DAY))`,
    [ID.app2, ID.app2]
  );
  // Mark prop2 as rented since application was approved
  await conn.execute(
    "UPDATE properties SET status='rented' WHERE id=?",
    [ID.prop2]
  );
  console.log("  ✓ 2 applications + history");

  // ── 9. Sample notifications ───────────────────────────────────────────────
  console.log("[Seed] Inserting notifications...");
  const notifs = [
    [uuidv4(), ID.alex,   "Application Received",         "Your application for University Gardens Apartment is under review.",   "application", ID.app1],
    [uuidv4(), ID.sarah,  "New Application",              "Alex Mercer applied for your University Gardens Apartment.",            "application", ID.app1],
    [uuidv4(), ID.marcus, "Application Approved",         "Your application for Modern Townhouse with Backyard was approved!",     "application", ID.app2],
    [uuidv4(), ID.chloe,  "Verification Pending",         "Your ID document has been submitted and is awaiting admin review.",     "verification", null],
    [uuidv4(), ID.alex,   "Welcome to RoomieMatch",       "Complete your profile to increase your chances of finding a match.",   "general", null],
  ];
  for (const n of notifs) {
    await conn.execute(
      `INSERT IGNORE INTO notifications (id, user_id, title, message, type, reference_id, is_read)
       VALUES (?,?,?,?,?,?,0)`,
      n
    );
  }
  console.log(`  ✓ ${notifs.length} notifications`);

  // ── 10. Sample favourites ──────────────────────────────────────────────────
  console.log("[Seed] Inserting favourites...");
  const favs = [
    [ID.alex,   ID.prop1],
    [ID.alex,   ID.prop3],
    [ID.marcus, ID.prop4],
    [ID.chloe,  ID.prop1],
    [ID.chloe,  ID.prop3],
  ];
  for (const f of favs) {
    await conn.execute(
      "INSERT IGNORE INTO favourites (user_id, property_id) VALUES (?,?)",
      f
    );
  }
  console.log(`  ✓ ${favs.length} favourite rows`);

  await conn.end();
  console.log("\n[Seed] Complete — database is ready for demo use.\n");
  console.log("Demo accounts (password: password123):");
  console.log("  admin@roomiematch.com  → Admin panel");
  console.log("  alex@user.com          → User (can search AND list properties)");
  console.log("  sarah@user.com         → User (has listed properties)");
  console.log("  marcus@user.com        → User");
  console.log("  chloe@user.com         → User (unverified)");
}

seed().catch((err) => {
  console.error("[Seed] Fatal error:", err.message);
  process.exit(1);
});
