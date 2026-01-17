// Quick database connection test
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

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Test 1: Connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!\n');
    
    // Test 2: Check if tables exist
    console.log('📊 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const expectedTables = ['users', 'washrooms', 'reviews', 'user_washroom_visits'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('Found tables:', existingTables.join(', '));
    
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
      console.log('   Run the schema: Copy backend/src/config/db-schema.sql to Supabase SQL Editor');
    } else {
      console.log('✅ All required tables exist!\n');
    }
    
    // Test 3: Check table structures
    console.log('📋 Table structures:');
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position;
        `, [table]);
        
        console.log(`\n  ${table}:`);
        columnsResult.rows.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      }
    }
    
    // Test 4: Count records
    console.log('\n📈 Record counts:');
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${countResult.rows[0].count} records`);
      }
    }
    
    client.release();
    console.log('\n✅ Database test complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database test failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check:');
      console.error('   - Is your DATABASE_URL correct?');
      console.error('   - Is Supabase project active?');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Host not found. Check your DATABASE_URL hostname.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your password in DATABASE_URL.');
    }
    
    process.exit(1);
  }
}

testDatabase();
