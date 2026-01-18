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

const viewReviews = async () => {
  try {
    console.log('📝 Reviews by diana_finder:\n');

    const result = await pool.query(`
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
        w.name as washroom_name,
        w.building,
        w.floor,
        w.campus
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN washrooms w ON r.washroom_id = w.id
      WHERE u.username = 'diana_finder'
      ORDER BY r.created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('No reviews found for diana_finder');
    } else {
      console.log(`Found ${result.rows.length} review(s):\n`);
      result.rows.forEach((review, index) => {
        console.log(`--- Review #${index + 1} ---`);
        console.log(`Review ID: ${review.review_id}`);
        console.log(`Washroom: ${review.washroom_name}`);
        console.log(`Building: ${review.building}${review.floor !== null ? `, Floor ${review.floor}` : ''}`);
        console.log(`Campus: ${review.campus || 'UofT'}`);
        console.log(`Date: ${new Date(review.review_date).toLocaleString()}`);
        console.log(`Overall Rating: ${review.overall_rating}/5.0`);
        console.log(`Ratings Breakdown:`);
        console.log(`  - Cleanliness: ${review.cleanliness_rating}/5`);
        console.log(`  - Privacy: ${review.privacy_rating}/5`);
        console.log(`  - Wait Time: ${review.wait_time_rating}/5`);
        console.log(`  - Accessibility: ${review.accessibility_rating}/5`);
        console.log(`  - Ease of Access: ${review.ease_of_access_rating}/5`);
        if (review.comment) {
          console.log(`Comment: "${review.comment}"`);
        }
        if (review.toiletries_available) {
          const toiletries = typeof review.toiletries_available === 'string' 
            ? JSON.parse(review.toiletries_available) 
            : review.toiletries_available;
          console.log(`Toiletries:`);
          console.log(`  - Soap: ${toiletries.soap ? 'Yes' : 'No'}`);
          console.log(`  - Toilet Paper: ${toiletries.toilet_paper ? 'Yes' : 'No'}`);
          console.log(`  - Paper Towels: ${toiletries.paper_towels ? 'Yes' : 'No'}`);
        }
        console.log('');
      });

      // Summary
      const summary = await pool.query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(r.overall_rating)::DECIMAL(3,2) as average_rating
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE u.username = 'diana_finder'
      `);

      console.log('--- Summary ---');
      console.log(`Total Reviews: ${summary.rows[0].total_reviews}`);
      console.log(`Average Rating: ${summary.rows[0].average_rating}/5.0`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing reviews:', error.message);
    console.error('Error details:', error);
    await pool.end();
    process.exit(1);
  }
};

viewReviews();
