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

// ── GET /api/parent/reports ──────────────────────────────────
// Historical daily reports for the parent's child (newest first).
// Today's slot is always included even if the teacher hasn't logged anything.
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

    // Always ensure today's slot is present (even if no teacher data yet)
    const todayStr = new Date().toISOString().slice(0, 10); // e.g. '2026-03-13'
    const hasToday = rows.some((r) => {
      const d = r.report_date instanceof Date
        ? r.report_date.toISOString().slice(0, 10)
        : String(r.report_date).slice(0, 10);
      return d === todayStr;
    });
    if (!hasToday && offset === 0) {
      // Prepend a synthetic empty placeholder for today
      rows.unshift({ report_date: todayStr, student_id: childId, present: false });
    }

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

// ── GET /api/parent/notifications ────────────────────────────
// Unified notification feed: announcements + teacher notes (newest first)
router.get('/notifications', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });

    // Get child's class for filtering class-specific announcements
    const childRes = await db.query('SELECT class_id FROM students WHERE id = $1', [childId]);
    const classId  = childRes.rows[0]?.class_id;

    // Fetch announcements
    const { rows: annRows } = await db.query(
      `SELECT id, title AS title, body AS body, color, created_at
       FROM announcements
       WHERE target = 'all' OR target = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [classId || '']
    );

    // Fetch teacher notes for this child
    const { rows: noteRows } = await db.query(
      `SELECT id, text, from_name, created_at
       FROM notes
       WHERE student_id = $1 AND from_role = 'teacher'
       ORDER BY created_at DESC
       LIMIT 20`,
      [childId]
    );

    // Merge and sort
    const notifications = [
      ...annRows.map((a) => ({
        id:         `ann-${a.id}`,
        type:       'announcement',
        icon:       '📢',
        title:      a.title,
        body:       a.body,
        created_at: a.created_at,
      })),
      ...noteRows.map((n) => ({
        id:         `note-${n.id}`,
        type:       'note',
        icon:       '📝',
        title:      `ملاحظة من ${n.from_name || 'المعلمة'}`,
        body:       n.text,
        created_at: n.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الإشعارات' });
  }
});

// ── GET /api/parent/daily-subjects ───────────────────────────
// Returns the subject log for the child's class on a given date.
// Accepts optional ?date=YYYY-MM-DD param; defaults to today.
router.get('/daily-subjects', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });

    // Get the child's class
    const childRes = await db.query('SELECT class_id FROM students WHERE id = $1', [childId]);
    const classId  = childRes.rows[0]?.class_id;
    if (!classId) return res.json([]);

    // Use requested date or fall back to today
    const logDate = req.query.date || null; // e.g. '2026-03-12'

    const { rows } = await db.query(
      `SELECT cs.id, cs.name, cs.icon, cs.color,
              COALESCE(dsl.taught, false)    AS taught,
              COALESCE(dsl.lesson_topic, '') AS lesson_topic,
              COALESCE(dsl.assignment, '')   AS assignment
       FROM class_subjects cs
       LEFT JOIN daily_subject_log dsl
         ON dsl.subject_id = cs.id
         AND dsl.log_date = COALESCE($2::date, CURRENT_DATE)
       WHERE cs.class_id = $1
       ORDER BY cs.created_at`,
      [classId, logDate]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب مواد اليوم' }); }
});

// ── GET /api/parent/report-replies?date=YYYY-MM-DD ──────────
// Get all replies on the daily report note for a given date
router.get('/report-replies', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const { rows } = await db.query(
      `SELECT * FROM daily_report_replies
       WHERE student_id = $1 AND report_date = $2::date
       ORDER BY created_at ASC`,
      [childId, date]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الردود' }); }
});

// ── POST /api/parent/report-replies ──────────────────────────
// Parent sends a reply to the teacher's daily report note
router.post('/report-replies', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });
    const { text, date } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'نص الرد مطلوب' });
    const reportDate = date || new Date().toISOString().slice(0, 10);
    const { rows } = await db.query(
      `INSERT INTO daily_report_replies (report_date, student_id, from_role, from_name, text)
       VALUES ($1::date, $2, 'parent', $3, $4) RETURNING *`,
      [reportDate, childId, req.user.name, text.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في إرسال الرد' });
  }
});

// ── GET /api/parent/messages ──────────────────────────────────
// Get all messages between this parent and the manager
router.get('/messages', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });
    const { rows } = await db.query(
      `SELECT * FROM messages
       WHERE conversation_type = 'manager_parent' AND participant_id = $1
       ORDER BY created_at ASC`,
      [String(childId)]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب الرسائل' }); }
});

// ── POST /api/parent/messages ─────────────────────────────────
// Parent sends a message to manager
router.post('/messages', ...guard, async (req, res) => {
  try {
    const { childId } = req.user;
    if (!childId) return res.status(404).json({ error: 'لم يتم ربط طفل بهذا الحساب' });
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'نص الرسالة مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_type, participant_id, from_role, from_name, text, read_by_manager)
       VALUES ('manager_parent', $1, 'parent', $2, $3, false) RETURNING *`,
      [String(childId), req.user.name, text.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
});

module.exports = router;

