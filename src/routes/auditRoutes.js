const express = require('express');
const controller = require('../controllers/auditController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Every audit route requires a valid token.
router.use(authenticate);

// Reading: all roles. The controller limits a REPRESENTATIVE to audits of their own unit.
router.get('/', controller.getAudits);
router.get('/:id', controller.getAuditById);

// Writing: only ADMIN and AUDITOR.
router.post('/', authorizeRoles('ADMIN', 'AUDITOR'), controller.createAudit);
router.put('/:id', authorizeRoles('ADMIN', 'AUDITOR'), controller.updateAudit);
router.delete('/:id', authorizeRoles('ADMIN', 'AUDITOR'), controller.deleteAudit);

module.exports = router;