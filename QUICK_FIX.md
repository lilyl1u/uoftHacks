# Quick Fix: Database Connection Error

## The Problem
You're getting "Internal server error" because PostgreSQL is not running. The backend can't connect to the database on port 5432.

## Solution Options

### Option 1: Install PostgreSQL with Homebrew (Recommended for macOS)

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create the database
createdb uoft_washrooms

# Initialize the schema
psql -U $(whoami) -d uoft_washrooms -f backend/src/config/db-schema.sql
```

Then update `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uoft_washrooms
DB_USER=your_username  # Usually your macOS username
DB_PASSWORD=          # Leave empty if no password set
```

### Option 2: Install Docker Desktop

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Run: `./start-db.sh` from the project root

### Option 3: Use a Cloud Database (Free Tier)

You can use a free PostgreSQL database from:
- **Supabase**: https://supabase.com (free tier available)
- **Neon**: https://neon.tech (free tier available)
- **Railway**: https://railway.app (free tier available)

Just update the `DATABASE_URL` in `backend/.env` with the connection string they provide.

### Option 4: Use SQLite (Simplest, for development only)

If you want to skip PostgreSQL setup for now, I can modify the backend to use SQLite instead. This is easier but less production-ready.

## After Setting Up Database

1. Make sure `backend/.env` exists with correct database credentials
2. Restart your backend server (it should auto-reload if using `npm run dev`)
3. Try signing up again

## Current Error Message

The error message has been improved - you should now see:
- "Database connection failed. Please ensure PostgreSQL is running and configured correctly."

Instead of the generic "Internal server error".
