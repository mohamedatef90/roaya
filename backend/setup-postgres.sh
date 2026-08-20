#!/bin/bash
echo "🐘 Starting PostgreSQL container..."

# Stop and remove existing container if it exists
docker stop roaya-postgres 2>/dev/null
docker rm roaya-postgres 2>/dev/null

# Start PostgreSQL container
docker run -d \
  --name roaya-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=roaya_leads \
  -p 5432:5432 \
  postgres:16-alpine

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Test connection
docker exec roaya-postgres psql -U postgres -c "SELECT version();" || {
  echo "❌ PostgreSQL failed to start"
  exit 1
}

echo "✅ PostgreSQL is ready!"
echo "📊 Database: roaya_leads"
echo "👤 User: postgres"
echo "🔑 Password: postgres"
echo "🔌 Port: 5432"
