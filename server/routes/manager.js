const express = require('express');
const db      = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const guard  = [verifyToken, requireRole('manager')];

// ── HELPER ────────────────────────────────────────────────────
const logActivity = (client, icon, text, type) =>
  client.query('INSERT INTO activity_log (icon, text, type) VALUES ($1, $2, $3)', [icon, text, type]);

// ── OVERVIEW ──────────────────────────────────────────────────
router.get('/overview', ...guard, async (req, res) => {
  try {
    const [studentsRes, presentRes, classesRes, teachersRes, absentRes, logRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM students'),
      db.query(`SELECT COUNT(*) FROM daily_reports WHERE report_date = CURRENT_DATE AND present = true`),
      db.query(`
        SELECT c.*, t.name AS teacher_name,
          (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count
        FROM classes c
        LEFT JOIN teachers t ON t.id = c.teacher_id
        ORDER BY c.id
      `),
      db.query('SELECT COUNT(*) FROM teachers WHERE active = true'),
      db.query(`
        SELECT s.* FROM students s
        LEFT JOIN daily_reports dr ON dr.student_id = s.id AND dr.report_date = CURRENT_DATE
        WHERE dr.present IS FALSE OR dr.id IS NULL
      `),
      db.query('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10'),
    ]);

    const total   = parseInt(studentsRes.rows[0].count);
    const present = parseInt(presentRes.rows[0].count);

    res.json({
      totalStudents:  total,
      totalClasses:   classesRes.rows.length,
      activeTeachers: parseInt(teachersRes.rows[0].count),
      attendancePct:  total > 0 ? Math.round((present / total) * 100) : 0,
      absentStudents: absentRes.rows,
      activityLog:    logRes.rows,
      classes:        classesRes.rows.map(c => ({ ...c, studentCount: parseInt(c.student_count) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب البيانات العامة' });
  }
});

// ── STUDENTS ──────────────────────────────────────────────────
router.get('/students', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*,
        COALESCE(dr.present, false)   AS present,
        dr.mood, dr.meals, dr.potty, dr.note, dr.arrival_time, dr.behavior
      FROM students s
      LEFT JOIN daily_reports dr ON dr.student_id = s.id AND dr.report_date = CURRENT_DATE
      ORDER BY s.class_id, s.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الطلاب' });
  }
});

router.post('/students', ...guard, async (req, res) => {
  const client = await db.connect();
  try {
    const { name, gender, age, classId, parentName, phone, medication } = req.body;
    if (!name || !classId) return res.status(400).json({ error: 'الاسم والفصل مطلوبان' });
    await client.query('BEGIN');
    const avatar = gender === 'أنثى' ? '👧' : '👦';
    const { rows } = await client.query(
      `INSERT INTO students (name, avatar, gender, age, class_id, parent_name, phone, medication)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, avatar, gender || 'ذكر', parseInt(age) || 4, classId, parentName || '', phone || '', !!medication]
    );
    await logActivity(client, '👦', `تم تسجيل طالب جديد: ${name} في ${classId}`, 'student');
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'خطأ في إضافة الطالب' });
  } finally { client.release(); }
});

router.put('/students/:id', ...guard, async (req, res) => {
  try {
    const { name, gender, age, classId, parentName, phone, medication } = req.body;
    const { rows } = await db.query(
      `UPDATE students SET
        name = COALESCE($1, name), gender = COALESCE($2, gender), age = COALESCE($3, age),
        class_id = COALESCE($4, class_id), parent_name = COALESCE($5, parent_name),
        phone = COALESCE($6, phone), medication = COALESCE($7, medication)
       WHERE id = $8 RETURNING *`,
      [name, gender, age ? parseInt(age) : null, classId, parentName, phone, medication !== undefined ? !!medication : null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الطالب غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الطالب' }); }
});

router.delete('/students/:id', ...guard, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM students WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'الطالب غير موجود' });
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) { res.status(500).json({ error: 'خطأ في حذف الطالب' }); }
});

// Move student to different class
router.patch('/students/:id/class', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE students SET class_id = $1 WHERE id = $2 RETURNING *',
      [req.body.classId, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الطالب غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في نقل الطالب' }); }
});

// ── CLASSES ───────────────────────────────────────────────────
router.get('/classes', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count,
        t.name AS teacher_name
      FROM classes c
      LEFT JOIN teachers t ON t.id = c.teacher_id
      ORDER BY c.id
    `);
    res.json(rows.map(c => ({ ...c, studentCount: parseInt(c.student_count) })));
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الفصول' }); }
});

router.post('/classes', ...guard, async (req, res) => {
  const client = await db.connect();
  try {
    const { name, gradeLevel, capacity, teacherId, color } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم الفصل مطلوب' });
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO classes (id, name, grade_level, capacity, teacher_id, color)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, name, gradeLevel || 'روضة أولى', parseInt(capacity) || 20, teacherId ? parseInt(teacherId) : null, color || 'blue']
    );
    await logActivity(client, '🏫', `تم إنشاء فصل جديد: ${name}`, 'class');
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'الفصل موجود بالفعل' });
    res.status(500).json({ error: 'خطأ في إضافة الفصل' });
  } finally { client.release(); }
});

