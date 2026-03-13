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
// Returns only the classes assigned to the logged-in teacher
router.get('/classes', ...guard, async (req, res) => {
  try {
    const { teacherId } = req.user;
    if (!teacherId) {
      // Fallback: return all classes if no teacher record linked
      const { rows } = await db.query('SELECT * FROM classes ORDER BY id');
      return res.json(rows);
    }
    // Get teacher's assigned_classes array
    const { rows: teacherRows } = await db.query(
      'SELECT assigned_classes FROM teachers WHERE id = $1', [teacherId]
    );
    const assignedClasses = teacherRows[0]?.assigned_classes || [];
    if (assignedClasses.length === 0) {
      return res.json([]);
    }
    const { rows } = await db.query(
      'SELECT * FROM classes WHERE id = ANY($1) ORDER BY id',
      [assignedClasses]
    );
    res.json(rows);
  } catch (err) {
    console.error('teacher/classes error:', err);
    res.status(500).json({ error: 'خطأ في جلب الفصول' });
  }
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
      // Store as JSON string since behavior column is TEXT
      const behaviorVal = typeof req.body.behavior === 'object'
        ? JSON.stringify(req.body.behavior)
        : req.body.behavior;
      const { rows } = await upsertReport(client, req.params.id, { behavior: behaviorVal });
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
// Accepts { times: string[] } — replaces today's entire potty array
router.patch('/students/:id/potty', ...guard, async (req, res) => {
  try {
    const times = Array.isArray(req.body.times) ? req.body.times : [];
    const { rows } = await db.query(
      `INSERT INTO daily_reports (student_id, report_date, potty)
       VALUES ($1, CURRENT_DATE, $2::text[])
       ON CONFLICT (student_id, report_date) DO UPDATE
         SET potty = $2::text[]
       RETURNING *`,
      [req.params.id, times]
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
    const noteText = (req.body.note || '').trim();
    const studentId = req.params.id;
    const client = await db.connect();
    try {
      // 1. Upsert into daily_reports (shows in Daily Report tab)
      const { rows } = await upsertReport(client, studentId, { note: noteText });

      // 2. Also write to notes table (shows in parent's Notes tab)
      //    Deduplicate: only insert if the same text wasn't already saved today
      //    by this teacher for this student
      if (noteText) {
        await client.query(
          `INSERT INTO notes (student_id, from_role, from_name, text)
           SELECT $1, 'teacher', $2, $3
           WHERE NOT EXISTS (
             SELECT 1 FROM notes
             WHERE student_id = $1
               AND from_role = 'teacher'
               AND text = $3
               AND DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE
           )`,
          [studentId, req.user.name, noteText]
        );
      }
      res.json(rows[0]);
    } finally { client.release(); }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تحديث الملاحظة' });
  }
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

// ── GET /api/teacher/subjects ─────────────────────────────────
// Returns subjects for a class (classId from query or teacher's primary class)
router.get('/subjects', ...guard, async (req, res) => {
  try {
    const classId = req.query.classId || req.user.classId;
    if (!classId) return res.status(400).json({ error: 'لم يتم تعيين فصل لهذه المعلمة' });
    const { rows } = await db.query(
      'SELECT * FROM class_subjects WHERE class_id = $1 ORDER BY created_at',
      [classId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في جلب المواد' }); }
});

// ── POST /api/teacher/subjects ────────────────────────────────
router.post('/subjects', ...guard, async (req, res) => {
  try {
    // Accept classId from body (active class on teacher's dashboard)
    const classId = req.body.classId || req.user.classId;
    const { name, icon, color } = req.body;
    if (!name)    return res.status(400).json({ error: 'اسم المادة مطلوب' });
    if (!classId) return res.status(400).json({ error: 'معرف الفصل مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO class_subjects (class_id, name, icon, color)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [classId, name, icon || '📚', color || 'blue']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'هذه المادة موجودة بالفعل' });
    res.status(500).json({ error: 'خطأ في إضافة المادة' });
  }
});

// ── DELETE /api/teacher/subjects/:id ──────────────────────────
router.delete('/subjects/:id', ...guard, async (req, res) => {
  try {
    await db.query('DELETE FROM class_subjects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'خطأ في حذف المادة' }); }
});

// ── GET /api/teacher/daily-subjects ───────────────────────────
// Returns today's log for all subjects in the specified class
router.get('/daily-subjects', ...guard, async (req, res) => {
  try {
    const classId = req.query.classId || req.user.classId;
    if (!classId) return res.status(400).json({ error: 'لم يتم تعيين فصل' });
    const { rows } = await db.query(
      `SELECT cs.id, cs.name, cs.icon, cs.color,
              COALESCE(dsl.taught, false)        AS taught,
              COALESCE(dsl.lesson_topic, '')     AS lesson_topic,
              COALESCE(dsl.assignment, '')        AS assignment
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

// ── POST /api/teacher/daily-subjects ─────────────────────────
// Upsert: mark a subject as taught today, set lesson_topic, and/or assignment
router.post('/daily-subjects', ...guard, async (req, res) => {
  try {
    // Accept classId from body (active class on teacher's dashboard)
    const classId = req.body.classId || req.user.classId;
    const { subjectId, taught, lessonTopic, assignment } = req.body;
    if (!subjectId) return res.status(400).json({ error: 'معرف المادة مطلوب' });
    if (!classId)   return res.status(400).json({ error: 'معرف الفصل مطلوب' });
    const { rows } = await db.query(
      `INSERT INTO daily_subject_log (subject_id, class_id, log_date, taught, lesson_topic, assignment)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
       ON CONFLICT (subject_id, log_date) DO UPDATE
         SET taught = $3, lesson_topic = $4, assignment = $5
       RETURNING *`,
      [subjectId, classId, !!taught, lessonTopic || '', assignment || '']
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في تحديث مادة اليوم' }); }
});

module.exports = router;

