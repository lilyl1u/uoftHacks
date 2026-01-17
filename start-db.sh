#!/bin/bash

# Script to start PostgreSQL database using Docker

echo "Starting PostgreSQL database..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker Desktop first."
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "Error: docker-compose is not available."
    exit 1
fi

# Start the database
cd "$(dirname "$0")"
$COMPOSE_CMD up -d postgres

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 3

# Check if database is ready
if docker exec uoft-postgres pg_isready -U postgres &> /dev/null; then
    echo "✅ PostgreSQL is running!"
    echo ""
    echo "Initializing database schema..."
    
    # Initialize schema
    docker exec -i uoft-postgres psql -U postgres -d uoft_washrooms < backend/src/config/db-schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema initialized!"
    else
        echo "⚠️  Warning: Could not initialize schema. You may need to run it manually:"
        echo "   docker exec -i uoft-postgres psql -U postgres -d uoft_washrooms < backend/src/config/db-schema.sql"
    fi
    
    echo ""
    echo "Database connection info:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: uoft_washrooms"
    echo "  User: postgres"
    echo "  Password: postgres"
    echo ""
    echo "Make sure your backend/.env has:"
    echo "  DB_USER=postgres"
    echo "  DB_PASSWORD=postgres"
else
    echo "❌ Database failed to start. Check Docker logs:"
    echo "   docker logs uoft-postgres"
fi
