const { pool } = require('../config/db');

// Audits are always read together with their unit's name and responsible user,
// so the controller can check whether a REPRESENTATIVE may see the audit.
const SELECT_AUDIT = `
  SELECT a.id, a.title, a.description, a.audit_date,
         a.audited_unit_id, u.name AS audited_unit_name,
         u.responsible_user_id,
         a.created_by, a.created_at, a.updated_at
  FROM audits a
  JOIN audited_units u ON u.id = a.audited_unit_id`;

async function getAuditById(id) {
  const result = await pool.query(`${SELECT_AUDIT} WHERE a.id = $1`, [id]);
  return result.rows[0];
}

async function createAudit({ title, description, auditDate, auditedUnitId, createdBy }) {
  const result = await pool.query(
    `INSERT INTO audits (title, description, audit_date, audited_unit_id, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title, description, auditDate, auditedUnitId, createdBy]
  );
  return getAuditById(result.rows[0].id);
}

// Optional filters: auditedUnitId (query string) and responsibleUserId (for representatives).
async function getAllAudits({ auditedUnitId, responsibleUserId } = {}) {
  const conditions = [];
  const params = [];

  if (auditedUnitId) {
    params.push(auditedUnitId);
    conditions.push(`a.audited_unit_id = $${params.length}`);
  }
  if (responsibleUserId) {
    params.push(responsibleUserId);
    conditions.push(`u.responsible_user_id = $${params.length}`);
  }

  let sql = SELECT_AUDIT;
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ' ORDER BY a.audit_date DESC, a.id DESC';

  const result = await pool.query(sql, params);
  return result.rows;
}

async function updateAudit(id, { title, description, auditDate, auditedUnitId }) {
  const result = await pool.query(
    `UPDATE audits
     SET title = $1, description = $2, audit_date = $3,
         audited_unit_id = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING id`,
    [title, description, auditDate, auditedUnitId, id]
  );
  if (result.rowCount === 0) return undefined;
  return getAuditById(id);
}

async function deleteAudit(id) {
  const result = await pool.query('DELETE FROM audits WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { createAudit, getAllAudits, getAuditById, updateAudit, deleteAudit };