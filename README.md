# UofT Washroom Finder

A collaborative washroom rating and mapping app for University of Toronto.

## Quick Start

### Local Development (Each person has their own database)
See [SETUP.md](./SETUP.md) for local setup instructions.

### Shared Database Setup (Everyone sees the same data)
See [SHARED_DATABASE_SETUP.md](./SHARED_DATABASE_SETUP.md) for setting up a shared cloud database.

## Features

- 🗺️ Interactive map with washroom locations
- ⭐ Rate washrooms on multiple criteria
- 👥 User profiles and badges
- 📍 Add new washroom locations
- ♿ Accessibility information
- 💰 Paid access indicators

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Leaflet
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── docker-compose.yml # Docker setup for local database
└── start-db.sh       # Script to start local database
```

## Environment Variables

Create `backend/.env` with:

```env
# For local database:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uoft_washrooms
DB_USER=postgres
DB_PASSWORD=

# OR for cloud database (Supabase/Neon):
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

PORT=3001
JWT_SECRET=your-secret-key-here
```

## Contributing

1. Clone the repository
2. Set up your database (local or shared)
3. Install dependencies: `npm install` in both `frontend/` and `backend/`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`