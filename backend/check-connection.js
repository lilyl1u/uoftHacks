// Quick script to check which database you're connected to
require('dotenv').config();

console.log('🔍 Checking database configuration...\n');

if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL is set');
  // Mask password for security
  const masked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@');
  console.log('   Connection:', masked);
  
  if (process.env.DATABASE_URL.includes('supabase')) {
    console.log('   ✅ Detected: Supabase (shared database)');
  } else if (process.env.DATABASE_URL.includes('localhost')) {
    console.log('   ⚠️  Detected: Local database');
  } else {
    console.log('   ℹ️  Detected: Cloud database');
  }
} else {
  console.log('❌ DATABASE_URL is NOT set');
  console.log('   Using individual config instead:');
  console.log('   Host:', process.env.DB_HOST || 'localhost (default)');
  console.log('   Database:', process.env.DB_NAME || 'uoft_washrooms (default)');
  console.log('   ⚠️  This means you\'re connecting to LOCAL database!');
}

console.log('\n💡 To use Supabase:');
console.log('   1. Add DATABASE_URL to backend/.env');
console.log('   2. Restart your backend server');
