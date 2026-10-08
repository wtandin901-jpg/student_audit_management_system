const auditModel = require('../models/auditModel');
const auditedUnitModel = require('../models/auditedUnitModel');
const { isNonEmptyString, isPositiveInt, isValidDateString } = require('../utils/validate');

// Validates the body for both POST and PUT.
// Returns { errors } or { values } (cleaned data ready for the model).
async function validateAuditBody(body) {
  const { title, description, audit_date, audited_unit_id } = body || {};
  const errors = [];

  if (!isNonEmptyString(title, 200)) {
    errors.push('title is required (max 200 characters).');
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be text.');
  }
  if (!isValidDateString(audit_date)) {
    errors.push('audit_date is required and must be a real date in YYYY-MM-DD format.');
  }

  let auditedUnitId;
  if (!isPositiveInt(audited_unit_id)) {
    errors.push('audited_unit_id is required and must be a positive integer.');
  } else {
    const unit = await auditedUnitModel.getAuditedUnitById(Number(audited_unit_id));
    if (!unit) {
      errors.push('audited_unit_id does not match any audited unit.');
    } else {
      auditedUnitId = unit.id;
    }
  }

  if (errors.length > 0) return { errors };

  return {
    values: {
      title: title.trim(),
      description: description && description.trim() ? description.trim() : null,
      auditDate: audit_date,
      auditedUnitId,
    },
  };
}

// POST /api/audits  - created_by is taken from the logged-in user, never from the request body
async function createAudit(req, res, next) {
  try {
    const { errors, values } = await validateAuditBody(req.body);
    if (errors) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    const audit = await auditModel.createAudit({ ...values, createdBy: req.user.id });
    res.status(201).json({ message: 'Audit created.', audit });
  } catch (err) {
    next(err);
  }
}

// GET /api/audits  and  GET /api/audits?audited_unit_id=1
// A REPRESENTATIVE only receives audits of the unit they are responsible for.
async function getAudits(req, res, next) {
  try {
    const filter = {};

    if (req.query.audited_unit_id !== undefined) {
      if (!isPositiveInt(req.query.audited_unit_id)) {
        return res.status(400).json({ message: 'audited_unit_id must be a positive integer.' });
      }
      filter.auditedUnitId = Number(req.query.audited_unit_id);
    }
    if (req.user.role === 'REPRESENTATIVE') {
      filter.responsibleUserId = req.user.id;
    }

    const audits = await auditModel.getAllAudits(filter);
    res.status(200).json({ count: audits.length, audits });
  } catch (err) {
    next(err);
  }
}

// GET /api/audits/:id
async function getAuditById(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'Audit id must be a positive integer.' });
    }
    const audit = await auditModel.getAuditById(Number(req.params.id));
    if (!audit) {
      return res.status(404).json({ message: 'Audit not found.' });
    }
    if (req.user.role === 'REPRESENTATIVE' && audit.responsible_user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only view audits of your own unit.' });
    }
    res.status(200).json({ audit });
  } catch (err) {
    next(err);
  }
}

// PUT /api/audits/:id
async function updateAudit(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'Audit id must be a positive integer.' });
    }
    const id = Number(req.params.id);

    const existing = await auditModel.getAuditById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Audit not found.' });
    }

    const { errors, values } = await validateAuditBody(req.body);
    if (errors) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const audit = await auditModel.updateAudit(id, values);
    res.status(200).json({ message: 'Audit updated.', audit });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/audits/:id
async function deleteAudit(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'Audit id must be a positive integer.' });
    }
    const deleted = await auditModel.deleteAudit(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Audit not found.' });
    }
    res.status(200).json({ message: 'Audit deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAudit, getAudits, getAuditById, updateAudit, deleteAudit };