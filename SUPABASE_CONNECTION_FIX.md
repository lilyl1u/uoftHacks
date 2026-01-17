# Fix Supabase Connection Error (ENOTFOUND)

## The Problem
Your connection string is using the direct connection format which might not work. You need to use the **pooler connection** instead.

## Solution: Get the Correct Connection String

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project
2. Click **Settings** (gear icon) → **Database**

### Step 2: Get Pooler Connection String
1. Scroll to **Connection string** section
2. Look for **Connection pooling** tab (not "Direct connection")
3. Select **Session mode** (recommended)
4. Copy the **URI** connection string

It should look like:
```
postgresql://postgres.pbdsapvuhscxvoevhbqz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key differences:**
- ✅ Pooler: `aws-0-us-east-1.pooler.supabase.com:6543`
- ❌ Direct: `db.pbdsapvuhscxvoevhbqz.supabase.co:5432`

### Step 3: Update backend/.env

Replace your `DATABASE_URL` with the pooler connection string:

```env
DATABASE_URL=postgresql://postgres.pbdsapvuhscxvoevhbqz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Important:** 
- Replace `[YOUR-PASSWORD]` with your actual Supabase database password
- Make sure you're using the **pooler** connection (port 6543), not direct (port 5432)

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

You should now see: `Connected to PostgreSQL database` ✅

## Alternative: Check if Project is Paused

If the pooler connection still doesn't work:
1. Check if your Supabase project is paused (free tier projects pause after inactivity)
2. If paused, click "Restore" to wake it up
3. Wait a minute for it to start, then try again
