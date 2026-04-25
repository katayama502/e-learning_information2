-- Add attended column to reskill_event_applications
ALTER TABLE reskill_event_applications ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT false;
