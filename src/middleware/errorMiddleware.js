// Runs when no route matched.
function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Runs when something unexpected goes wrong (next(err) or a thrown error).
// Expected problems (validation, 404, 403...) are answered directly in controllers.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Malformed JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON.' });
  }

  // PostgreSQL error codes
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with the same unique value already exists.' });
  }
  if (err.code === '23503') {
    return res.status(409).json({
      message: 'Operation conflicts with related records (for example, the record is still referenced by another table).',
    });
  }
  if (['22P02', '22003', '22007', '22008', '23502', '23514'].includes(err.code)) {
    return res.status(400).json({ message: 'Invalid data was sent to the database.' });
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ message: 'Internal server error.' });
}

module.exports = { notFoundHandler, errorHandler };