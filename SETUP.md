# Quick Setup Guide

> **Want to share data with your team?** See [SHARED_DATABASE_SETUP.md](./SHARED_DATABASE_SETUP.md) for setting up a cloud database that everyone can access.

## Issue: "Signup failed. Please try again."

This error occurs because the **backend server is not running**. Follow these steps:

## Step 1: Set up PostgreSQL Database

### Option A: If you have PostgreSQL installed
```bash
# Create the database
createdb uoft_washrooms

# Or using psql:
psql -U postgres
CREATE DATABASE uoft_washrooms;
\q
```

### Option B: Install PostgreSQL (macOS)
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Then create database
createdb uoft_washrooms
```

### Option C: Use Docker (easiest)
```bash
# Run PostgreSQL in Docker
docker run --name uoft-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=uoft_washrooms \
  -p 5432:5432 \
  -d postgres:14

# Update backend/.env with:
# DB_USER=postgres
# DB_PASSWORD=postgres
```

## Step 2: Initialize Database Schema

```bash
cd backend
psql -U postgres -d uoft_washrooms -f src/config/db-schema.sql
```

If using Docker:
```bash
docker exec -i uoft-postgres psql -U postgres -d uoft_washrooms < backend/src/config/db-schema.sql
```

## Step 3: Configure Backend Environment

1. Edit `backend/.env` and update:
   - `DB_USER` - your PostgreSQL username (default: `postgres`)
   - `DB_PASSWORD` - your PostgreSQL password (leave empty if no password)
   - `JWT_SECRET` - change to a random string

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 3001
Connected to PostgreSQL database
```

## Step 5: Start Frontend (if not already running)

```bash
cd frontend
npm run dev
```

## Troubleshooting

### "Cannot connect to server"
- Make sure backend is running on port 3001
- Check `backend/.env` has correct database credentials

### "Database connection error"
- Verify PostgreSQL is running: `pg_isready` or check Docker container
- Check database credentials in `backend/.env`
- Make sure database `uoft_washrooms` exists

### "Port 3001 already in use"
- Change `PORT` in `backend/.env` to a different port
- Update `frontend/vite.config.ts` proxy target to match
