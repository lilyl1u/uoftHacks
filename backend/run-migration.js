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

const runMigration = async () => {
  try {
    console.log('🔄 Running migration to add first_name, last_name, and bio columns...\n');

    // Add first_name column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
    `);
    console.log('✅ Added first_name column');

    // Add last_name column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
    `);
    console.log('✅ Added last_name column');

    // Add bio column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT;
    `);
    console.log('✅ Added bio column');

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now use first_name, last_name, and bio fields in your profile.\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Error details:', error);
    await pool.end();
    process.exit(1);
  }
};

runMigration();
