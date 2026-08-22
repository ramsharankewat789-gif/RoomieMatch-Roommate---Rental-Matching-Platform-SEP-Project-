/**
 * index.js — RoomieMatch Express server entry point.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const path       = require("path");
const { initDatabase } = require("./database/init");

const authRoutes   = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // allow images to be loaded cross-origin
}));

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  process.env.ADMIN_URL  || "http://localhost:5174"
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g., curl, mobile apps during dev)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static file serving for uploaded images ────────────────────────────────
// Profile images and property images are publicly accessible via /api/uploads/
// Verification documents are NOT served here — they go through the protected route.
app.use("/api/uploads/profiles",   express.static(path.resolve(__dirname, "../uploads/profiles")));
app.use("/api/uploads/properties", express.static(path.resolve(__dirname, "../uploads/properties")));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api",         uploadRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err.message);
  // Do NOT expose stack traces or internal details
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "An unexpected error occurred." });
});

// ── Start ──────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`\n🏠 RoomieMatch API running on http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/api/health`);
      console.log(`   Env:     ${process.env.NODE_ENV || "development"}\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
