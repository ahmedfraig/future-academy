require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

// ── SUPABASE POSTGRESQL CONNECTION POOL ───────────────────────
// Set DATABASE_URL in server/.env — use the Supabase "Transaction pooler" URI
// Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
  max: 10,          // maximum connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

module.exports = pool;
