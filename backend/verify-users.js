// Verify users are being stored in the shared database
require('dotenv').config();
const { Pool } = require('pg');

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

async function verifyUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const client = await pool.connect();
    
    // Check which database we're connected to
    const dbInfo = process.env.DATABASE_URL 
      ? (process.env.DATABASE_URL.includes('supabase') ? 'Supabase (shared)' : 'Cloud database')
      : 'Local database';
    
    console.log(`📊 Connected to: ${dbInfo}\n`);
    
    // Get all users
    const result = await client.query(`
      SELECT id, username, created_at, washrooms_visited
      FROM users
      ORDER BY created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No users found in database.');
      console.log('   Create an account in your app to test!');
    } else {
      console.log(`✅ Found ${result.rows.length} user(s):\n`);
      result.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`      Washrooms visited: ${user.washrooms_visited}`);
        console.log('');
      });
    }
    
    // Check if this is shared database
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')) {
      console.log('✅ This is a SHARED database - all users are visible to everyone!');
      console.log('   You can verify in Supabase dashboard: Table Editor → users');
    } else {
      console.log('⚠️  This is a LOCAL database - users are only on your machine.');
      console.log('   To use shared database, set DATABASE_URL in backend/.env');
    }
    
    client.release();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error checking users:', error.message);
    process.exit(1);
  }
}

verifyUsers();
