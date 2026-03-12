-- ============================================================
-- Migration: Add invite_code_hash columns for auth redesign
-- Run this on Supabase SQL Editor
-- ============================================================

-- Add invite code hash to students (for parent registration)
ALTER TABLE students ADD COLUMN IF NOT EXISTS invite_code_hash TEXT;

-- Add invite code hash to teachers (for teacher registration)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS invite_code_hash TEXT;

-- Track which invite code was used to create the user account
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code TEXT;
