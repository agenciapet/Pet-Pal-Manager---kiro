const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'petpal_manager',
  user: process.env.DB_USER || 'nataliacassus',
  password: process.env.DB_PASSWORD || '',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}; 