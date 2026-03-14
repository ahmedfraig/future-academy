-- ============================================================
-- Migration: Add expires_at + linked_holiday_id to announcements
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS expires_at       DATE,
  ADD COLUMN IF NOT EXISTS linked_holiday_id INTEGER REFERENCES nursery_holidays(id) ON DELETE CASCADE;
