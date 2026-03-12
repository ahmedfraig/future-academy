-- ============================================================
-- Future Academy - Nursery & Daycare Management System
-- PostgreSQL Schema (Supabase Compatible)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── TEACHERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id              SERIAL PRIMARY KEY,
  name            TEXT        NOT NULL,
  avatar          TEXT        NOT NULL DEFAULT '👩‍🏫',
  phone           TEXT        NOT NULL DEFAULT '',
  email           TEXT        NOT NULL DEFAULT '',
  assigned_classes TEXT[]     NOT NULL DEFAULT '{}',
  specialization  TEXT        NOT NULL DEFAULT 'رياض أطفال',
  join_date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  active          BOOLEAN     NOT NULL DEFAULT true
);

-- ── CLASSES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          TEXT PRIMARY KEY,
  name        TEXT    NOT NULL,
  grade_level TEXT    NOT NULL DEFAULT 'روضة أولى',
  capacity    INTEGER NOT NULL DEFAULT 20,
  teacher_id  INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  color       TEXT    NOT NULL DEFAULT 'blue'
);

-- ── STUDENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           SERIAL PRIMARY KEY,
  name         TEXT    NOT NULL,
  avatar       TEXT    NOT NULL DEFAULT '👦',
  gender       TEXT    NOT NULL DEFAULT 'ذكر',
  age          INTEGER NOT NULL DEFAULT 4,
  class_id     TEXT    REFERENCES classes(id) ON DELETE SET NULL,
  parent_name  TEXT    NOT NULL DEFAULT '',
  phone        TEXT    NOT NULL DEFAULT '',
  medication   BOOLEAN NOT NULL DEFAULT false
);

-- ── USERS (auth) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  role        TEXT    NOT NULL CHECK (role IN ('manager', 'teacher', 'parent')),
  avatar      TEXT    NOT NULL DEFAULT '👤',
  class_id    TEXT    REFERENCES classes(id) ON DELETE SET NULL,
  teacher_id  INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  child_id    INTEGER REFERENCES students(id) ON DELETE SET NULL
);

-- ── DAILY REPORTS ────────────────────────────────────────────
-- One row per student per day — captures full daily snapshot
CREATE TABLE IF NOT EXISTS daily_reports (
  id           SERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  report_date  DATE    NOT NULL DEFAULT CURRENT_DATE,
  present      BOOLEAN NOT NULL DEFAULT false,
  arrival_time TEXT,
  mood         TEXT,
  behavior     TEXT,
  meals        JSONB   NOT NULL DEFAULT '{}',
  potty        TEXT[]  NOT NULL DEFAULT '{}',
  note         TEXT    NOT NULL DEFAULT '',
  UNIQUE (student_id, report_date)
);

-- ── ANNOUNCEMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT    NOT NULL,
  body        TEXT    NOT NULL,
  color       TEXT    NOT NULL DEFAULT 'blue',
  target      TEXT    NOT NULL DEFAULT 'all',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── NOTES (teacher ↔ parent messages) ────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_role   TEXT    NOT NULL,
  from_name   TEXT    NOT NULL,
  text        TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ACTIVITY LOG ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  icon        TEXT    NOT NULL DEFAULT '📝',
  text        TEXT    NOT NULL,
  type        TEXT    NOT NULL DEFAULT 'general',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INDEXES FOR PERFORMANCE ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_class_id    ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_lookup ON daily_reports(student_id, report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date   ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_notes_student_id     ON notes(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
