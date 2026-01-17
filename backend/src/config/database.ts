import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Support both connection string (for Supabase/cloud) and individual config (for local)
let poolConfig: any;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (common for cloud databases like Supabase)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('neon') 
      ? { rejectUnauthorized: false } 
      : undefined,
  };
} else {
  // Use individual config (for local databases)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'uoft_washrooms',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

export const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', (client) => {
  const dbInfo = process.env.DATABASE_URL 
    ? (process.env.DATABASE_URL.includes('supabase') ? 'Supabase (shared)' : 'Cloud database')
    : 'Local database';
  console.log(`✅ Connected to PostgreSQL database (${dbInfo})`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
