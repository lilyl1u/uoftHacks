# Backend API

Express.js backend with TypeScript and PostgreSQL.

## Quick Start

1. Install dependencies: `npm install`
2. Set up `.env` file (see `.env.example`)
3. Create database and run schema: `psql -U username -d uoft_washrooms -f src/config/db-schema.sql`
4. Run development server: `npm run dev`

## Environment Variables

See `.env.example` for required environment variables.

## Database Setup

The database schema is defined in `src/config/db-schema.sql`. Run this file to initialize your database tables.
