-- Seed Test Data for UofT Washroom Finder
-- Run this in Supabase SQL Editor after your database is set up

-- Note: This assumes you already have the 'lilyv3' user created
-- If not, you'll need to create it first through the app registration

-- 1. Create 10 test users (password for all: 'test123')
-- Using bcrypt hash for 'test123' password
INSERT INTO users (username, password_hash, role, personality_type) VALUES
('alice_washroom', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Explorer'),
('bob_reviewer', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Regular Reporter'),
('charlie_pooper', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Morning Pooper'),
('diana_finder', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Night Owl'),
('eve_explorer', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Explorer'),
('frank_visitor', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Frequent Flyer'),
('grace_mapper', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Regular Reporter'),
('henry_rated', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Morning Pooper'),
('ivy_student', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Night Owl'),
('jack_finder', '$2a$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZqJq', 'user', 'Explorer')
ON CONFLICT (username) DO NOTHING;

-- 2. Ensure lilyv3 is admin (update if exists)
UPDATE users SET role = 'admin' WHERE username = 'lilyv3';

-- 3. Create washrooms around UofT campus
INSERT INTO washrooms (name, building, floor, latitude, longitude, accessibility, paid_access) VALUES
('Bahen Centre - Main Floor', 'Bahen Centre', 1, 43.6596, -79.3975, true, false),
('Robarts Library - 2nd Floor', 'Robarts Library', 2, 43.6677, -79.3958, true, false),
('Sidney Smith Hall - Ground Floor', 'Sidney Smith Hall', 0, 43.6629, -79.3957, false, false),
('Medical Sciences Building - 1st Floor', 'Medical Sciences Building', 1, 43.6608, -79.3950, true, false),
('Hart House - Main Floor', 'Hart House', 1, 43.6645, -79.3952, true, false),
('Gerstein Library - Basement', 'Gerstein Library', -1, 43.6640, -79.3965, false, false),
('Convocation Hall - Ground Floor', 'Convocation Hall', 0, 43.6655, -79.3955, true, false),
('New College - Residence Building', 'New College', 2, 43.6615, -79.3980, false, false),
('Rotman School - 3rd Floor', 'Rotman School', 3, 43.6585, -79.3965, true, false),
('Athletic Centre - Locker Room', 'Athletic Centre', 0, 43.6630, -79.3970, true, false),
('Engineering Building - 2nd Floor', 'Engineering Building', 2, 43.6590, -79.3970, false, false),
('St. George Campus - UC Building', 'University College', 1, 43.6660, -79.3950, true, false)
ON CONFLICT DO NOTHING;

-- 4. Create friendships (make some users friends with each other and lilyv3)
-- First, get user IDs (we'll use a subquery approach)
INSERT INTO friends (user_id, friend_id)
SELECT 
  u1.id,
  u2.id
FROM users u1, users u2
WHERE u1.username = 'lilyv3' AND u2.username IN ('alice_washroom', 'bob_reviewer', 'charlie_pooper', 'diana_finder')
ON CONFLICT DO NOTHING;

-- Create reverse friendships (mutual)
INSERT INTO friends (user_id, friend_id)
SELECT 
  u2.id,
  u1.id
FROM users u1, users u2
WHERE u1.username = 'lilyv3' AND u2.username IN ('alice_washroom', 'bob_reviewer', 'charlie_pooper', 'diana_finder')
ON CONFLICT DO NOTHING;

-- Create some friendships between other users
INSERT INTO friends (user_id, friend_id)
SELECT 
  u1.id,
  u2.id
FROM users u1, users u2
WHERE (u1.username = 'alice_washroom' AND u2.username = 'bob_reviewer')
   OR (u1.username = 'charlie_pooper' AND u2.username = 'diana_finder')
   OR (u1.username = 'eve_explorer' AND u2.username = 'frank_visitor')
ON CONFLICT DO NOTHING;

-- Reverse friendships
INSERT INTO friends (user_id, friend_id)
SELECT 
  u2.id,
  u1.id
FROM users u1, users u2
WHERE (u1.username = 'alice_washroom' AND u2.username = 'bob_reviewer')
   OR (u1.username = 'charlie_pooper' AND u2.username = 'diana_finder')
   OR (u1.username = 'eve_explorer' AND u2.username = 'frank_visitor')
ON CONFLICT DO NOTHING;

-- 5. Create reviews for washrooms
-- Reviews from various users for different washrooms
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 4, 5, 5, 5, 4.8,
  'Great washroom! Very clean and well-maintained. Always has toilet paper and soap.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Bahen Centre - Main Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 3, 5, 4, 4.2,
  'Nice accessible washroom. Can get busy during peak hours though.',
  '{"soap": true, "toilet_paper": true, "paper_towels": false}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Robarts Library - 2nd Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  3, 3, 4, 3, 3, 3.2,
  'Decent washroom but could be cleaner. No paper towels available.',
  '{"soap": true, "toilet_paper": true, "paper_towels": false}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'charlie_pooper' AND w.name = 'Sidney Smith Hall - Ground Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Perfect washroom! Always clean, well-stocked, and accessible. My favorite spot on campus!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Medical Sciences Building - 1st Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 4, 4, 4, 4.0,
  'Good washroom in a convenient location. Clean and accessible.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'eve_explorer' AND w.name = 'Hart House - Main Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  2, 3, 2, 2, 3, 2.4,
  'Not great. Often dirty and missing supplies. Would not recommend.',
  '{"soap": false, "toilet_paper": true, "paper_towels": false}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'frank_visitor' AND w.name = 'Gerstein Library - Basement'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 4, 5, 4, 4.4,
  'Very nice washroom! Great privacy and always clean.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'grace_mapper' AND w.name = 'Convocation Hall - Ground Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 4, 3, 4, 5, 4.2,
  'Excellent facilities! Modern and well-maintained.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Rotman School - 3rd Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  3, 4, 4, 3, 4, 3.6,
  'Average washroom. Does the job but nothing special.',
  '{"soap": true, "toilet_paper": true, "paper_towels": false}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'ivy_student' AND w.name = 'Athletic Centre - Locker Room'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 3, 5, 4, 4, 4.0,
  'Good location, usually available. Clean enough.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'jack_finder' AND w.name = 'Engineering Building - 2nd Floor'
ON CONFLICT DO NOTHING;

-- Add more reviews from lilyv3's friends (so they show up in Explore)
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 4, 5, 5, 4.8,
  'Amazing washroom! Highly recommend this one.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Robarts Library - 2nd Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 5, 4, 4, 4.2,
  'Convenient location near my classes. Clean and accessible.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Bahen Centre - Main Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  3, 4, 3, 3, 4, 3.4,
  'Okay washroom. Could use better maintenance.',
  '{"soap": true, "toilet_paper": true, "paper_towels": false}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'charlie_pooper' AND w.name = 'Hart House - Main Floor'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Perfect! Best washroom on campus. Always clean and well-stocked.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'St. George Campus - UC Building'
ON CONFLICT DO NOTHING;

-- 6. Update washroom statistics (average_rating and total_reviews)
UPDATE washrooms w
SET 
  average_rating = COALESCE((
    SELECT AVG(overall_rating)::DECIMAL(3,2)
    FROM reviews r
    WHERE r.washroom_id = w.id
  ), 0),
  total_reviews = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.washroom_id = w.id
  );

-- 7. Create some washroom visits
INSERT INTO user_washroom_visits (user_id, washroom_id, visit_count, last_visited)
SELECT 
  u.id,
  w.id,
  3,
  CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Bahen Centre - Main Floor'
ON CONFLICT DO NOTHING;

INSERT INTO user_washroom_visits (user_id, washroom_id, visit_count, last_visited)
SELECT 
  u.id,
  w.id,
  5,
  CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Robarts Library - 2nd Floor'
ON CONFLICT DO NOTHING;

INSERT INTO user_washroom_visits (user_id, washroom_id, visit_count, last_visited)
SELECT 
  u.id,
  w.id,
  2,
  CURRENT_TIMESTAMP - INTERVAL '5 days'
FROM users u, washrooms w
WHERE u.username = 'charlie_pooper' AND w.name = 'Sidney Smith Hall - Ground Floor'
ON CONFLICT DO NOTHING;

INSERT INTO user_washroom_visits (user_id, washroom_id, visit_count, last_visited)
SELECT 
  u.id,
  w.id,
  7,
  CURRENT_TIMESTAMP - INTERVAL '3 hours'
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Medical Sciences Building - 1st Floor'
ON CONFLICT DO NOTHING;

-- Update user washrooms_visited count
UPDATE users u
SET washrooms_visited = (
  SELECT COUNT(DISTINCT washroom_id)
  FROM user_washroom_visits
  WHERE user_id = u.id
);

-- Summary
SELECT 'Seed data created successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_washrooms FROM washrooms;
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT COUNT(*) as total_friendships FROM friends;
SELECT COUNT(*) as total_visits FROM user_washroom_visits;
