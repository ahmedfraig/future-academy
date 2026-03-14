-- ============================================================
-- Migration: Nursery Holidays / Days Off
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS nursery_holidays (
  id           SERIAL PRIMARY KEY,
  type         TEXT    NOT NULL CHECK (type IN ('weekly', 'special')),
  day_of_week  INTEGER,          -- 0=Sun, 1=Mon, …, 6=Sat  (used when type='weekly')
  date         DATE,             -- specific date            (used when type='special')
  label        TEXT    NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: common Friday+Saturday weekend (can be deleted by manager)
INSERT INTO nursery_holidays (type, day_of_week, label)
VALUES
  ('weekly', 5, 'إجازة نهاية الأسبوع'),  -- Friday
  ('weekly', 6, 'إجازة نهاية الأسبوع')   -- Saturday
ON CONFLICT DO NOTHING;
