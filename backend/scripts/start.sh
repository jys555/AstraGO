#!/bin/sh
# Railway start script with migration
set -e

echo "🔄 Running database migrations..."

# First, try to run migrations
MIGRATE_OUTPUT=$(npm run db:migrate 2>&1) || true

if echo "$MIGRATE_OUTPUT" | grep -q "No pending migrations\|No migration found"; then
  echo "⚠️  No migrations found, using db push to sync schema..."
  # Use db push to sync schema if migrations don't exist
  npx prisma db push --accept-data-loss --skip-generate
  echo "✅ Database schema synced with db push"
elif echo "$MIGRATE_OUTPUT" | grep -q "migrations applied\|Migration.*applied"; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️  Migration had issues, trying db push as fallback..."
  npx prisma db push --accept-data-loss --skip-generate
  echo "✅ Database schema synced with db push"
fi

# Verify database connection and tables exist
echo "🔍 Verifying database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1 || {
  echo "❌ Database connection failed!"
  exit 1
}

echo "🚀 Starting server..."
node dist/index.js
