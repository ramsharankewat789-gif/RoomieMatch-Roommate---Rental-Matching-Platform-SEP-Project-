/**
 * index.js — RoomieMatch Express server entry point.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const path     = require("path");

const { initDatabase } = require("./database/init");

// ── Route modules ──────────────────────────────────────────────────────────
const authRoutes         = require("./routes/authRoutes");
const uploadRoutes       = require("./routes/uploadRoutes");
const userRoutes         = require("./routes/userRoutes");
const propertyRoutes     = require("./routes/propertyRoutes");
const applicationRoutes  = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const favouriteRoutes    = require("./routes/favouriteRoutes");
const reportRoutes       = require("./routes/reportRoutes");
const adminRoutes        = require("./routes/adminRoutes");
const messageRoutes      = require("./routes/messageRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  process.env.ADMIN_URL  || "http://localhost:5174"
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static file serving (profile + property images only) ──────────────────
// Verification docs are NOT served statically — they go through /api/verification/doc/:userId
app.use("/api/uploads/profiles",   express.static(path.resolve(__dirname, "../uploads/profiles")));
app.use("/api/uploads/properties", express.static(path.resolve(__dirname, "../uploads/properties")));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api",               uploadRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/properties",    propertyRoutes);
app.use("/api/applications",  applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favourites",    favouriteRoutes);
app.use("/api/reports",       reportRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/reviews",       reviewRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "An unexpected error occurred." });
});

// ── Start ──────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`\n🏠 RoomieMatch API  →  http://localhost:${PORT}`);
      console.log(`   Health check    →  http://localhost:${PORT}/api/health`);
      console.log(`   Environment     →  ${process.env.NODE_ENV || "development"}\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
