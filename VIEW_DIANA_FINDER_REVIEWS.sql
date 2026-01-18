-- View all reviews made by user: diana_finder
-- Run this in Supabase SQL Editor

SELECT 
  r.id as review_id,
  r.created_at as review_date,
  r.overall_rating,
  r.cleanliness_rating,
  r.privacy_rating,
  r.wait_time_rating,
  r.accessibility_rating,
  r.ease_of_access_rating,
  r.comment,
  r.toiletries_available,
  w.id as washroom_id,
  w.name as washroom_name,
  w.building,
  w.floor,
  w.campus,
  u.username,
  u.id as user_id
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN washrooms w ON r.washroom_id = w.id
WHERE u.username = 'diana_finder'
ORDER BY r.created_at DESC;

-- Summary count
SELECT 
  COUNT(*) as total_reviews,
  AVG(r.overall_rating)::DECIMAL(3,2) as average_rating
FROM reviews r
JOIN users u ON r.user_id = u.id
WHERE u.username = 'diana_finder';
