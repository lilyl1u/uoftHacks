# Quick Supabase Setup (5 minutes)

## Step 1: Create Supabase Project (2 min)

1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Fill in:
   - **Name**: `uoft-washrooms`
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait ~2 minutes for project to initialize

## Step 2: Get Connection String (1 min)

1. In Supabase dashboard, click **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Under **URI**, copy the connection string
   - It looks like: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Replace `[YOUR-PASSWORD]` with your actual password

## Step 3: Initialize Database Schema (1 min)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Open `backend/src/config/db-schema.sql` in your code editor
3. Copy ALL the contents
4. Paste into Supabase SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 4: Configure Backend (1 min)

1. Create `backend/.env` file (if it doesn't exist):
```bash
cd backend
touch .env
```

2. Add this to `backend/.env`:
```env
# Supabase Connection String
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Server
PORT=3001

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-change-this
```

3. Replace:
   - `DATABASE_URL` with your actual connection string from Step 2
   - `JWT_SECRET` with a random string (you can use: `openssl rand -base64 32`)

## Step 5: Test It! (30 sec)

1. Start your backend:
```bash
cd backend
npm run dev
```

2. You should see: `Connected to PostgreSQL database` ✅

3. Try adding a washroom in your app - it should work!

## Step 6: Share with Team

**Option A: Share .env file** (easiest)
- Send `backend/.env` to your team members
- They copy it to their `backend/` folder

**Option B: Share connection details** (more secure)
- Share the `DATABASE_URL` and `JWT_SECRET` securely
- Each person creates their own `backend/.env`

⚠️ **Important**: Never commit `.env` to git! It's already in `.gitignore`.

## Troubleshooting

### "Connection refused"
- Check your connection string is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Try the "Session mode" connection string instead of "Transaction mode"

### "Database does not exist"
- Make sure you ran the SQL schema in Step 3
- Check that the database name in connection string is `postgres`

### "Authentication failed"
- Double-check your password
- Make sure there are no extra spaces in `.env` file

## Done! 🎉

Now everyone using this database will see the same washrooms and reviews!
