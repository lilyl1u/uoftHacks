-- Update existing users with "Heavy Launcher" personality to "Frequent Flyer"
-- Run this in Supabase SQL Editor

UPDATE users
SET personality_type = 'Frequent Flyer'
WHERE personality_type = 'Heavy Launcher';

-- Verify the update
SELECT 
  COUNT(*) as updated_count,
  personality_type
FROM users
WHERE personality_type IN ('Heavy Launcher', 'Frequent Flyer')
GROUP BY personality_type;
