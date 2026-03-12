-- ============================================================
-- Migration: Add class_subjects and daily_subject_log tables
-- Run this in Supabase SQL editor
-- ============================================================

-- ── CLASS SUBJECTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_subjects (
  id         SERIAL PRIMARY KEY,
  class_id   TEXT    NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  icon       TEXT    NOT NULL DEFAULT '📚',
  color      TEXT    NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, name)
);

-- ── DAILY SUBJECT LOG ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_subject_log (
  id          SERIAL PRIMARY KEY,
  subject_id  INTEGER NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
  class_id    TEXT    NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  log_date    DATE    NOT NULL DEFAULT CURRENT_DATE,
  taught      BOOLEAN NOT NULL DEFAULT false,
  assignment  TEXT    NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subject_id, log_date)
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_class_subjects_class  ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_daily_subject_log_date ON daily_subject_log(class_id, log_date);

-- ── SEED SAMPLE SUBJECTS FOR EXISTING CLASSES ─────────────────
-- Uncomment and adjust class IDs as needed after running:
-- INSERT INTO class_subjects (class_id, name, icon, color) VALUES
--   ('A1', 'القرآن الكريم', '📖', 'emerald'),
--   ('A1', 'اللغة العربية', '✏️', 'blue'),
--   ('A1', 'الرياضيات', '🔢', 'violet'),
--   ('A1', 'العلوم', '🔬', 'sky'),
--   ('A1', 'الرسم والفنون', '🎨', 'pink'),
--   ('A1', 'التربية البدنية', '⚽', 'amber')
-- ON CONFLICT DO NOTHING;
