# Shared Database Setup Guide

This guide will help you set up a shared database so everyone can see the same washrooms and reviews.

## Option 1: Supabase (Recommended - Free & Easy)

### Step 1: Create a Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" and sign up (free)
3. Create a new project:
   - **Name**: `uoft-washrooms` (or any name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - Click "Create new project"

### Step 2: Get Your Database Connection Info

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Copy the **URI** connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### Step 3: Initialize the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `backend/src/config/db-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

### Step 4: Update Your Backend Configuration

1. Create or edit `backend/.env` file:
```env
# Supabase Database Connection
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password

# OR use connection string (alternative method)
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Server Configuration
PORT=3001
JWT_SECRET=your-random-secret-key-here-change-this
```

2. Replace:
   - `db.xxxxx.supabase.co` with your actual Supabase host
   - `your-supabase-password` with your Supabase database password
   - `your-random-secret-key-here-change-this` with a random string (for JWT tokens)

### Step 5: Share Configuration with Your Team

**Option A: Share the `.env` file** (easiest)
- Share the `backend/.env` file with your team members
- They copy it to their `backend/` folder

**Option B: Share connection details** (more secure)
- Share the connection details (host, password, etc.) via secure channel
- Each person creates their own `backend/.env` file

### Step 6: Test the Connection

1. Start your backend:
```bash
cd backend
npm run dev
```

2. You should see: `Connected to PostgreSQL database`

3. Try adding a washroom - it should now be visible to everyone!

---

## Option 2: Neon (Alternative Free Option)

1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string
5. Use the same `.env` format as above

---

## Option 3: Railway (Easy Deployment)

1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Get connection details from the database settings
4. Use the same `.env` format

---

## Troubleshooting

### "Connection refused" or "Cannot connect"
- Check that your `DB_HOST` is correct (no `http://` prefix)
- Verify your password is correct
- Make sure your IP is allowed (Supabase allows all by default)

### "Database does not exist"
- Make sure `DB_NAME=postgres` (Supabase uses `postgres` as default database name)
- Or check your Supabase dashboard for the correct database name

### "Authentication failed"
- Double-check your password
- Make sure there are no extra spaces in your `.env` file

---

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to git (it should be in `.gitignore`)
- Share credentials securely with your team
- The `.env` file contains sensitive information

---

## After Setup

Once everyone has the shared database configured:
- ✅ All washrooms added will be visible to everyone
- ✅ All reviews will be shared
- ✅ All users can see the same data
- ✅ Perfect for demos and team collaboration!
