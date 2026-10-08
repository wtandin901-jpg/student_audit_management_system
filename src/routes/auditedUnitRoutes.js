const express = require('express');
const controller = require('../controllers/auditedUnitController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Every audited-unit route requires a valid token.
router.use(authenticate);

// Reading: all roles. The controller limits a REPRESENTATIVE to their own unit.
router.get('/', controller.getAuditedUnits);
router.get('/:id', controller.getAuditedUnitById);

// Writing: only ADMIN and AUDITOR.
router.post('/', authorizeRoles('ADMIN', 'AUDITOR'), controller.createAuditedUnit);
router.put('/:id', authorizeRoles('ADMIN', 'AUDITOR'), controller.updateAuditedUnit);
router.delete('/:id', authorizeRoles('ADMIN', 'AUDITOR'), controller.deleteAuditedUnit);

module.exports = router;