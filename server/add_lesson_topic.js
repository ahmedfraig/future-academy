require('dotenv').config({ path: './.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("ALTER TABLE daily_subject_log ADD COLUMN IF NOT EXISTS lesson_topic TEXT NOT NULL DEFAULT ''")
  .then(() => { console.log('SUCCESS: lesson_topic column added'); pool.end(); })
  .catch(e => { console.error('ERROR:', e.message); pool.end(); process.exit(1); });
