-- Add Sample Reviews for All Myhal Building Washrooms
-- Myhal Centre for Engineering Innovation and Entrepreneurship
-- Floors 1-5: Men's and Women's washrooms on each floor
-- Floors 3-5: Also have Gender Neutral washrooms

-- Insert Myhal washrooms if they don't exist (approximate coordinates for Myhal Centre)
INSERT INTO washrooms (name, building, floor, latitude, longitude, campus, accessibility, paid_access) VALUES
-- Floor 1
('Myhal Centre - 1st Floor - Men''s', 'Myhal Centre', 1, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 1st Floor - Women''s', 'Myhal Centre', 1, 43.6595, -79.3970, 'UofT', true, false),
-- Floor 2
('Myhal Centre - 2nd Floor - Men''s', 'Myhal Centre', 2, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 2nd Floor - Women''s', 'Myhal Centre', 2, 43.6595, -79.3970, 'UofT', true, false),
-- Floor 3
('Myhal Centre - 3rd Floor - Men''s', 'Myhal Centre', 3, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 3rd Floor - Women''s', 'Myhal Centre', 3, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 3rd Floor - Gender Neutral', 'Myhal Centre', 3, 43.6595, -79.3970, 'UofT', true, false),
-- Floor 4
('Myhal Centre - 4th Floor - Men''s', 'Myhal Centre', 4, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 4th Floor - Women''s', 'Myhal Centre', 4, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 4th Floor - Gender Neutral', 'Myhal Centre', 4, 43.6595, -79.3970, 'UofT', true, false),
-- Floor 5
('Myhal Centre - 5th Floor - Men''s', 'Myhal Centre', 5, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 5th Floor - Women''s', 'Myhal Centre', 5, 43.6595, -79.3970, 'UofT', true, false),
('Myhal Centre - 5th Floor - Gender Neutral', 'Myhal Centre', 5, 43.6595, -79.3970, 'UofT', true, false)
ON CONFLICT DO NOTHING;

-- Now add sample reviews for each Myhal washroom
-- Reviews from various test users with diverse ratings and comments

-- ============================================
-- FLOOR 1 REVIEWS
-- ============================================

-- Myhal Centre - 1st Floor - Men's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 4, 3, 5, 5, 4.4,
  'Great first floor men''s washroom! Right by the main entrance. Super clean and modern. Can get busy during class breaks though.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Myhal Centre - 1st Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 4, wait_time_rating = 3,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 4.4,
  comment = 'Great first floor men''s washroom! Right by the main entrance. Super clean and modern. Can get busy during class breaks though.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 4, 5, 5, 4.4,
  'Excellent facilities! Brand new building means everything is pristine. Highly accessible and well-stocked.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Myhal Centre - 1st Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 4,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 4.4,
  comment = 'Excellent facilities! Brand new building means everything is pristine. Highly accessible and well-stocked.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 2, 5, 5, 4.4,
  'Beautiful modern facilities! The new building really shows. Only downside is it can get crowded during peak hours.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'jack_finder' AND w.name = 'Myhal Centre - 1st Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 2,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 4.4,
  comment = 'Beautiful modern facilities! The new building really shows. Only downside is it can get crowded during peak hours.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 1st Floor - Women's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 3, 5, 5, 4.6,
  'Perfect location! Right by the main entrance. Super clean and modern. Can get busy during class breaks though.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 1st Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 3,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 4.6,
  comment = 'Perfect location! Right by the main entrance. Super clean and modern. Can get busy during class breaks though.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Amazing washroom! Brand new building means everything is top quality. Always clean and well-maintained. My favorite spot in Myhal!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 1st Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Amazing washroom! Brand new building means everything is top quality. Always clean and well-maintained. My favorite spot in Myhal!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 4, 4, 4, 4.0,
  'Good washroom on the first floor. Convenient location and clean facilities.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'eve_explorer' AND w.name = 'Myhal Centre - 1st Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 4,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.0,
  comment = 'Good washroom on the first floor. Convenient location and clean facilities.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- ============================================
-- FLOOR 2 REVIEWS
-- ============================================

-- Myhal Centre - 2nd Floor - Men's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great privacy and usually available. Clean and modern like the rest of the building. Less crowded than first floor.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Myhal Centre - 2nd Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great privacy and usually available. Clean and modern like the rest of the building. Less crowded than first floor.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 4, 4, 5, 4, 4.4,
  'Excellent second floor men''s washroom! Less crowded than ground floor. Very clean and accessible.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Myhal Centre - 2nd Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 4, wait_time_rating = 4,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Excellent second floor men''s washroom! Less crowded than ground floor. Very clean and accessible.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 4, 4, 4, 4.0,
  'Solid washroom. Good for when you''re studying on the second floor.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'charlie_pooper' AND w.name = 'Myhal Centre - 2nd Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 4,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.0,
  comment = 'Solid washroom. Good for when you''re studying on the second floor.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 2nd Floor - Women's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Perfect washroom! Second floor is usually quiet. Everything is brand new and pristine.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 2nd Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Perfect washroom! Second floor is usually quiet. Everything is brand new and pristine.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great second floor location! Usually empty so no wait times. Very clean.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 2nd Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great second floor location! Usually empty so no wait times. Very clean.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 4, 4, 4, 4.0,
  'Good washroom. Second floor is less busy than first floor. Clean facilities.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'grace_mapper' AND w.name = 'Myhal Centre - 2nd Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 4,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.0,
  comment = 'Good washroom. Second floor is less busy than first floor. Clean facilities.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- ============================================
-- FLOOR 3 REVIEWS
-- ============================================

-- Myhal Centre - 3rd Floor - Men's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Excellent third floor men''s washroom! Higher floors are always quieter. Brand new facilities.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Myhal Centre - 3rd Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Excellent third floor men''s washroom! Higher floors are always quieter. Brand new facilities.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 5, 4, 4, 4.2,
  'Nice washroom on the third floor. Usually available and clean.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Myhal Centre - 3rd Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.2,
  comment = 'Nice washroom on the third floor. Usually available and clean.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great privacy on third floor! Perfect for when you need a quiet moment.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'jack_finder' AND w.name = 'Myhal Centre - 3rd Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great privacy on third floor! Perfect for when you need a quiet moment.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 3rd Floor - Women's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Perfect washroom! Third floor is usually quiet. Everything is brand new and pristine. My favorite spot in Myhal!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 3rd Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Perfect washroom! Third floor is usually quiet. Everything is brand new and pristine. My favorite spot in Myhal!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great third floor location! Usually empty so no wait times. Very clean.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 3rd Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great third floor location! Usually empty so no wait times. Very clean.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 4, 4, 4, 4.0,
  'Good washroom. Third floor is less busy than lower floors. Clean facilities.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'ivy_student' AND w.name = 'Myhal Centre - 3rd Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 4,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.0,
  comment = 'Good washroom. Third floor is less busy than lower floors. Clean facilities.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 3rd Floor - Gender Neutral Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Amazing gender neutral washroom! So inclusive and welcoming. Always clean and well-maintained. Love that Myhal has these!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 3rd Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Amazing gender neutral washroom! So inclusive and welcoming. Always clean and well-maintained. Love that Myhal has these!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Excellent gender neutral facilities! Great to see inclusive options. Very clean and modern.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 3rd Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Excellent gender neutral facilities! Great to see inclusive options. Very clean and modern.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great inclusive option! Third floor gender neutral washroom is always clean and available.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'eve_explorer' AND w.name = 'Myhal Centre - 3rd Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great inclusive option! Third floor gender neutral washroom is always clean and available.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- ============================================
-- FLOOR 4 REVIEWS
-- ============================================

-- Myhal Centre - 4th Floor - Men's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Excellent fourth floor men''s washroom! Higher floors are always quieter. Brand new facilities.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Myhal Centre - 4th Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Excellent fourth floor men''s washroom! Higher floors are always quieter. Brand new facilities.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 5, 4, 4, 4.2,
  'Nice washroom on the fourth floor. Usually available and clean.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Myhal Centre - 4th Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.2,
  comment = 'Nice washroom on the fourth floor. Usually available and clean.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great privacy on fourth floor! Perfect for when you need a quiet moment.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'charlie_pooper' AND w.name = 'Myhal Centre - 4th Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great privacy on fourth floor! Perfect for when you need a quiet moment.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 4th Floor - Women's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Perfect! Fourth floor is my secret spot. Always empty, always clean, always perfect!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 4th Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Perfect! Fourth floor is my secret spot. Always empty, always clean, always perfect!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 5, 4, 4, 4.2,
  'Good fourth floor washroom. Higher up means less foot traffic. Clean and modern.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 4th Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.2,
  comment = 'Good fourth floor washroom. Higher up means less foot traffic. Clean and modern.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Excellent privacy on fourth floor! Worth the elevator ride up.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'grace_mapper' AND w.name = 'Myhal Centre - 4th Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Excellent privacy on fourth floor! Worth the elevator ride up.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 4th Floor - Gender Neutral Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Best gender neutral washroom! Fourth floor location is perfect - quiet and always clean. So grateful for inclusive facilities!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 4th Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Best gender neutral washroom! Fourth floor location is perfect - quiet and always clean. So grateful for inclusive facilities!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Amazing gender neutral facilities! Fourth floor is quieter and always well-maintained.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 4th Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Amazing gender neutral facilities! Fourth floor is quieter and always well-maintained.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great inclusive option! Fourth floor gender neutral washroom is always clean and available.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'eve_explorer' AND w.name = 'Myhal Centre - 4th Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great inclusive option! Fourth floor gender neutral washroom is always clean and available.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- ============================================
-- FLOOR 5 REVIEWS
-- ============================================

-- Myhal Centre - 5th Floor - Men's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Amazing fifth floor men''s facilities! Almost always empty. Perfect for when you need peace and quiet.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Myhal Centre - 5th Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Amazing fifth floor men''s facilities! Almost always empty. Perfect for when you need peace and quiet.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 4, 5, 4, 4, 4.2,
  'Good fifth floor men''s washroom. Higher floors are always less crowded.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'bob_reviewer' AND w.name = 'Myhal Centre - 5th Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 4, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.2,
  comment = 'Good fifth floor men''s washroom. Higher floors are always less crowded.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great privacy! Fifth floor is perfect for avoiding crowds.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'jack_finder' AND w.name = 'Myhal Centre - 5th Floor - Men''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great privacy! Fifth floor is perfect for avoiding crowds.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 5th Floor - Women's Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Absolute best washroom in Myhal! Top floor means ultimate privacy. Always pristine and never crowded. My go-to spot!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 5th Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Absolute best washroom in Myhal! Top floor means ultimate privacy. Always pristine and never crowded. My go-to spot!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Top floor perfection! Fifth floor is always empty. Brand new facilities with amazing views nearby!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'henry_rated' AND w.name = 'Myhal Centre - 5th Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Top floor perfection! Fifth floor is always empty. Brand new facilities with amazing views nearby!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Perfect fifth floor location! Highest floor means best privacy. Clean and modern.',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'grace_mapper' AND w.name = 'Myhal Centre - 5th Floor - Women''s'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Perfect fifth floor location! Highest floor means best privacy. Clean and modern.',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Myhal Centre - 5th Floor - Gender Neutral Reviews
INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 5, 5.0,
  'Perfect gender neutral washroom! Top floor location is amazing - always quiet and pristine. So thankful for inclusive facilities at UofT!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'diana_finder' AND w.name = 'Myhal Centre - 5th Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 5, overall_rating = 5.0,
  comment = 'Perfect gender neutral washroom! Top floor location is amazing - always quiet and pristine. So thankful for inclusive facilities at UofT!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  5, 5, 5, 5, 4, 4.8,
  'Excellent gender neutral facilities on the top floor! Always clean and welcoming. Great inclusive option!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'alice_washroom' AND w.name = 'Myhal Centre - 5th Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 5, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 5, ease_of_access_rating = 4, overall_rating = 4.8,
  comment = 'Excellent gender neutral facilities on the top floor! Always clean and welcoming. Great inclusive option!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
SELECT 
  u.id,
  w.id,
  4, 5, 5, 4, 4, 4.4,
  'Great inclusive option! Fifth floor gender neutral washroom is always clean and available. Love the privacy!',
  '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb
FROM users u, washrooms w
WHERE u.username = 'eve_explorer' AND w.name = 'Myhal Centre - 5th Floor - Gender Neutral'
ON CONFLICT (user_id, washroom_id) DO UPDATE SET
  cleanliness_rating = 4, privacy_rating = 5, wait_time_rating = 5,
  accessibility_rating = 4, ease_of_access_rating = 4, overall_rating = 4.4,
  comment = 'Great inclusive option! Fifth floor gender neutral washroom is always clean and available. Love the privacy!',
  toiletries_available = '{"soap": true, "toilet_paper": true, "paper_towels": true}'::jsonb;

-- Update washroom statistics (average_rating and total_reviews) for all Myhal washrooms
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
  )
WHERE w.building = 'Myhal Centre';

-- Summary
SELECT 'Sample reviews added for all Myhal Centre washrooms!' as message;
SELECT 
  w.name,
  w.floor,
  w.average_rating,
  w.total_reviews
FROM washrooms w
WHERE w.building = 'Myhal Centre'
ORDER BY w.floor, w.name;
