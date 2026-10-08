const { pool } = require('../config/db');

// Columns that are safe to send to the client (never password_hash).
const SAFE_COLUMNS = 'id, name, email, role, created_at, updated_at';

async function createUser({ name, email, passwordHash, role }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${SAFE_COLUMNS}`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

// Used by login only: this is the one query that returns password_hash.
async function findByEmailWithHash(email) {
  const result = await pool.query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM users ORDER BY id`
  );
  return result.rows;
}

async function updateUserRole(id, role) {
  const result = await pool.query(
    `UPDATE users SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING ${SAFE_COLUMNS}`,
    [role, id]
  );
  return result.rows[0];
}

module.exports = { createUser, findByEmailWithHash, findById, getAllUsers, updateUserRole };