const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar,
      classId:   user.class_id,
      teacherId: user.teacher_id,
      childId:   user.child_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });

    const { rows } = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const client = await db.connect();
  try {
    const { name, email, password, role, specialization, managerCode, childName, classId, phone } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    if (!['manager', 'teacher', 'parent'].includes(role))
      return res.status(400).json({ error: 'دور غير صالح' });
    if (role === 'manager' && managerCode !== 'RAWDAH2026')
      return res.status(403).json({ error: 'رمز المدير غير صحيح' });

    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });

    await client.query('BEGIN');

    const hashed = bcrypt.hashSync(password, 10);
    const avatar = role === 'manager' ? '👨‍💼' : role === 'teacher' ? '👩‍🏫' : '👨';

    let childId = null;

    // If parent, create a child stub first
    if (role === 'parent' && childName && classId) {
      const childRes = await client.query(
        `INSERT INTO students (name, avatar, gender, age, class_id, parent_name, phone, medication)
         VALUES ($1, '👦', 'ذكر', 4, $2, $3, $4, false)
         RETURNING id`,
        [childName, classId, name, phone || '']
      );
      childId = childRes.rows[0].id;
    }

    const userRes = await client.query(
      `INSERT INTO users (name, email, password, role, avatar, class_id, teacher_id, child_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name, email, hashed, role, avatar,
        role === 'teacher' ? (classId || null) : null,
        null,
        childId,
      ]
    );
    const newUser = userRes.rows[0];

    // Log activity
    await client.query(
      `INSERT INTO activity_log (icon, text, type) VALUES ($1, $2, $3)`,
      ['👤', `تم تسجيل مستخدم جديد: ${name}`, 'user']
    );

    await client.query('COMMIT');

    const token = signToken(newUser);
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Register error:', err);
    res.status(500).json({ error: 'خطأ في إنشاء الحساب' });
  } finally {
    client.release();
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const { password: _, ...safeUser } = rows[0];
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المستخدم' });
  }
});

module.exports = router;
