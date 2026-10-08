const { pool } = require('../config/db');

const COLUMNS =
  'id, name, type, description, responsible_user_id, created_at, updated_at';

async function createAuditedUnit({ name, type, description, responsibleUserId }) {
  const result = await pool.query(
    `INSERT INTO audited_units (name, type, description, responsible_user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [name, type, description, responsibleUserId]
  );
  return result.rows[0];
}

// If responsibleUserId is given, only that user's units are returned.
async function getAllAuditedUnits({ responsibleUserId } = {}) {
  let sql = `SELECT ${COLUMNS} FROM audited_units`;
  const params = [];

  if (responsibleUserId) {
    params.push(responsibleUserId);
    sql += ' WHERE responsible_user_id = $1';
  }

  sql += ' ORDER BY id';
  const result = await pool.query(sql, params);
  return result.rows;
}

async function getAuditedUnitById(id) {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM audited_units WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function updateAuditedUnit(id, { name, type, description, responsibleUserId }) {
  const result = await pool.query(
    `UPDATE audited_units
     SET name = $1, type = $2, description = $3,
         responsible_user_id = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING ${COLUMNS}`,
    [name, type, description, responsibleUserId, id]
  );
  return result.rows[0];
}

async function deleteAuditedUnit(id) {
  const result = await pool.query(
    'DELETE FROM audited_units WHERE id = $1',
    [id]
  );
  return result.rowCount > 0;
}

module.exports = {
  createAuditedUnit,
  getAllAuditedUnits,
  getAuditedUnitById,
  updateAuditedUnit,
  deleteAuditedUnit,
};