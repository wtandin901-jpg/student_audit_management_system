const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no token needed)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Any logged-in user (any role)
router.get('/me', authenticate, authController.getMe);

module.exports = router;