-- Migration: Add role column to users table
-- Run this in Supabase SQL Editor

-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Add check constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

-- Set default for existing users (if any are NULL)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Optional: Set specific users as admin (replace 'your_username' with actual username)
-- UPDATE users SET role = 'admin' WHERE username = 'your_username';
