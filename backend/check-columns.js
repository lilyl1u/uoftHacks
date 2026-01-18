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

const checkColumns = async () => {
  try {
    console.log('🔍 Checking if columns exist in users table...\n');

    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('first_name', 'last_name', 'bio')
      ORDER BY column_name;
    `);

    console.log('Found columns:');
    if (result.rows.length === 0) {
      console.log('  ❌ No columns found! They need to be added.');
    } else {
      result.rows.forEach(row => {
        console.log(`  ✅ ${row.column_name} (${row.data_type})`);
      });
    }

    // Check all columns in users table
    const allColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);

    console.log('\nAll columns in users table:');
    allColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking columns:', error.message);
    console.error('Error details:', error);
    await pool.end();
    process.exit(1);
  }
};

checkColumns();
