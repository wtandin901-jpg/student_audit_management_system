// dotenv must be loaded BEFORE anything that reads process.env (like config/db.js).
require('dotenv').config();

const app = require('./app');
const { pool, testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Add it to your .env file.');
    process.exit(1);
  }

  try {
    const now = await testConnection();
    console.log(`PostgreSQL connection SUCCESSFUL (server time: ${now.toISOString()})`);
  } catch (err) {
    console.error('PostgreSQL connection FAILED:', err.message);
    console.error('Check that PostgreSQL is running and that the DB_* values in .env are correct.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Close the server and the database pool cleanly on Ctrl+C.
  process.on('SIGINT', () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}

startServer();