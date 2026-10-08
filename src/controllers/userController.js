const userModel = require('../models/userModel');
const { isPositiveInt } = require('../utils/validate');

const ROLES = ['ADMIN', 'AUDITOR', 'REPRESENTATIVE'];

// GET /api/users
async function getUsers(req, res, next) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'User id must be a positive integer.' });
    }
    const user = await userModel.findById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id/role  (ADMIN only)
async function updateUserRole(req, res, next) {
  try {
    if (!isPositiveInt(req.params.id)) {
      return res.status(400).json({ message: 'User id must be a positive integer.' });
    }
    const id = Number(req.params.id);
    const { role } = req.body || {};

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(', ')}.` });
    }
    // Stops the only admin from accidentally locking everyone out.
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await userModel.updateUserRole(id, role);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User role updated.', user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, getUserById, updateUserRole };