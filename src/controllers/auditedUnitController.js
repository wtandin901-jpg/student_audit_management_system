const auditedUnitModel = require('../models/auditedUnitModel');
const userModel = require('../models/userModel');
const { isNonEmptyString, isPositiveInt } = require('../utils/validate');

const UNIT_TYPES = ['CLUB', 'FORUM', 'UNIT', 'HOSTEL'];

// Validates the body for both POST and PUT.
// Returns { errors } or { values } (cleaned data ready for the model).
async function validateUnitBody(body) {
  const { name, type, description, responsible_user_id } = body || {};
  const errors = [];

  if (!isNonEmptyString(name, 150)) {
    errors.push('name is required (max 150 characters).');
  }
  if (!UNIT_TYPES.includes(type)) {
    errors.push(`type must be one of: ${UNIT_TYPES.join(', ')}.`);
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be text.');
  }

  let responsibleUserId = null;
  if (responsible_user_id !== undefined && responsible_user_id !== null) {
    if (!isPositiveInt(responsible_user_id)) {
      errors.push('responsible_user_id must be a positive integer.');
    } else {
      const user = await userModel.findById(Number(responsible_user_id));
      if (!user) {
        errors.push('responsible_user_id does not match any user.');
      } else if (user.role !== 'REPRESENTATIVE') {
        errors.push('The responsible user must have the REPRESENTATIVE role.');
      } else {
        responsibleUserId = user.id;
      }
    }
  }

  if (errors.length > 0) return { errors };

  return {
    values: {
      name: name.trim(),
      type,
      description: description && description.trim() ? description.trim() : null,
      responsibleUserId,
    },
  };
}

// POST /api/audited-units
async function createAuditedUnit(req, res, next) {
  try {
    const { errors, values } = await validateUnitBody(req.body);
    if (errors) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    const unit = await auditedUnitModel.createAuditedUnit(values);
    res.status(201).json({ message: 'Audited unit created.', audited_unit: unit });
  } catch (err) {
    next(err);
  }
}

// GET /api/audited-units
// ADMIN/AUDITOR see all units. A REPRESENTATIVE sees only the units they are responsible for.
async function getAuditedUnits(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'REPRESENTATIVE') {
      filter.responsibleUserId = req.user.id;
    }
    const units = await auditedUnitModel.getAllAuditedUnits(filter);
    res.status(200).json({ count: units.length, audited_units: units });
  } catch (err) {
    next(err);
  }
}

// GET /api/audited-units/:id
async function getAuditedUnitById(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'Audited unit id must be a positive integer.' });
    }
    const unit = await auditedUnitModel.getAuditedUnitById(Number(req.params.id));
    if (!unit) {
      return res.status(404).json({ message: 'Audited unit not found.' });
    }
    if (req.user.role === 'REPRESENTATIVE' && unit.responsible_user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only view the unit you are responsible for.' });
    }
    res.status(200).json({ audited_unit: unit });
  } catch (err) {
    next(err);
  }
}

// PUT /api/audited-units/:id
async function updateAuditedUnit(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'Audited unit id must be a positive integer.' });
    }
    const id = Number(req.params.id);

    const existing = await auditedUnitModel.getAuditedUnitById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Audited unit not found.' });
    }

    const { errors, values } = await validateUnitBody(req.body);
    if (errors) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const unit = await auditedUnitModel.updateAuditedUnit(id, values);
    res.status(200).json({ message: 'Audited unit updated.', audited_unit: unit });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/audited-units/:id
// Fails with 409 (see errorMiddleware) if the unit still has audits.
async function deleteAuditedUnit(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'Audited unit id must be a positive integer.' });
    }
    const deleted = await auditedUnitModel.deleteAuditedUnit(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Audited unit not found.' });
    }
    res.status(200).json({ message: 'Audited unit deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAuditedUnit,
  getAuditedUnits,
  getAuditedUnitById,
  updateAuditedUnit,
  deleteAuditedUnit,
};