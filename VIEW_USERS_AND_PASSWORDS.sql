-- View all users with their password hashes
-- Note: Passwords are stored as bcrypt hashes, not plain text
-- All test users have password: 'test123'

SELECT 
  id,
  username,
  password_hash,
  role,
  personality_type,
  washrooms_visited,
  created_at
FROM users
ORDER BY created_at DESC;

-- To see just usernames and roles:
SELECT 
  username,
  role,
  personality_type
FROM users
ORDER BY username;

-- To see specific user (e.g., lilyv3):
SELECT 
  username,
  password_hash,
  role
FROM users
WHERE username = 'lilyv3';
