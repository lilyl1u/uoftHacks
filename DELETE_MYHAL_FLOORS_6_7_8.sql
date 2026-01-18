-- Delete washrooms for floors 6, 7, and 8 in Myhal Centre
-- This will also cascade delete related reviews and visits due to foreign key constraints

-- First, delete reviews for these washrooms (if they exist)
DELETE FROM reviews
WHERE washroom_id IN (
  SELECT id FROM washrooms 
  WHERE building = 'Myhal Centre' 
  AND floor IN (6, 7, 8)
);

-- Delete user washroom visits for these washrooms (if they exist)
DELETE FROM user_washroom_visits
WHERE washroom_id IN (
  SELECT id FROM washrooms 
  WHERE building = 'Myhal Centre' 
  AND floor IN (6, 7, 8)
);

-- Delete the washrooms themselves
DELETE FROM washrooms
WHERE building = 'Myhal Centre' 
AND floor IN (6, 7, 8);

-- Verify deletion
SELECT 
  'Remaining Myhal washrooms:' as message,
  COUNT(*) as total_count
FROM washrooms
WHERE building = 'Myhal Centre';

-- Show remaining washrooms
SELECT 
  name,
  floor,
  average_rating,
  total_reviews
FROM washrooms
WHERE building = 'Myhal Centre'
ORDER BY floor, name;
