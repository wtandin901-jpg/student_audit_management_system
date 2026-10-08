const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { isNonEmptyString, isValidEmail } = require('../utils/validate');

const SALT_ROUNDS = 10;
// ADMIN is deliberately missing: nobody can make themselves an admin via public registration.
const SELF_REGISTER_ROLES = ['AUDITOR', 'REPRESENTATIVE'];

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};
    const errors = [];

    if (!isNonEmptyString(name, 100)) {
      errors.push('name is required (max 100 characters).');
    }
    if (!isValidEmail(email)) {
      errors.push('A valid email is required.');
    }
    // bcrypt only uses the first 72 bytes, so we cap the length at 72.
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      errors.push('password is required (8 to 72 characters).');
    }

    const chosenRole = role === undefined ? 'REPRESENTATIVE' : role;
    if (chosenRole === 'ADMIN') {
      return res.status(403).json({
        message: 'ADMIN accounts cannot be created through public registration.',
      });
    }
    if (!SELF_REGISTER_ROLES.includes(chosenRole)) {
      errors.push(`role must be one of: ${SELF_REGISTER_ROLES.join(', ')}.`);
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await userModel.findByEmailWithHash(cleanEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.createUser({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: chosenRole,
    });

    res.status(201).json({ message: 'User registered successfully.', user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const user = await userModel.findByEmailWithHash(email.trim().toLowerCase());

    // Same message for "no such email" and "wrong password" so attackers cannot tell which one failed.
    const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protected) - shows who the token belongs to
function getMe(req, res) {
  res.status(200).json({ user: req.user });
}

module.exports = { register, login, getMe };