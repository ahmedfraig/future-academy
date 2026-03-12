-- ============================================================
-- Migration: Add class_subjects and daily_subject_log tables
-- Run this in Supabase SQL Editor
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
CREATE INDEX IF NOT EXISTS idx_class_subjects_class   ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_daily_subject_log_date ON daily_subject_log(class_id, log_date);

-- ── SEED SUBJECTS FOR ALL CLASSES ────────────────────────────
-- Standard nursery/KG subjects for all 4 classes
INSERT INTO class_subjects (class_id, name, icon, color) VALUES
  -- KG1-A
  ('KG1-A', 'القرآن الكريم',    '📖', 'emerald'),
  ('KG1-A', 'اللغة العربية',    '✏️', 'blue'),
  ('KG1-A', 'الرياضيات',        '🔢', 'violet'),
  ('KG1-A', 'العلوم',           '🔬', 'sky'),
  ('KG1-A', 'الرسم والفنون',    '🎨', 'pink'),
  ('KG1-A', 'التربية البدنية',  '⚽', 'amber'),
  -- KG1-B
  ('KG1-B', 'القرآن الكريم',    '📖', 'emerald'),
  ('KG1-B', 'اللغة العربية',    '✏️', 'blue'),
  ('KG1-B', 'الرياضيات',        '🔢', 'violet'),
  ('KG1-B', 'العلوم',           '🔬', 'sky'),
  ('KG1-B', 'الرسم والفنون',    '🎨', 'pink'),
  ('KG1-B', 'التربية البدنية',  '⚽', 'amber'),
  -- KG2-A
  ('KG2-A', 'القرآن الكريم',    '📖', 'emerald'),
  ('KG2-A', 'اللغة العربية',    '✏️', 'blue'),
  ('KG2-A', 'اللغة الإنجليزية', '🌍', 'sky'),
  ('KG2-A', 'الرياضيات',        '🔢', 'violet'),
  ('KG2-A', 'العلوم',           '🔬', 'amber'),
  ('KG2-A', 'الرسم والفنون',    '🎨', 'pink'),
  ('KG2-A', 'التربية البدنية',  '⚽', 'red'),
  -- KG2-B
  ('KG2-B', 'القرآن الكريم',    '📖', 'emerald'),
  ('KG2-B', 'اللغة العربية',    '✏️', 'blue'),
  ('KG2-B', 'اللغة الإنجليزية', '🌍', 'sky'),
  ('KG2-B', 'الرياضيات',        '🔢', 'violet'),
  ('KG2-B', 'العلوم',           '🔬', 'amber'),
  ('KG2-B', 'الرسم والفنون',    '🎨', 'pink'),
  ('KG2-B', 'التربية البدنية',  '⚽', 'red')
ON CONFLICT (class_id, name) DO NOTHING;
