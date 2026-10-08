const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Protects a route: the request must carry "Authorization: Bearer <token>".
// On success, req.user holds the logged-in user (without password hash).
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Send: Authorization: Bearer <token>' });
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Token has expired. Please log in again.'
          : 'Invalid token.';
      return res.status(401).json({ message });
    }

    // The token only stores the user id. We load the user (and current role)
    // from the database, so role changes and deleted users take effect immediately.
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'The user for this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };