/**
 * init.js — called on server startup to verify the DB connection
 * and ensure all tables exist.
 *
 * For first-time setup run:  npm run db:migrate
 * This file only does a connectivity test at runtime.
 */
const { testConnection } = require("./db");

async function initDatabase() {
  await testConnection();
}

module.exports = { initDatabase };
