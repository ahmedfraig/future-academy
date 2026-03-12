const express = require('express');
const db      = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const guard  = [verifyToken, requireRole('parent')];

// ── GET /api/parent/child ──────────────────────────────────────
router.get('/child', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });

    const { rows } = await db.query(`
      SELECT
        s.*,
        COALESCE(dr.present, false)    AS present,
        dr.mood, dr.meals, dr.potty,
        COALESCE(dr.note, '')          AS note,
        dr.arrival_time, dr.behavior,
        c.id       AS class_id_val,
        c.name     AS class_name,
        c.grade_level,
        c.color,
        t.name     AS teacher_name,
        t.avatar   AS teacher_avatar
      FROM students s
      LEFT JOIN daily_reports dr
        ON dr.student_id = s.id AND dr.report_date = CURRENT_DATE
      LEFT JOIN classes  c ON c.id = s.class_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      WHERE s.id = $1
    `, [childId]);

    if (!rows[0]) return res.status(404).json({ error: 'الطفل غير موجود' });

    const row = rows[0];
    res.json({
      child: {
        id: row.id, name: row.name, avatar: row.avatar,
        gender: row.gender, age: row.age, class_id: row.class_id,
        parent_name: row.parent_name, phone: row.phone, medication: row.medication,
        present: row.present, mood: row.mood, meals: row.meals,
        potty: row.potty, note: row.note, arrival_time: row.arrival_time,
        behavior: row.behavior,
      },
      class: row.class_id_val ? {
        id: row.class_id_val, name: row.class_name,
        gradeLevel: row.grade_level, color: row.color,
      } : null,
      teacher: row.teacher_name ? { name: row.teacher_name, avatar: row.teacher_avatar } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الطفل' });
  }
});

// ── GET /api/parent/reports ────────────────────────────────────
// Historical daily reports for the parent's child (newest first)
router.get('/reports', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });
    const limit  = parseInt(req.query.limit)  || 30;
    const offset = parseInt(req.query.offset) || 0;
    const { rows } = await db.query(
      `SELECT * FROM daily_reports
       WHERE student_id = $1
       ORDER BY report_date DESC
       LIMIT $2 OFFSET $3`,
      [childId, limit, offset]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب التقارير' }); }
});

// ── GET /api/parent/announcements ─────────────────────────────
router.get('/announcements', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    // get child's class to filter class-specific announcements
    const childRes = await db.query('SELECT class_id FROM students WHERE id = $1', [childId]);
    const classId  = childRes.rows[0]?.class_id;
    const { rows } = await db.query(
      `SELECT * FROM announcements
       WHERE target = 'all' OR target = $1
       ORDER BY created_at DESC`,
      [classId || '']
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الإعلانات' }); }
});

// ── GET /api/parent/notes ─────────────────────────────────────
router.get('/notes', ...guard, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE student_id = $1 ORDER BY created_at DESC',
      [req.user.childId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الملاحظات' }); }
});

// ── POST /api/parent/notes ────────────────────────────────────
router.post('/notes', ...guard, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'نص الملاحظة مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO notes (student_id, from_role, from_name, text)
       VALUES ($1, 'parent', $2, $3) RETURNING *`,
      [req.user.childId, req.user.name, text]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في إرسال الملاحظة' }); }
});

// ── GET /api/parent/daily-subjects ────────────────────────────
// Returns today's subject log for the child's class
router.get('/daily-subjects', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });

    // Get the child's class
    const childRes = await db.query('SELECT class_id FROM students WHERE id = $1', [childId]);
    const classId  = childRes.rows[0]?.class_id;
    if (!classId) return res.json([]);

    const { rows } = await db.query(
      `SELECT cs.id, cs.name, cs.icon, cs.color,
              COALESCE(dsl.taught, false) AS taught,
              COALESCE(dsl.assignment, '') AS assignment
       FROM class_subjects cs
       LEFT JOIN daily_subject_log dsl
         ON dsl.subject_id = cs.id AND dsl.log_date = CURRENT_DATE
       WHERE cs.class_id = $1
       ORDER BY cs.created_at`,
      [classId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب مواد اليوم' }); }
});

module.exports = router;

