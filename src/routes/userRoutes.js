const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Every user route requires a valid token.
router.use(authenticate);

// ADMIN and AUDITOR can list users (auditors need user ids to assign unit representatives).
router.get('/', authorizeRoles('ADMIN', 'AUDITOR'), userController.getUsers);

// Only ADMIN can view one user or change roles ("manage users").
router.get('/:id', authorizeRoles('ADMIN'), userController.getUserById);
router.put('/:id/role', authorizeRoles('ADMIN'), userController.updateUserRole);

module.exports = router;