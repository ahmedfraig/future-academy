const express = require('express');
const db      = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const guard  = [verifyToken, requireRole('teacher')];

// ── HELPER: upsert today's daily report ───────────────────────
const upsertReport = (client, studentId, fields) => client.query(
  `INSERT INTO daily_reports (student_id, report_date, ${Object.keys(fields).join(', ')})
   VALUES ($1, CURRENT_DATE, ${Object.keys(fields).map((_, i) => `$${i + 2}`).join(', ')})
   ON CONFLICT (student_id, report_date) DO UPDATE SET
     ${Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ')}
   RETURNING *`,
  [studentId, ...Object.values(fields)]
);

// ── GET /api/teacher/my-class ──────────────────────────────────
router.get('/my-class', ...guard, async (req, res) => {
  try {
    const { classId } = req.user;
    if (!classId) return res.status(400).json({ error: 'لم يتم تعيين فصل لهذه المعلمة' });

    const [classRes, studentsRes] = await Promise.all([
      db.query('SELECT * FROM classes WHERE id = $1', [classId]),
      db.query(`
        SELECT s.*,
          COALESCE(dr.present, false)    AS present,
          dr.mood, dr.meals, dr.potty,
          COALESCE(dr.note, '')          AS note,
          dr.arrival_time, dr.behavior
        FROM students s
        LEFT JOIN daily_reports dr
          ON dr.student_id = s.id AND dr.report_date = CURRENT_DATE
        WHERE s.class_id = $1
        ORDER BY s.name
      `, [classId]),
    ]);
    res.json({ class: classRes.rows[0], students: studentsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الفصل' });
  }
});

// ── GET /api/teacher/classes ───────────────────────────────────
router.get('/classes', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM classes ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الفصول' }); }
});

// ── GET /api/teacher/students ──────────────────────────────────
router.get('/students', ...guard, async (req, res) => {
  try {
    const { classId } = req.query;
    const { rows } = await db.query(`
      SELECT s.*,
        COALESCE(dr.present, false) AS present,
        dr.mood, dr.meals, dr.potty,
        COALESCE(dr.note, '') AS note,
        dr.arrival_time, dr.behavior
      FROM students s
      LEFT JOIN daily_reports dr
        ON dr.student_id = s.id AND dr.report_date = CURRENT_DATE
      ${classId ? 'WHERE s.class_id = $1' : ''}
      ORDER BY s.class_id, s.name
    `, classId ? [classId] : []);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الطلاب' }); }
});

// ── PATCH /api/teacher/students/:id/attendance ─────────────────
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

// ── PATCH /api/teacher/students/:id/mood ──────────────────────
router.patch('/students/:id/mood', ...guard, async (req, res) => {
  try {
    const client = await db.connect();
    try {
      const { rows } = await upsertReport(client, req.params.id, { mood: req.body.mood });
      res.json(rows[0]);
    } finally { client.release(); }
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث المزاج' }); }
});

// ── PATCH /api/teacher/students/:id/behavior ──────────────────
router.patch('/students/:id/behavior', ...guard, async (req, res) => {
  try {
    const client = await db.connect();
    try {
      const { rows } = await upsertReport(client, req.params.id, { behavior: req.body.behavior });
      res.json(rows[0]);
    } finally { client.release(); }
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث السلوك' }); }
});

// ── PATCH /api/teacher/students/:id/meal ──────────────────────
router.patch('/students/:id/meal', ...guard, async (req, res) => {
  try {
    // Merge new meals into existing JSONB
    const { rows } = await db.query(
      `INSERT INTO daily_reports (student_id, report_date, meals)
       VALUES ($1, CURRENT_DATE, $2::jsonb)
       ON CONFLICT (student_id, report_date) DO UPDATE
         SET meals = daily_reports.meals || $2::jsonb
       RETURNING *`,
      [req.params.id, JSON.stringify(req.body.meals || {})]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الوجبات' }); }
});

// ── PATCH /api/teacher/students/:id/potty ─────────────────────
router.patch('/students/:id/potty', ...guard, async (req, res) => {
  try {
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const { rows } = await db.query(
      `INSERT INTO daily_reports (student_id, report_date, potty)
       VALUES ($1, CURRENT_DATE, ARRAY[$2]::text[])
       ON CONFLICT (student_id, report_date) DO UPDATE
         SET potty = array_append(daily_reports.potty, $2)
       RETURNING *`,
      [req.params.id, now]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تسجيل الحمام' }); }
});

// ── PATCH /api/teacher/students/:id/medication ────────────────
router.patch('/students/:id/medication', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE students SET medication = $1 WHERE id = $2 RETURNING *',
      [!!req.body.medication, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الطالب غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الدواء' }); }
});

// ── PATCH /api/teacher/students/:id/note ──────────────────────
router.patch('/students/:id/note', ...guard, async (req, res) => {
  try {
    const client = await db.connect();
    try {
      const { rows } = await upsertReport(client, req.params.id, { note: req.body.note || '' });
      res.json(rows[0]);
    } finally { client.release(); }
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث الملاحظة' }); }
});

// ── GET /api/teacher/notes/:studentId ─────────────────────────
router.get('/notes/:studentId', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE student_id = $1 ORDER BY created_at DESC',
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الملاحظات' }); }
});

// ── POST /api/teacher/notes/:studentId ────────────────────────
router.post('/notes/:studentId', ...guard, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'نص الملاحظة مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO notes (student_id, from_role, from_name, text)
       VALUES ($1, 'teacher', $2, $3) RETURNING *`,
      [req.params.studentId, req.user.name, text]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في إضافة الملاحظة' }); }
});

module.exports = router;
