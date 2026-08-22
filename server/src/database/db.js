/**
 * db.js — SQLite database singleton using sql.js (pure JavaScript, no native build).
 * The database is persisted to server/roomiematch.db on every write.
 */
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

const DB_PATH = path.resolve(__dirname, "../../roomiematch.db");

let _db = null;

/** Load or create the SQLite database file. */
async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  return _db;
}

/** Persist the in-memory database to disk. Call after every write operation. */
function saveDb() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * run — execute a write statement (INSERT / UPDATE / DELETE / CREATE).
 * @param {string} sql
 * @param {Array|Object} params
 */
async function run(sql, params = []) {
  const db = await getDb();
  db.run(sql, params);
  saveDb();
}

/**
 * get — fetch a single row.
 */
async function get(sql, params = []) {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

/**
 * all — fetch all matching rows.
 */
async function all(sql, params = []) {
  const db = await getDb();
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

module.exports = { getDb, saveDb, run, get, all };
