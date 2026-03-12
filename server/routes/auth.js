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

// ── POST /api/auth/login ──────────────────────────────────────
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

// ── GET /api/auth/verify-code ─────────────────────────────────
// Validates an invite code and returns the linked name for UI preview
// Query: ?code=XXXX-XXXX-XXXX&role=parent|teacher
router.get('/verify-code', async (req, res) => {
  const { code, role } = req.query;
  if (!code || !role) return res.status(400).json({ error: 'الرمز والدور مطلوبان' });

  try {
    if (role === 'parent') {
      // Check all students with a code hash
      const { rows } = await db.query(
        'SELECT id, name, invite_code_hash FROM students WHERE invite_code_hash IS NOT NULL'
      );
      const matched = rows.find((r) => bcrypt.compareSync(code.trim().toUpperCase(), r.invite_code_hash));
      if (!matched) return res.status(404).json({ error: 'رمز الدعوة غير صحيح أو منتهي الصلاحية' });

      // Check not already used
      const used = await db.query('SELECT id FROM users WHERE child_id = $1', [matched.id]);
      if (used.rows.length > 0) return res.status(409).json({ error: 'تم استخدام هذا الرمز بالفعل' });

      return res.json({ valid: true, studentName: matched.name, studentId: matched.id });
    }

    if (role === 'teacher') {
      const { rows } = await db.query(
        'SELECT id, name, invite_code_hash FROM teachers WHERE invite_code_hash IS NOT NULL'
      );
      const matched = rows.find((r) => bcrypt.compareSync(code.trim().toUpperCase(), r.invite_code_hash));
      if (!matched) return res.status(404).json({ error: 'رمز الدعوة غير صحيح أو منتهي الصلاحية' });

      const used = await db.query('SELECT id FROM users WHERE teacher_id = $1', [matched.id]);
      if (used.rows.length > 0) return res.status(409).json({ error: 'تم استخدام هذا الرمز بالفعل' });

      return res.json({ valid: true, teacherName: matched.name, teacherId: matched.id });
    }

    return res.status(400).json({ error: 'دور غير صالح — يجب أن يكون parent أو teacher' });
  } catch (err) {
    console.error('verify-code error:', err);
    res.status(500).json({ error: 'خطأ في التحقق من الرمز' });
  }
});

// ── POST /api/auth/register ───────────────────────────────────
// Managers cannot self-register. Parent/Teacher must use an invite code.
router.post('/register', async (req, res) => {
  const client = await db.connect();
  try {
    const { email, password, phone, inviteCode, role } = req.body;

    // Managers are created by DB seeding only — block public registration
    if (!role || role === 'manager') {
      return res.status(403).json({ error: 'تسجيل المدير غير مسموح من هنا — تواصل مع الإدارة' });
    }
    if (!['parent', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'دور غير صالح' });
    }
    if (!email || !password || !inviteCode) {
      return res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    // Check email not already used
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });

    const normalizedCode = inviteCode.trim().toUpperCase();

    // ── PARENT FLOW ──
    if (role === 'parent') {
      if (!phone) return res.status(400).json({ error: 'رقم الجوال مطلوب لتسجيل ولي الأمر' });

      const { rows: students } = await client.query(
        'SELECT id, name, invite_code_hash FROM students WHERE invite_code_hash IS NOT NULL'
      );
      const student = students.find((s) => bcrypt.compareSync(normalizedCode, s.invite_code_hash));
      if (!student) return res.status(400).json({ error: 'رمز الدعوة غير صحيح' });

      // Ensure code not already used
      const alreadyUsed = await client.query('SELECT id FROM users WHERE child_id = $1', [student.id]);
      if (alreadyUsed.rows.length > 0)
        return res.status(409).json({ error: 'تم استخدام هذا الرمز بالفعل' });

      await client.query('BEGIN');

      // Update student's parent info with the phone
      await client.query(
        'UPDATE students SET phone = $1 WHERE id = $2',
        [phone, student.id]
      );

      const hashed = bcrypt.hashSync(password, 10);
      const { rows: userRows } = await client.query(
        `INSERT INTO users (name, email, password, role, avatar, child_id, invite_code)
         VALUES ($1, $2, $3, 'parent', '👨', $4, $5) RETURNING *`,
        [student.name + ' (ولي الأمر)', email, hashed, student.id, normalizedCode]
      );
      const newUser = userRows[0];

      await client.query(
        `INSERT INTO activity_log (icon, text, type) VALUES ('👨', $1, 'user')`,
        [`ولي أمر جديد سجّل حسابه - الطفل: ${student.name}`]
      );
      await client.query('COMMIT');

      const token = signToken(newUser);
      const { password: _, ...safeUser } = newUser;
      return res.status(201).json({ token, user: safeUser });
    }

    // ── TEACHER FLOW ──
    if (role === 'teacher') {
      const { rows: teachers } = await client.query(
        'SELECT id, name, invite_code_hash FROM teachers WHERE invite_code_hash IS NOT NULL'
      );
      const teacher = teachers.find((t) => bcrypt.compareSync(normalizedCode, t.invite_code_hash));
      if (!teacher) return res.status(400).json({ error: 'رمز الدعوة غير صحيح' });

      const alreadyUsed = await client.query('SELECT id FROM users WHERE teacher_id = $1', [teacher.id]);
      if (alreadyUsed.rows.length > 0)
        return res.status(409).json({ error: 'تم استخدام هذا الرمز بالفعل' });

      // Find teacher's assigned class
      const classRes = await client.query(
        'SELECT id FROM classes WHERE teacher_id = $1 LIMIT 1',
        [teacher.id]
      );
      const classId = classRes.rows[0]?.id || null;

      await client.query('BEGIN');
      const hashed = bcrypt.hashSync(password, 10);

      // Update teacher's email in teachers table too
      await client.query('UPDATE teachers SET email = $1 WHERE id = $2', [email, teacher.id]);

      const { rows: userRows } = await client.query(
        `INSERT INTO users (name, email, password, role, avatar, class_id, teacher_id, invite_code)
         VALUES ($1, $2, $3, 'teacher', '👩‍🏫', $4, $5, $6) RETURNING *`,
        [teacher.name, email, hashed, classId, teacher.id, normalizedCode]
      );
      const newUser = userRows[0];

      await client.query(
        `INSERT INTO activity_log (icon, text, type) VALUES ('👩‍🏫', $1, 'user')`,
        [`معلمة جديدة سجّلت حسابها: ${teacher.name}`]
      );
      await client.query('COMMIT');

      const token = signToken(newUser);
      const { password: _, ...safeUser } = newUser;
      return res.status(201).json({ token, user: safeUser });
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Register error:', err);
    res.status(500).json({ error: 'خطأ في إنشاء الحساب' });
  } finally {
    client.release();
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
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
