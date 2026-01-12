#!/bin/bash
# Database migration script for Render PostgreSQL

DATABASE_URL="postgresql://isrs_user:rzE9q7ONZUAAdnA7ndLMXPKILyI6mnVr@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database"

echo "🔄 Running database migration..."
echo "📊 Creating tables, views, and triggers..."

# Run the schema
psql "$DATABASE_URL" < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Verifying tables..."
    psql "$DATABASE_URL" -c "\dt"
else
    echo "❌ Migration failed!"
    exit 1
fi
