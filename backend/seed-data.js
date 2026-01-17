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
      { username: 'frank_visitor', personality: 'Heavy Shitter' },
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
      // Additional reviews from lilyv3's friends for Explore page
      { user: 'alice_washroom', washroom: 'Robarts Library - 2nd Floor', ratings: [5, 5, 4, 5, 5], comment: 'Amazing washroom! Highly recommend this one.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'bob_reviewer', washroom: 'Bahen Centre - Main Floor', ratings: [4, 4, 5, 4, 4], comment: 'Convenient location near my classes. Clean and accessible.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
      { user: 'charlie_pooper', washroom: 'Hart House - Main Floor', ratings: [3, 4, 3, 3, 4], comment: 'Okay washroom. Could use better maintenance.', toiletries: { soap: true, toilet_paper: true, paper_towels: false } },
      { user: 'diana_finder', washroom: 'St. George Campus - UC Building', ratings: [5, 5, 5, 5, 5], comment: 'Perfect! Best washroom on campus. Always clean and well-stocked.', toiletries: { soap: true, toilet_paper: true, paper_towels: true } },
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
      { user: 'alice_washroom', washroom: 'Bahen Centre - Main Floor', count: 3 },
      { user: 'bob_reviewer', washroom: 'Robarts Library - 2nd Floor', count: 5 },
      { user: 'charlie_pooper', washroom: 'Sidney Smith Hall - Ground Floor', count: 2 },
      { user: 'diana_finder', washroom: 'Medical Sciences Building - 1st Floor', count: 7 },
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

    // Summary
    console.log('\n✅ Seed data created successfully!\n');
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM washrooms) as washrooms,
        (SELECT COUNT(*) FROM reviews) as reviews,
        (SELECT COUNT(*) FROM friends) as friendships,
        (SELECT COUNT(*) FROM user_washroom_visits) as visits
    `);
    
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${stats.rows[0].users}`);
    console.log(`   Washrooms: ${stats.rows[0].washrooms}`);
    console.log(`   Reviews: ${stats.rows[0].reviews}`);
    console.log(`   Friendships: ${stats.rows[0].friendships}`);
    console.log(`   Visits: ${stats.rows[0].visits}\n`);

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