router.put('/classes/:id', ...guard, async (req, res) => {
  try {
    const { name, gradeLevel, capacity, teacherId, color } = req.body;
    const { rows } = await db.query(
      `UPDATE classes SET
        name = COALESCE($1, name), grade_level = COALESCE($2, grade_level),
        capacity = COALESCE($3, capacity), teacher_id = $4, color = COALESCE($5, color)
       WHERE id = $6 RETURNING *`,
      [name, gradeLevel, capacity ? parseInt(capacity) : null, teacherId ? parseInt(teacherId) : null, color, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الفصل غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الفصل' }); }
});

router.delete('/classes/:id', ...guard, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM classes WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'الفصل غير موجود' });
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) { res.status(500).json({ error: 'خطأ في حذف الفصل' }); }
});

// Assign teacher to class
router.patch('/classes/:id/teacher', ...guard, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const teacherId = req.body.teacherId ? parseInt(req.body.teacherId) : null;
    const { rows } = await client.query(
      'UPDATE classes SET teacher_id = $1 WHERE id = $2 RETURNING *',
      [teacherId, req.params.id]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'الفصل غير موجود' }); }
    // Update teacher's assigned_classes array
    // Remove this class from all teachers
    await client.query(
      `UPDATE teachers SET assigned_classes = array_remove(assigned_classes, $1)`,
      [req.params.id]
    );
    // Add this class to the new teacher
    if (teacherId) {
      await client.query(
        `UPDATE teachers SET assigned_classes = array_append(assigned_classes, $1)
         WHERE id = $2 AND NOT ($1 = ANY(assigned_classes))`,
        [req.params.id, teacherId]
      );
    }
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'خطأ في تعيين المعلمة' });
  } finally { client.release(); }
});

// ── TEACHERS ──────────────────────────────────────────────────
router.get('/teachers', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM teachers ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب المعلمات' }); }
});

