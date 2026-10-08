const { Pool, types } = require('pg');

// By default pg turns DATE columns into JavaScript Date objects, which can shift
// the day because of time zones. Returning the plain "YYYY-MM-DD" string avoids that.
types.setTypeParser(1082, (value) => value);

// One shared pool of connections, configured only from environment variables.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

// Used once at startup so we clearly see whether the database is reachable.
async function testConnection() {
  const result = await pool.query('SELECT NOW() AS now');
  return result.rows[0].now;
}

module.exports = { pool, testConnection };