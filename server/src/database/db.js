/**
 * db.js — MySQL connection pool using mysql2/promise.
 *
 * Exports three helpers that match the same interface previously used by sql.js,
 * so every controller/service only needs to change the import — not the call sites.
 *
 *   query(sql, params)   → SELECT  → returns array of row objects
 *   execute(sql, params) → INSERT / UPDATE / DELETE → returns [ResultSetHeader, fields]
 *   getConnection()      → raw PoolConnection for transactions
 */
const mysql = require("mysql2/promise");

let _pool = null;

function getPool() {
  if (_pool) return _pool;

  _pool = mysql.createPool({
    host:               process.env.DB_HOST            || "localhost",
    port:               Number(process.env.DB_PORT)    || 3306,
    user:               process.env.DB_USER            || "root",
    password:           process.env.DB_PASSWORD        || "",
    database:           process.env.DB_NAME            || "roomiematch",
    connectionLimit:    Number(process.env.DB_CONNECTION_LIMIT) || 10,
    waitForConnections: true,
    queueLimit:         0,
    // Return JS Date objects for DATETIME columns
    dateStrings:        false,
    // Decode BIGINT as string to avoid precision loss
    supportBigNumbers:  true,
    bigNumberStrings:   false,
    // Keep connections alive
    enableKeepAlive:    true,
    keepAliveInitialDelay: 0,
  });

  return _pool;
}

/**
 * query — run a SELECT (or any statement that returns rows).
 * Returns an array of plain row objects.
 *
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * execute — run an INSERT / UPDATE / DELETE.
 * Returns the full mysql2 ResultSetHeader (insertId, affectedRows, etc.)
 *
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<object>}  ResultSetHeader
 */
async function execute(sql, params = []) {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * get — fetch a single row (first result or null).
 * Drop-in replacement for the old sql.js get().
 *
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<object|null>}
 */
async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * all — fetch all matching rows.
 * Drop-in replacement for the old sql.js all().
 *
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<Array>}
 */
async function all(sql, params = []) {
  return query(sql, params);
}

/**
 * run — execute a write statement (INSERT / UPDATE / DELETE / CREATE).
 * Drop-in replacement for the old sql.js run().
 *
 * @param {string} sql
 * @param {Array}  params
 * @returns {Promise<object>}  ResultSetHeader
 */
async function run(sql, params = []) {
  return execute(sql, params);
}

/**
 * getConnection — retrieve a raw PoolConnection for manual transactions.
 * Remember to call connection.release() when done.
 *
 * @returns {Promise<PoolConnection>}
 */
async function getConnection() {
  return getPool().getConnection();
}

/**
 * testConnection — ping MySQL to confirm connectivity.
 * Called during server startup.
 */
async function testConnection() {
  const conn = await getConnection();
  await conn.ping();
  conn.release();
  console.log("[DB] MySQL connection pool ready.");
}

module.exports = { query, execute, get, all, run, getConnection, testConnection };
