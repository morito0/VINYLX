-- Add onboarding enrichment fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS favorite_genres text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Existing users with activity are considered onboarded
UPDATE profiles
SET onboarding_completed = true
WHERE id IN (SELECT DISTINCT user_id FROM album_logs);