router.post('/teachers', ...guard, async (req, res) => {
  const client = await db.connect();
  try {
    const { name, phone, email, specialization, assignedClasses } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم المعلمة مطلوب' });
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO teachers (name, phone, email, specialization, assigned_classes, join_date, active)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, true) RETURNING *`,
      [name, phone || '', email || '', specialization || 'رياض أطفال', assignedClasses || []]
    );
    await logActivity(client, '👩‍🏫', `تم إضافة معلمة جديدة: ${name}`, 'teacher');
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'خطأ في إضافة المعلمة' });
  } finally { client.release(); }
});

router.put('/teachers/:id', ...guard, async (req, res) => {
  try {
    const { name, phone, email, specialization, active } = req.body;
    const { rows } = await db.query(
      `UPDATE teachers SET
        name = COALESCE($1, name), phone = COALESCE($2, phone),
        email = COALESCE($3, email), specialization = COALESCE($4, specialization),
        active = COALESCE($5, active)
       WHERE id = $6 RETURNING *`,
      [name, phone, email, specialization, active !== undefined ? !!active : null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'المعلمة غير موجودة' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث المعلمة' }); }
});

router.delete('/teachers/:id', ...guard, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM teachers WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'المعلمة غير موجودة' });
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) { res.status(500).json({ error: 'خطأ في حذف المعلمة' }); }
});

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
router.get('/announcements', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الإعلانات' }); }
});

router.post('/announcements', ...guard, async (req, res) => {
  const client = await db.connect();
  try {
    const { title, body, color, target } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'العنوان والنص مطلوبان' });
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO announcements (title, body, color, target) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, body, color || 'blue', target || 'all']
    );
    await logActivity(client, '📢', `تم نشر إعلان: ${title}`, 'announcement');
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'خطأ في إضافة الإعلان' });
  } finally { client.release(); }
});

router.put('/announcements/:id', ...guard, async (req, res) => {
  try {
    const { title, body, color, target } = req.body;
    const { rows } = await db.query(
      `UPDATE announcements SET
        title = COALESCE($1, title), body = COALESCE($2, body),
        color = COALESCE($3, color), target = COALESCE($4, target)
       WHERE id = $5 RETURNING *`,
      [title, body, color, target, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الإعلان غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الإعلان' }); }
});

router.delete('/announcements/:id', ...guard, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'الإعلان غير موجود' });
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) { res.status(500).json({ error: 'خطأ في حذف الإعلان' }); }
});

// ── MANAGER ATTENDANCE TOGGLE ─────────────────────────────────
router.patch('/students/:id/attendance', ...guard, async (req, res) => {
  try {
    const { present, arrivalTime } = req.body;
    const { rows } = await db.query(
      `INSERT INTO daily_reports (student_id, report_date, present, arrival_time)
       VALUES ($1, CURRENT_DATE, $2, $3)
       ON CONFLICT (student_id, report_date) DO UPDATE
         SET present = $2, arrival_time = $3,
             mood = CASE WHEN $2 = false THEN NULL ELSE daily_reports.mood END
       RETURNING *`,
      [req.params.id, !!present, arrivalTime || null]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الحضور' }); }
});

// ── INVITE CODE GENERATION ────────────────────────────────────
const crypto = require('crypto');
const bcrypt  = require('bcryptjs');

function generateInviteCode() {
  // Format: XXXX-XXXX-XXXX  (12 uppercase alphanumeric chars, hard to guess)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  const raw   = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${raw.slice(0,4)}-${raw.slice(4,8)}-${raw.slice(8,12)}`;
}

// POST /api/manager/students/:id/generate-code
router.post('/students/:id/generate-code', ...guard, async (req, res) => {
  try {
    const code   = generateInviteCode();
    const hashed = bcrypt.hashSync(code, 10);
    const { rows } = await db.query(
      'UPDATE students SET invite_code_hash = $1 WHERE id = $2 RETURNING id, name',
      [hashed, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الطالب غير موجود' });
    // Return plaintext code ONCE — manager must copy it now
    res.json({ plainCode: code, studentName: rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في توليد رمز الدعوة' });
  }
});

// POST /api/manager/teachers/:id/generate-code
router.post('/teachers/:id/generate-code', ...guard, async (req, res) => {
  try {
    const code   = generateInviteCode();
    const hashed = bcrypt.hashSync(code, 10);
    const { rows } = await db.query(
      'UPDATE teachers SET invite_code_hash = $1 WHERE id = $2 RETURNING id, name',
      [hashed, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'المعلمة غير موجودة' });
    res.json({ plainCode: code, teacherName: rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في توليد رمز الدعوة' });
  }
});

// ── GET /api/manager/students/:id/notes ──────────────────────
router.get('/students/:id/notes', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE student_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الملاحظات' }); }
});

// ── RESET KEY GENERATION (Password Reset by Manager) ─────────
// POST /api/manager/teachers/:id/generate-reset-key
// Generates a one-time 6-digit reset key for the teacher's user account
router.post('/teachers/:id/generate-reset-key', ...guard, async (req, res) => {
  try {
    const { rows: userRows } = await db.query(
      'SELECT id, name FROM users WHERE teacher_id = $1', [req.params.id]
    );
    if (!userRows[0]) return res.status(404).json({ error: 'لا يوجد حساب مرتبط بهذه المعلمة' });

    const otp    = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = bcrypt.hashSync(otp, 10);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [hashed, expiry.toISOString(), userRows[0].id]
    );

    res.json({ resetKey: otp, userName: userRows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في توليد رمز إعادة التعيين' });
  }
});

// POST /api/manager/students/:id/generate-reset-key
// Generates a one-time 6-digit reset key for the parent account linked to this student
router.post('/students/:id/generate-reset-key', ...guard, async (req, res) => {
  try {
    const { rows: userRows } = await db.query(
      'SELECT id, name FROM users WHERE child_id = $1', [req.params.id]
    );
    if (!userRows[0]) return res.status(404).json({ error: 'لا يوجد حساب ولي أمر مرتبط بهذا الطالب' });

    const otp    = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = bcrypt.hashSync(otp, 10);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [hashed, expiry.toISOString(), userRows[0].id]
    );

    res.json({ resetKey: otp, userName: userRows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في توليد رمز إعادة التعيين' });
  }
});

// ── GET /api/manager/daily-reports ───────────────────────────
// Returns all student daily reports (today), with class and teacher info
router.get('/daily-reports', ...guard, async (req, res) => {
  try {
    const classId = req.query.classId; // optional filter
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const { rows } = await db.query(`
      SELECT
        s.id, s.name, s.avatar, s.gender, s.class_id,
        c.name AS class_name,
        t.name AS teacher_name,
        COALESCE(dr.present, false) AS present,
        dr.arrival_time, dr.mood, dr.meals, dr.potty, dr.behavior,
        COALESCE(dr.note, '') AS note,
        dr.report_date
      FROM students s
      LEFT JOIN classes c ON c.id = s.class_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      LEFT JOIN daily_reports dr ON dr.student_id = s.id AND dr.report_date = $1::date
      ${classId ? 'WHERE s.class_id = $2' : ''}
      ORDER BY s.class_id, s.name
    `, classId ? [dateStr, classId] : [dateStr]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب التقارير' });
  }
});

// ── GET /api/manager/messages/parent/:studentId ──────────────
// Get manager<->parent conversation for a specific student
router.get('/messages/parent/:studentId', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM messages
       WHERE conversation_type = 'manager_parent' AND participant_id = $1
       ORDER BY created_at ASC`,
      [String(req.params.studentId)]
    );
    // Mark all parent messages as read by manager
    await db.query(
      `UPDATE messages SET read_by_manager = true
       WHERE conversation_type = 'manager_parent' AND participant_id = $1 AND from_role = 'parent'`,
      [String(req.params.studentId)]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الرسائل' }); }
});

// ── POST /api/manager/messages/parent/:studentId ────────────
// Manager sends a message to a parent
router.post('/messages/parent/:studentId', ...guard, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'نص الرسالة مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_type, participant_id, from_role, from_name, text, read_by_manager)
       VALUES ('manager_parent', $1, 'manager', 'المدير', $2, true) RETURNING *`,
      [String(req.params.studentId), text.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
});

// ── GET /api/manager/messages/teacher/:teacherId ────────────
// Manager<->teacher conversation
router.get('/messages/teacher/:teacherId', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM messages
       WHERE conversation_type = 'manager_teacher' AND participant_id = $1
       ORDER BY created_at ASC`,
      [String(req.params.teacherId)]
    );
    // Mark teacher messages as read by manager
    await db.query(
      `UPDATE messages SET read_by_manager = true
       WHERE conversation_type = 'manager_teacher' AND participant_id = $1 AND from_role = 'teacher'`,
      [String(req.params.teacherId)]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الرسائل' }); }
});

// ── POST /api/manager/messages/teacher/:teacherId ───────────
// Manager sends a message to a teacher
router.post('/messages/teacher/:teacherId', ...guard, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'نص الرسالة مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_type, participant_id, from_role, from_name, text, read_by_manager)
       VALUES ('manager_teacher', $1, 'manager', 'المدير', $2, true) RETURNING *`,
      [String(req.params.teacherId), text.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
});

// ── GET /api/manager/notifications ─────────────────────────────
// Returns count of unread messages from parents and teachers
router.get('/notifications', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM messages WHERE from_role != 'manager' AND read_by_manager = false`
    );
    res.json({ unread: parseInt(rows[0].count) });
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الإشعارات' }); }
});

// ── GET /api/manager/messages/parent-list ───────────────────
// List of parent conversations with last message + student name
router.get('/messages/parent-list', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        m.participant_id AS student_id,
        s.name           AS student_name,
        s.avatar         AS student_avatar,
        s.class_id,
        MAX(m.created_at) AS last_message_at,
        SUM(CASE WHEN m.from_role = 'parent' AND m.read_by_manager = false THEN 1 ELSE 0 END) AS unread_count
      FROM messages m
      LEFT JOIN students s ON s.id = m.participant_id::integer
      WHERE m.conversation_type = 'manager_parent'
      GROUP BY m.participant_id, s.name, s.avatar, s.class_id
      ORDER BY last_message_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب المحادثات' }); }
});

// ── GET /api/manager/messages/teacher-list ──────────────────
// List of teacher conversations with last message + teacher name
router.get('/messages/teacher-list', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        m.participant_id AS teacher_id,
        t.name           AS teacher_name,
        MAX(m.created_at) AS last_message_at,
        SUM(CASE WHEN m.from_role = 'teacher' AND m.read_by_manager = false THEN 1 ELSE 0 END) AS unread_count
      FROM messages m
      LEFT JOIN teachers t ON t.id = m.participant_id::integer
      WHERE m.conversation_type = 'manager_teacher'
      GROUP BY m.participant_id, t.name
      ORDER BY last_message_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب المحادثات' }); }
});

module.exports = router;

