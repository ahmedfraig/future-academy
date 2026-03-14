-- ============================================================
-- Migration: Notes & Messaging System
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── DAILY REPORT REPLIES ──────────────────────────────────────
-- Stores parent replies to a teacher's daily report note
CREATE TABLE IF NOT EXISTS daily_report_replies (
  id          SERIAL PRIMARY KEY,
  report_date DATE    NOT NULL,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_role   TEXT    NOT NULL CHECK (from_role IN ('teacher','parent')),
  from_name   TEXT    NOT NULL,
  text        TEXT    NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dreplies_student_date
  ON daily_report_replies(student_id, report_date);

-- ── MESSAGES (Manager ↔ Parent / Manager ↔ Teacher) ───────────
CREATE TABLE IF NOT EXISTS messages (
  id                  SERIAL PRIMARY KEY,
  conversation_type   TEXT    NOT NULL CHECK (conversation_type IN ('manager_parent','manager_teacher')),
  participant_id      TEXT    NOT NULL,  -- student.id (integer as text) for parent, teacher.id (integer as text) for teacher
  from_role           TEXT    NOT NULL CHECK (from_role IN ('manager','parent','teacher')),
  from_name           TEXT    NOT NULL,
  text                TEXT    NOT NULL,
  read_by_manager     BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv
  ON messages(conversation_type, participant_id);
