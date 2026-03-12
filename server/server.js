require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');
const pool    = require('./database/db');

const authRoutes    = require('./routes/auth');
const managerRoutes = require('./routes/manager');
const teacherRoutes = require('./routes/teacher');
const parentRoutes  = require('./routes/parent');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ─────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / Postman / same-origin
    const allowed = [
      /^http:\/\/localhost(:\d+)?$/,      // local dev (any port)
      /^https:\/\/.*\.vercel\.app$/,      // any Vercel deployment
      /^https:\/\/.*\.netlify\.app$/,     // any Netlify deployment
    ];
    // Also allow an explicit custom domain via env var
    if (process.env.FRONTEND_URL) {
      allowed.push(new RegExp(`^${process.env.FRONTEND_URL.replace(/\./g, '\\.')}$`));
    }
    if (allowed.some((re) => re.test(origin))) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));
app.use(express.json());

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', message: 'Royal Kids Academy API تعمل بشكل صحيح 🌸', dbTime: rows[0].time });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database connection failed', error: err.message });
  }
});

// ── ROUTES ────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/parent',  parentRoutes);

// ── 404 FALLBACK ──────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `المسار غير موجود: ${req.method} ${req.path}` }));

// ── ERROR HANDLER ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ داخلي في الخادم' });
});

// ── STARTUP ───────────────────────────────────────────────
async function startServer() {
  try {
    // Test database connection on startup
    await pool.query('SELECT 1');
    console.log('✅ Connected to Supabase PostgreSQL');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Make sure DATABASE_URL is set correctly in server/.env');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🌸 Royal Kids Academy - Backend API`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`\n📋 Demo Credentials:`);
    console.log(`   Manager  → manager@rawdah.sa  / manager123`);
    console.log(`   Teacher  → teacher1@rawdah.sa / teacher123`);
    console.log(`   Parent   → parent1@rawdah.sa  / parent123\n`);
  });
}

startServer();
