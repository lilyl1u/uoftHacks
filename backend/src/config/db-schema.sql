-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  personality_type VARCHAR(100),
  badges TEXT[], -- Array of badge names
  washrooms_visited INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Washrooms table
CREATE TABLE IF NOT EXISTS washrooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  building VARCHAR(255),
  floor INTEGER,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  accessibility BOOLEAN DEFAULT false,
  paid_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (separate table for better querying and normalization)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  washroom_id INTEGER REFERENCES washrooms(id) ON DELETE CASCADE,
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  privacy_rating INTEGER CHECK (privacy_rating >= 1 AND privacy_rating <= 5),
  wait_time_rating INTEGER CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  ease_of_access_rating INTEGER CHECK (ease_of_access_rating >= 1 AND ease_of_access_rating <= 5),
  overall_rating DECIMAL(3, 2) NOT NULL,
  comment TEXT,
  toiletries_available JSONB, -- {soap: true, toilet_paper: true, paper_towels: true}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, washroom_id) -- One review per user per washroom
);

-- User washroom visits tracking
CREATE TABLE IF NOT EXISTS user_washroom_visits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  washroom_id INTEGER REFERENCES washrooms(id) ON DELETE CASCADE,
  visit_count INTEGER DEFAULT 1,
  last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, washroom_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_washrooms_location ON washrooms(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reviews_washroom ON reviews(washroom_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_user ON user_washroom_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_washroom ON user_washroom_visits(washroom_id);
