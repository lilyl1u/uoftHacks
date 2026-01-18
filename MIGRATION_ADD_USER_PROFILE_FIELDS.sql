-- Migration: Add first_name, last_name, and bio fields to users table
-- Run this in Supabase SQL Editor or your PostgreSQL database

-- Add first_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

-- Add last_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Add bio column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update the schema file comment
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';
COMMENT ON COLUMN users.bio IS 'User bio/description';
