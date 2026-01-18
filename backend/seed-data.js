const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

// Create database connection (same as database.ts)
let poolConfig;
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('neon') 
      ? { rejectUnauthorized: false } 
      : undefined,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'uoft_washrooms',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

const pool = new Pool(poolConfig);

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed test data...\n');

    // 1. Create test users
    const testUsers = [
      { username: 'alice_washroom', personality: 'Explorer' },
      { username: 'bob_reviewer', personality: 'Regular Reporter' },
      { username: 'charlie_pooper', personality: 'Morning Pooper' },
      { username: 'diana_finder', personality: 'Night Owl' },
      { username: 'eve_explorer', personality: 'Explorer' },
      { username: 'frank_visitor', personality: 'Heavy Launcher' },
      { username: 'grace_mapper', personality: 'Regular Reporter' },
      { username: 'henry_rated', personality: 'Morning Pooper' },
      { username: 'ivy_student', personality: 'Night Owl' },
      { username: 'jack_finder', personality: 'Explorer' },
    ];

    const passwordHash = await bcrypt.hash('test123', 10);
    const userIds = {};

    console.log('Creating test users...');
    for (const user of testUsers) {
      try {
        const result = await pool.query(
          'INSERT INTO users (username, password_hash, role, personality_type) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET personality_type = $4 RETURNING id, username',
          [user.username, passwordHash, 'user', user.personality]
        );
        userIds[user.username] = result.rows[0].id;
        console.log(`  ✓ Created user: ${user.username}`);
      } catch (error) {
        if (error.code === '23505') {
          // User already exists, get their ID
          const result = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);
          userIds[user.username] = result.rows[0].id;
          console.log(`  → User already exists: ${user.username}`);
        } else {
          throw error;
        }
      }
    }

    // Ensure lilyv3 is admin
    await pool.query("UPDATE users SET role = 'admin' WHERE username = 'lilyv3'");
    const lilyResult = await pool.query("SELECT id FROM users WHERE username = 'lilyv3'");
    if (lilyResult.rows.length > 0) {
      userIds['lilyv3'] = lilyResult.rows[0].id;
      console.log('  ✓ Updated lilyv3 to admin');
    }

    // 2. Create washrooms
    const washrooms = [
      // UofT washrooms
      { name: 'Bahen Centre - Main Floor', building: 'Bahen Centre', floor: 1, lat: 43.6596, lng: -79.3975, accessible: true, campus: 'UofT' },
      { name: 'Robarts Library - 2nd Floor', building: 'Robarts Library', floor: 2, lat: 43.6677, lng: -79.3958, accessible: true, campus: 'UofT' },
      { name: 'Sidney Smith Hall - Ground Floor', building: 'Sidney Smith Hall', floor: 0, lat: 43.6629, lng: -79.3957, accessible: false, campus: 'UofT' },
      { name: 'Medical Sciences Building - 1st Floor', building: 'Medical Sciences Building', floor: 1, lat: 43.6608, lng: -79.3950, accessible: true, campus: 'UofT' },
      { name: 'Hart House - Main Floor', building: 'Hart House', floor: 1, lat: 43.6645, lng: -79.3952, accessible: true, campus: 'UofT' },
      { name: 'Gerstein Library - Basement', building: 'Gerstein Library', floor: -1, lat: 43.6640, lng: -79.3965, accessible: false, campus: 'UofT' },
      { name: 'Convocation Hall - Ground Floor', building: 'Convocation Hall', floor: 0, lat: 43.6655, lng: -79.3955, accessible: true, campus: 'UofT' },
      { name: 'New College - Residence Building', building: 'New College', floor: 2, lat: 43.6615, lng: -79.3980, accessible: false, campus: 'UofT' },
      { name: 'Rotman School - 3rd Floor', building: 'Rotman School', floor: 3, lat: 43.6585, lng: -79.3965, accessible: true, campus: 'UofT' },
      { name: 'Athletic Centre - Locker Room', building: 'Athletic Centre', floor: 0, lat: 43.6630, lng: -79.3970, accessible: true, campus: 'UofT' },
      { name: 'Engineering Building - 2nd Floor', building: 'Engineering Building', floor: 2, lat: 43.6590, lng: -79.3970, accessible: false, campus: 'UofT' },
      { name: 'St. George Campus - UC Building', building: 'University College', floor: 1, lat: 43.6660, lng: -79.3950, accessible: true, campus: 'UofT' },
      // University of Waterloo washrooms
      { name: 'DC Library - 2nd Floor', building: 'Davis Centre', floor: 2, lat: 43.4723, lng: -80.5449, accessible: true, campus: 'Waterloo' },
      { name: 'MC Building - Ground Floor', building: 'Mathematics & Computer Building', floor: 0, lat: 43.4715, lng: -80.5440, accessible: true, campus: 'Waterloo' },
      { name: 'EIT Building - 1st Floor', building: 'Engineering 5', floor: 1, lat: 43.4730, lng: -80.5455, accessible: true, campus: 'Waterloo' },
      { name: 'SLC - Main Floor', building: 'Student Life Centre', floor: 1, lat: 43.4718, lng: -80.5435, accessible: true, campus: 'Waterloo' },
      { name: 'PAC - Locker Room', building: 'Physical Activities Complex', floor: 0, lat: 43.4705, lng: -80.5450, accessible: true, campus: 'Waterloo' },
      { name: 'QNC - Basement', building: 'Quantum-Nano Centre', floor: -1, lat: 43.4728, lng: -80.5442, accessible: false, campus: 'Waterloo' },
      { name: 'HH Building - 2nd Floor', building: 'Hagey Hall', floor: 2, lat: 43.4712, lng: -80.5445, accessible: true, campus: 'Waterloo' },
      { name: 'STC - Ground Floor', building: 'Science Teaching Complex', floor: 0, lat: 43.4735, lng: -80.5448, accessible: true, campus: 'Waterloo' },
      { name: 'RCH Building - 1st Floor', building: 'Ronald C. Hall', floor: 1, lat: 43.4710, lng: -80.5438, accessible: false, campus: 'Waterloo' },
      { name: 'E7 Building - 3rd Floor', building: 'Engineering 7', floor: 3, lat: 43.4725, lng: -80.5452, accessible: true, campus: 'Waterloo' },
    ];

    const washroomIds = {};
    console.log('\nCreating washrooms...');
    for (const washroom of washrooms) {
      try {
        const result = await pool.query(
          `INSERT INTO washrooms (name, building, floor, latitude, longitude, campus, accessibility, paid_access)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT DO NOTHING
           RETURNING id, name`,
          [washroom.name, washroom.building, washroom.floor, washroom.lat, washroom.lng, washroom.campus || 'UofT', washroom.accessible, false]
        );
        if (result.rows.length > 0) {
          washroomIds[washroom.name] = result.rows[0].id;
          console.log(`  ✓ Created washroom: ${washroom.name}`);
        } else {
          // Get existing washroom ID
          const existing = await pool.query('SELECT id FROM washrooms WHERE name = $1', [washroom.name]);
          if (existing.rows.length > 0) {
            washroomIds[washroom.name] = existing.rows[0].id;
          }
        }
      } catch (error) {
        console.error(`  ✗ Error creating washroom ${washroom.name}:`, error.message);
      }
    }

    // 3. Create friendships
    console.log('\nCreating friendships...');
    const friendships = [
      ['lilyv3', 'alice_washroom'],
      ['lilyv3', 'bob_reviewer'],
      ['lilyv3', 'charlie_pooper'],
      ['lilyv3', 'diana_finder'],
      ['alice_washroom', 'bob_reviewer'],
      ['charlie_pooper', 'diana_finder'],
      ['eve_explorer', 'frank_visitor'],
    ];

    for (const [user1, user2] of friendships) {
      if (userIds[user1] && userIds[user2]) {
        try {
          await pool.query(
            'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userIds[user1], userIds[user2]]
          );
          await pool.query(
            'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userIds[user2], userIds[user1]]
          );
          console.log(`  ✓ Created friendship: ${user1} ↔ ${user2}`);
        } catch (error) {
          console.error(`  ✗ Error creating friendship:`, error.message);
        }
      }
    }

    // 4. Create reviews
    console.log('\nCreating reviews...');
    const reviews = [
      // UofT Reviews
      { user: 'alice_washroom', washroom: 'Bahen Centre - Main Floor', ratings: [5, 4, 5, 5, 5], comment: 'Great washroom! Very clean and well-maintained. Always has toilet paper and soap.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor', ratings: [4, 5, 3, 5, 4], comment: 'Nice accessible washroom. Can get busy during peak hours though.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'charlie_pooper', washroom: 'Sidney Smith Hall - Ground Floor', ratings: [3, 3, 4, 3, 3], comment: 'Decent washroom but could be cleaner. No paper towels available.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor', ratings: [5, 5, 5, 5, 5], comment: 'Perfect washroom! Always clean, well-stocked, and accessible. My favorite spot on campus!', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'eve_explorer', washroom: 'Hart House - Main Floor', ratings: [4, 4, 4, 4, 4], comment: 'Good washroom in a convenient location. Clean and accessible.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'frank_visitor', washroom: 'Gerstein Library - Basement', ratings: [2, 3, 2, 2, 3], comment: 'Not great. Often dirty and missing supplies. Would not recommend.', toiletries: { soap: false, toilet_paper: true, paper_towels: false } },
      { user: 'grace_mapper', washroom: 'Convocation Hall - Ground Floor', ratings: [4, 5, 4, 5, 4], comment: 'Very nice washroom! Great privacy and always clean.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'henry_rated', washroom: 'Rotman School - 3rd Floor', ratings: [5, 4, 3, 4, 5], comment: 'Excellent facilities! Modern and well-maintained.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'ivy_student', washroom: 'Athletic Centre - Locker Room', ratings: [3, 4, 4, 3, 4], comment: 'Average washroom. Does the job but nothing special.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'jack_finder', washroom: 'Engineering Building - 2nd Floor', ratings: [4, 3, 5, 4, 4], comment: 'Good location, usually available. Clean enough.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'alice_washroom', washroom: 'Robarts Library - 2nd Floor', ratings: [5, 5, 4, 5, 5], comment: 'Amazing washroom! Highly recommend this one.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'bob_reviewer', washroom: 'Bahen Centre - Main Floor', ratings: [4, 4, 5, 4, 4], comment: 'Convenient location near my classes. Clean and accessible.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'charlie_pooper', washroom: 'Hart House - Main Floor', ratings: [3, 4, 3, 3, 4], comment: 'Okay washroom. Could use better maintenance.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'diana_finder', washroom: 'St. George Campus - UC Building', ratings: [5, 5, 5, 5, 5], comment: 'Perfect! Best washroom on campus. Always clean and well-stocked.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'eve_explorer', washroom: 'New College - Residence Building', ratings: [4, 3, 4, 4, 3], comment: 'Decent washroom for a residence building.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'frank_visitor', washroom: 'Medical Sciences Building - 1st Floor', ratings: [3, 3, 3, 4, 3], comment: 'Average facilities. Gets crowded during class breaks.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'grace_mapper', washroom: 'Gerstein Library - Basement', ratings: [4, 4, 3, 3, 4], comment: 'Quiet location. Good for studying nearby.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'henry_rated', washroom: 'Bahen Centre - Main Floor', ratings: [5, 5, 4, 5, 5], comment: 'Top tier washroom! Always my go-to spot.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'ivy_student', washroom: 'Robarts Library - 2nd Floor', ratings: [4, 5, 4, 5, 4], comment: 'Great accessibility features. Very clean.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'jack_finder', washroom: 'Hart House - Main Floor', ratings: [4, 4, 5, 4, 4], comment: 'Historic building with modern facilities. Nice!', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'alice_washroom', washroom: 'Medical Sciences Building - 1st Floor', ratings: [5, 4, 5, 5, 5], comment: 'Excellent washroom! Highly accessible and clean.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'bob_reviewer', washroom: 'Convocation Hall - Ground Floor', ratings: [4, 5, 3, 5, 4], comment: 'Beautiful building, decent washroom facilities.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'charlie_pooper', washroom: 'Athletic Centre - Locker Room', ratings: [3, 3, 4, 4, 3], comment: 'Typical gym washroom. Functional but basic.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'diana_finder', washroom: 'Rotman School - 3rd Floor', ratings: [5, 5, 5, 5, 5], comment: 'Premium facilities! Worth the trip upstairs.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'eve_explorer', washroom: 'Engineering Building - 2nd Floor', ratings: [4, 3, 4, 4, 4], comment: 'Good for engineering students. Usually available.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'frank_visitor', washroom: 'St. George Campus - UC Building', ratings: [3, 4, 3, 4, 3], comment: 'Historic building but facilities are dated.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'grace_mapper', washroom: 'New College - Residence Building', ratings: [4, 4, 4, 3, 4], comment: 'Residence washroom. Clean enough for daily use.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'henry_rated', washroom: 'Sidney Smith Hall - Ground Floor', ratings: [4, 4, 3, 3, 4], comment: 'Convenient for classes in this building.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'ivy_student', washroom: 'Gerstein Library - Basement', ratings: [3, 3, 3, 2, 3], comment: 'Basement location is a bit dark but functional.', toiletries: { soap: false, toilet_paper: true, paper_towels: false } },
      { user: 'jack_finder', washroom: 'Convocation Hall - Ground Floor', ratings: [4, 5, 4, 5, 4], comment: 'Nice facilities in a beautiful building.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      // Waterloo Reviews
      { user: 'alice_washroom', washroom: 'DC Library - 2nd Floor', ratings: [5, 5, 4, 5, 5], comment: 'Great library washroom! Very clean and modern.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'bob_reviewer', washroom: 'MC Building - Ground Floor', ratings: [4, 4, 5, 4, 4], comment: 'Convenient for math students. Clean facilities.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'charlie_pooper', washroom: 'EIT Building - 1st Floor', ratings: [4, 3, 4, 4, 4], comment: 'Engineering building washroom. Does the job.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'diana_finder', washroom: 'SLC - Main Floor', ratings: [5, 5, 5, 5, 5], comment: 'Best washroom on Waterloo campus! Always clean.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'eve_explorer', washroom: 'PAC - Locker Room', ratings: [4, 4, 3, 5, 4], comment: 'Good gym washroom. Accessible and clean.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'frank_visitor', washroom: 'QNC - Basement', ratings: [2, 3, 2, 2, 3], comment: 'Basement location is not great. Often dirty.', toiletries: { soap: false, toilet_paper: true, paper_towels: false } },
      { user: 'grace_mapper', washroom: 'HH Building - 2nd Floor', ratings: [4, 5, 4, 4, 4], comment: 'Nice washroom in Hagey Hall. Good privacy.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'henry_rated', washroom: 'STC - Ground Floor', ratings: [5, 4, 5, 5, 5], comment: 'Excellent science building washroom!', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'ivy_student', washroom: 'RCH Building - 1st Floor', ratings: [3, 4, 3, 3, 4], comment: 'Average washroom. Nothing special.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'jack_finder', washroom: 'E7 Building - 3rd Floor', ratings: [4, 4, 4, 4, 4], comment: 'Modern engineering building. Good facilities.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'alice_washroom', washroom: 'SLC - Main Floor', ratings: [5, 5, 5, 5, 5], comment: 'My favorite on Waterloo campus!', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'bob_reviewer', washroom: 'DC Library - 2nd Floor', ratings: [4, 5, 4, 5, 4], comment: 'Great for studying sessions. Clean and quiet.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'charlie_pooper', washroom: 'MC Building - Ground Floor', ratings: [3, 4, 3, 4, 3], comment: 'Decent math building washroom.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'diana_finder', washroom: 'STC - Ground Floor', ratings: [5, 5, 5, 5, 5], comment: 'Perfect washroom! Always my go-to at Waterloo.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'eve_explorer', washroom: 'HH Building - 2nd Floor', ratings: [4, 4, 4, 4, 4], comment: 'Good facilities in Hagey Hall.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'frank_visitor', washroom: 'EIT Building - 1st Floor', ratings: [3, 3, 3, 3, 3], comment: 'Average engineering washroom.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'grace_mapper', washroom: 'PAC - Locker Room', ratings: [4, 4, 5, 5, 4], comment: 'Good gym facilities. Accessible.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'henry_rated', washroom: 'E7 Building - 3rd Floor', ratings: [5, 4, 5, 4, 5], comment: 'Modern facilities. Very clean!', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'ivy_student', washroom: 'QNC - Basement', ratings: [2, 2, 3, 2, 2], comment: 'Not a fan of basement washrooms. Dark and musty.', toiletries: { soap: false, toilet_paper: true, paper_towels: false } },
      { user: 'jack_finder', washroom: 'RCH Building - 1st Floor', ratings: [4, 3, 4, 3, 4], comment: 'Functional washroom. Nothing special.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
    ];

    for (const review of reviews) {
      if (userIds[review.user] && washroomIds[review.washroom]) {
        const overall = review.ratings.reduce((a, b) => a + b, 0) / review.ratings.length;
        try {
          await pool.query(
            `INSERT INTO reviews (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (user_id, washroom_id) DO UPDATE SET
               cleanliness_rating = $3, privacy_rating = $4, wait_time_rating = $5,
               accessibility_rating = $6, ease_of_access_rating = $7, overall_rating = $8,
               comment = $9, toiletries_available = $10`,
            [
              userIds[review.user],
              washroomIds[review.washroom],
              review.ratings[0],
              review.ratings[1],
              review.ratings[2],
              review.ratings[3],
              review.ratings[4],
              overall,
              review.comment,
              JSON.stringify(review.toiletries),
            ]
          );
          console.log(`  ✓ Created review: ${review.user} → ${review.washroom}`);
        } catch (error) {
          console.error(`  ✗ Error creating review:`, error.message);
        }
      }
    }

    // 5. Update washroom statistics
    console.log('\nUpdating washroom statistics...');
    await pool.query(`
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
    `);
    console.log('  ✓ Updated washroom ratings and review counts');

    // 6. Create washroom visits
    console.log('\nCreating washroom visits...');
    const visits = [
      // UofT Visits
      { user: 'alice_washroom', washroom: 'Bahen Centre - Main Floor', count: 12 },
      { user: 'alice_washroom', washroom: 'Robarts Library - 2nd Floor', count: 8 },
      { user: 'alice_washroom', washroom: 'Medical Sciences Building - 1st Floor', count: 15 },
      { user: 'alice_washroom', washroom: 'Hart House - Main Floor', count: 6 },
      { user: 'alice_washroom', washroom: 'Convocation Hall - Ground Floor', count: 4 },
      { user: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor', count: 20 },
      { user: 'bob_reviewer', washroom: 'Bahen Centre - Main Floor', count: 10 },
      { user: 'bob_reviewer', washroom: 'Convocation Hall - Ground Floor', count: 7 },
      { user: 'bob_reviewer', washroom: 'Rotman School - 3rd Floor', count: 5 },
      { user: 'bob_reviewer', washroom: 'St. George Campus - UC Building', count: 8 },
      { user: 'charlie_pooper', washroom: 'Sidney Smith Hall - Ground Floor', count: 18 },
      { user: 'charlie_pooper', washroom: 'Hart House - Main Floor', count: 9 },
      { user: 'charlie_pooper', washroom: 'Gerstein Library - Basement', count: 6 },
      { user: 'charlie_pooper', washroom: 'Athletic Centre - Locker Room', count: 11 },
      { user: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor', count: 25 },
      { user: 'diana_finder', washroom: 'St. George Campus - UC Building', count: 18 },
      { user: 'diana_finder', washroom: 'Rotman School - 3rd Floor', count: 12 },
      { user: 'diana_finder', washroom: 'Hart House - Main Floor', count: 10 },
      { user: 'diana_finder', washroom: 'Bahen Centre - Main Floor', count: 8 },
      { user: 'eve_explorer', washroom: 'Hart House - Main Floor', count: 14 },
      { user: 'eve_explorer', washroom: 'New College - Residence Building', count: 9 },
      { user: 'eve_explorer', washroom: 'Medical Sciences Building - 1st Floor', count: 7 },
      { user: 'eve_explorer', washroom: 'Robarts Library - 2nd Floor', count: 6 },
      { user: 'eve_explorer', washroom: 'Gerstein Library - Basement', count: 5 },
      { user: 'frank_visitor', washroom: 'Gerstein Library - Basement', count: 8 },
      { user: 'frank_visitor', washroom: 'Medical Sciences Building - 1st Floor', count: 6 },
      { user: 'frank_visitor', washroom: 'St. George Campus - UC Building', count: 4 },
      { user: 'frank_visitor', washroom: 'Sidney Smith Hall - Ground Floor', count: 5 },
      { user: 'grace_mapper', washroom: 'Convocation Hall - Ground Floor', count: 16 },
      { user: 'grace_mapper', washroom: 'Gerstein Library - Basement', count: 11 },
      { user: 'grace_mapper', washroom: 'New College - Residence Building', count: 8 },
      { user: 'grace_mapper', washroom: 'Robarts Library - 2nd Floor', count: 7 },
      { user: 'grace_mapper', washroom: 'Bahen Centre - Main Floor', count: 6 },
      { user: 'henry_rated', washroom: 'Rotman School - 3rd Floor', count: 22 },
      { user: 'henry_rated', washroom: 'Bahen Centre - Main Floor', count: 15 },
      { user: 'henry_rated', washroom: 'Sidney Smith Hall - Ground Floor', count: 10 },
      { user: 'henry_rated', washroom: 'Medical Sciences Building - 1st Floor', count: 9 },
      { user: 'henry_rated', washroom: 'Hart House - Main Floor', count: 7 },
      { user: 'ivy_student', washroom: 'Athletic Centre - Locker Room', count: 19 },
      { user: 'ivy_student', washroom: 'Robarts Library - 2nd Floor', count: 12 },
      { user: 'ivy_student', washroom: 'Gerstein Library - Basement', count: 8 },
      { user: 'ivy_student', washroom: 'Convocation Hall - Ground Floor', count: 6 },
      { user: 'ivy_student', washroom: 'New College - Residence Building', count: 5 },
      { user: 'jack_finder', washroom: 'Engineering Building - 2nd Floor', count: 17 },
      { user: 'jack_finder', washroom: 'Convocation Hall - Ground Floor', count: 13 },
      { user: 'jack_finder', washroom: 'Hart House - Main Floor', count: 9 },
      { user: 'jack_finder', washroom: 'Bahen Centre - Main Floor', count: 8 },
      { user: 'jack_finder', washroom: 'Robarts Library - 2nd Floor', count: 6 },
      // Waterloo Visits
      { user: 'alice_washroom', washroom: 'DC Library - 2nd Floor', count: 10 },
      { user: 'alice_washroom', washroom: 'SLC - Main Floor', count: 14 },
      { user: 'alice_washroom', washroom: 'STC - Ground Floor', count: 7 },
      { user: 'bob_reviewer', washroom: 'MC Building - Ground Floor', count: 11 },
      { user: 'bob_reviewer', washroom: 'DC Library - 2nd Floor', count: 9 },
      { user: 'bob_reviewer', washroom: 'SLC - Main Floor', count: 8 },
      { user: 'charlie_pooper', washroom: 'EIT Building - 1st Floor', count: 13 },
      { user: 'charlie_pooper', washroom: 'MC Building - Ground Floor', count: 7 },
      { user: 'diana_finder', washroom: 'SLC - Main Floor', count: 21 },
      { user: 'diana_finder', washroom: 'STC - Ground Floor', count: 16 },
      { user: 'diana_finder', washroom: 'DC Library - 2nd Floor', count: 12 },
      { user: 'diana_finder', washroom: 'HH Building - 2nd Floor', count: 9 },
      { user: 'eve_explorer', washroom: 'PAC - Locker Room', count: 15 },
      { user: 'eve_explorer', washroom: 'SLC - Main Floor', count: 10 },
      { user: 'eve_explorer', washroom: 'HH Building - 2nd Floor', count: 8 },
      { user: 'frank_visitor', washroom: 'EIT Building - 1st Floor', count: 9 },
      { user: 'frank_visitor', washroom: 'QNC - Basement', count: 5 },
      { user: 'frank_visitor', washroom: 'RCH Building - 1st Floor', count: 6 },
      { user: 'grace_mapper', washroom: 'HH Building - 2nd Floor', count: 12 },
      { user: 'grace_mapper', washroom: 'PAC - Locker Room', count: 10 },
      { user: 'grace_mapper', washroom: 'STC - Ground Floor', count: 8 },
      { user: 'henry_rated', washroom: 'E7 Building - 3rd Floor', count: 18 },
      { user: 'henry_rated', washroom: 'STC - Ground Floor', count: 14 },
      { user: 'henry_rated', washroom: 'DC Library - 2nd Floor', count: 11 },
      { user: 'henry_rated', washroom: 'SLC - Main Floor', count: 9 },
      { user: 'ivy_student', washroom: 'RCH Building - 1st Floor', count: 11 },
      { user: 'ivy_student', washroom: 'QNC - Basement', count: 7 },
      { user: 'ivy_student', washroom: 'EIT Building - 1st Floor', count: 8 },
      { user: 'jack_finder', washroom: 'E7 Building - 3rd Floor', count: 13 },
      { user: 'jack_finder', washroom: 'RCH Building - 1st Floor', count: 10 },
      { user: 'jack_finder', washroom: 'MC Building - Ground Floor', count: 8 },
    ];

    for (const visit of visits) {
      if (userIds[visit.user] && washroomIds[visit.washroom]) {
        try {
          await pool.query(
            `INSERT INTO user_washroom_visits (user_id, washroom_id, visit_count, last_visited)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP - INTERVAL '2 days')
             ON CONFLICT (user_id, washroom_id) DO UPDATE SET
               visit_count = $3, last_visited = CURRENT_TIMESTAMP - INTERVAL '2 days'`,
            [userIds[visit.user], washroomIds[visit.washroom], visit.count]
          );
          console.log(`  ✓ Created visit: ${visit.user} → ${visit.washroom} (${visit.count} times)`);
        } catch (error) {
          console.error(`  ✗ Error creating visit:`, error.message);
        }
      }
    }

    // 7. Update user washrooms_visited count
    await pool.query(`
      UPDATE users u
      SET washrooms_visited = (
        SELECT COUNT(DISTINCT washroom_id)
        FROM user_washroom_visits
        WHERE user_id = u.id
      )
    `);
    console.log('  ✓ Updated user visit counts');

    // 8. Create comments on reviews
    console.log('\nCreating comments on reviews...');
    const comments = [
      { user: 'lilyv3', reviewUser: 'alice_washroom', washroom: 'Bahen Centre - Main Floor', text: 'Great review! I totally agree, this is one of my favorites too.' },
      { user: 'lilyv3', reviewUser: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor', text: 'Thanks for the tip about peak hours!' },
      { user: 'alice_washroom', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor', text: 'I need to check this one out! Sounds amazing.' },
      { user: 'bob_reviewer', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor', text: 'Second this! Best washroom on campus.' },
      { user: 'charlie_pooper', reviewUser: 'alice_washroom', washroom: 'Robarts Library - 2nd Floor', text: 'I\'ll have to visit this one next time I\'m at Robarts.' },
      { user: 'diana_finder', reviewUser: 'alice_washroom', washroom: 'Bahen Centre - Main Floor', text: 'Love this spot! Always clean and accessible.' },
      { user: 'eve_explorer', reviewUser: 'grace_mapper', washroom: 'Convocation Hall - Ground Floor', text: 'Beautiful building, great facilities!' },
      { user: 'frank_visitor', reviewUser: 'henry_rated', washroom: 'Rotman School - 3rd Floor', text: 'Worth the trip upstairs for sure!' },
      { user: 'grace_mapper', reviewUser: 'diana_finder', washroom: 'St. George Campus - UC Building', text: 'This is my go-to spot! Always reliable.' },
      { user: 'henry_rated', reviewUser: 'alice_washroom', washroom: 'Medical Sciences Building - 1st Floor', text: 'Great review! I\'ll add this to my list.' },
      { user: 'ivy_student', reviewUser: 'bob_reviewer', washroom: 'Bahen Centre - Main Floor', text: 'Convenient location for sure!' },
      { user: 'jack_finder', reviewUser: 'diana_finder', washroom: 'SLC - Main Floor', text: 'Best washroom at Waterloo! Totally agree.' },
      { user: 'alice_washroom', reviewUser: 'diana_finder', washroom: 'SLC - Main Floor', text: 'I need to visit Waterloo campus more often!' },
      { user: 'bob_reviewer', reviewUser: 'henry_rated', washroom: 'STC - Ground Floor', text: 'Science building washrooms are always top tier!' },
      { user: 'charlie_pooper', reviewUser: 'diana_finder', washroom: 'STC - Ground Floor', text: 'Adding this to my favorites list!' },
    ];

    for (const comment of comments) {
      if (userIds[comment.user] && userIds[comment.reviewUser] && washroomIds[comment.washroom]) {
        try {
          // Get the review ID
          const reviewResult = await pool.query(
            'SELECT id FROM reviews WHERE user_id = $1 AND washroom_id = $2',
            [userIds[comment.reviewUser], washroomIds[comment.washroom]]
          );
          
          if (reviewResult.rows.length > 0) {
            await pool.query(
              'INSERT INTO review_comments (review_id, user_id, comment_text) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
              [reviewResult.rows[0].id, userIds[comment.user], comment.text]
            );
            console.log(`  ✓ Created comment: ${comment.user} → ${comment.reviewUser}'s review of ${comment.washroom}`);
          }
        } catch (error) {
          console.error(`  ✗ Error creating comment:`, error.message);
        }
      }
    }

    // 9. Create likes on reviews
    console.log('\nCreating likes on reviews...');
    const likes = [
      { user: 'lilyv3', reviewUser: 'alice_washroom', washroom: 'Bahen Centre - Main Floor' },
      { user: 'lilyv3', reviewUser: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor' },
      { user: 'lilyv3', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor' },
      { user: 'lilyv3', reviewUser: 'diana_finder', washroom: 'St. George Campus - UC Building' },
      { user: 'alice_washroom', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor' },
      { user: 'alice_washroom', reviewUser: 'diana_finder', washroom: 'St. George Campus - UC Building' },
      { user: 'alice_washroom', reviewUser: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor' },
      { user: 'bob_reviewer', reviewUser: 'alice_washroom', washroom: 'Bahen Centre - Main Floor' },
      { user: 'bob_reviewer', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor' },
      { user: 'bob_reviewer', reviewUser: 'diana_finder', washroom: 'SLC - Main Floor' },
      { user: 'charlie_pooper', reviewUser: 'alice_washroom', washroom: 'Robarts Library - 2nd Floor' },
      { user: 'charlie_pooper', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor' },
      { user: 'diana_finder', reviewUser: 'alice_washroom', washroom: 'Bahen Centre - Main Floor' },
      { user: 'diana_finder', reviewUser: 'alice_washroom', washroom: 'Robarts Library - 2nd Floor' },
      { user: 'eve_explorer', reviewUser: 'grace_mapper', washroom: 'Convocation Hall - Ground Floor' },
      { user: 'eve_explorer', reviewUser: 'diana_finder', washroom: 'SLC - Main Floor' },
      { user: 'frank_visitor', reviewUser: 'henry_rated', washroom: 'Rotman School - 3rd Floor' },
      { user: 'grace_mapper', reviewUser: 'diana_finder', washroom: 'St. George Campus - UC Building' },
      { user: 'grace_mapper', reviewUser: 'henry_rated', washroom: 'Rotman School - 3rd Floor' },
      { user: 'henry_rated', reviewUser: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor' },
      { user: 'henry_rated', reviewUser: 'alice_washroom', washroom: 'Bahen Centre - Main Floor' },
      { user: 'ivy_student', reviewUser: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor' },
      { user: 'jack_finder', reviewUser: 'diana_finder', washroom: 'SLC - Main Floor' },
      { user: 'jack_finder', reviewUser: 'henry_rated', washroom: 'STC - Ground Floor' },
    ];

    for (const like of likes) {
      if (userIds[like.user] && userIds[like.reviewUser] && washroomIds[like.washroom]) {
        try {
          // Get the review ID
          const reviewResult = await pool.query(
            'SELECT id FROM reviews WHERE user_id = $1 AND washroom_id = $2',
            [userIds[like.reviewUser], washroomIds[like.washroom]]
          );
          
          if (reviewResult.rows.length > 0) {
            await pool.query(
              'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [reviewResult.rows[0].id, userIds[like.user]]
            );
            console.log(`  ✓ Created like: ${like.user} → ${like.reviewUser}'s review of ${like.washroom}`);
          }
        } catch (error) {
          console.error(`  ✗ Error creating like:`, error.message);
        }
      }
    }

    // Summary
    console.log('\n✅ Seed data created successfully!\n');
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM washrooms) as washrooms,
        (SELECT COUNT(*) FROM reviews) as reviews,
        (SELECT COUNT(*) FROM friends) as friendships,
        (SELECT COUNT(*) FROM user_washroom_visits) as visits,
        (SELECT COUNT(*) FROM review_comments) as comments,
        (SELECT COUNT(*) FROM review_likes) as likes
    `);
    
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${stats.rows[0].users}`);
    console.log(`   Washrooms: ${stats.rows[0].washrooms}`);
    console.log(`   Reviews: ${stats.rows[0].reviews}`);
    console.log(`   Friendships: ${stats.rows[0].friendships}`);
    console.log(`   Visits: ${stats.rows[0].visits}`);
    console.log(`   Comments: ${stats.rows[0].comments}`);
    console.log(`   Likes: ${stats.rows[0].likes}\n`);

    console.log('🔑 Test User Credentials:');
    console.log('   Username: any of the test users (alice_washroom, bob_reviewer, etc.)');
    console.log('   Password: test123\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await pool.end();
    process.exit(1);
  }
};

seedData();
