-- Migration: Add campus column to washrooms table
-- Run this in Supabase SQL Editor

-- Add campus column if it doesn't exist
ALTER TABLE washrooms 
ADD COLUMN IF NOT EXISTS campus VARCHAR(100) DEFAULT 'UofT';

-- Add check constraint
ALTER TABLE washrooms 
DROP CONSTRAINT IF EXISTS washrooms_campus_check;

ALTER TABLE washrooms 
ADD CONSTRAINT washrooms_campus_check CHECK (campus IN ('UofT', 'Waterloo'));

-- Set default for existing washrooms (if any are NULL)
UPDATE washrooms SET campus = 'UofT' WHERE campus IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_washrooms_campus ON washrooms(campus);
