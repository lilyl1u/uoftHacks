# Seed Test Data Instructions

This guide will help you populate your database with test data including users, washrooms, reviews, and friendships.

## Option 1: Using the Node.js Script (Recommended)

This script will create:
- 10 test users (all with password: `test123`)
- 12 washrooms around UofT campus
- Multiple reviews from different users
- Friendships (lilyv3 will be friends with alice_washroom, bob_reviewer, charlie_pooper, diana_finder)
- Washroom visits

### Steps:

1. **Make sure your `.env` file is configured** with your database connection:
   ```env
   DATABASE_URL=your_supabase_connection_string
   # OR
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=uoft_washrooms
   DB_USER=your_user
   DB_PASSWORD=your_password
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Run the seed script:**
   ```bash
   npm run seed
   ```
   
   Or directly:
   ```bash
   node seed-data.js
   ```

4. **Verify the data was created:**
   The script will output statistics showing how many users, washrooms, reviews, etc. were created.

## Option 2: Using SQL Directly in Supabase

If you prefer to run SQL directly in Supabase:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `SEED_TEST_DATA.sql`
3. **IMPORTANT:** The SQL file uses placeholder password hashes. You'll need to:
   - Either register the users through your app first
   - Or generate proper bcrypt hashes for password 'test123'

## Test User Credentials

After seeding, you can log in with any of these test users:

- **Username:** `alice_washroom`, `bob_reviewer`, `charlie_pooper`, `diana_finder`, `eve_explorer`, `frank_visitor`, `grace_mapper`, `henry_rated`, `ivy_student`, `jack_finder`
- **Password:** `test123` (for all test users)
- **lilyv3:** Will remain as admin (password unchanged)

## What Gets Created

- **10 Test Users:** Regular users with different personality types
- **12 Washrooms:** Located around UofT campus with various ratings
- **14 Reviews:** Reviews from different users for different washrooms
- **Friendships:** lilyv3 will be friends with 4 users (alice, bob, charlie, diana), so their reviews will show up in the Explore page
- **Washroom Visits:** Some users have visit history

## Notes

- The script uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times
- Existing data won't be deleted, only new data will be added
- lilyv3 will be set to admin role if it exists
- All test users have the same password: `test123`

## Troubleshooting

If you get connection errors:
- Check your `.env` file has the correct `DATABASE_URL`
- Make sure your Supabase database is accessible
- Verify the database schema has been created (run `db-schema.sql` first)

If users aren't created:
- Check if usernames already exist (the script will skip them)
- Look for error messages in the console output
