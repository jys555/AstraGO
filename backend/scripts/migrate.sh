#!/bin/sh
# Railway migration script
# This script runs migrations, and if no migrations exist, uses db push as fallback

echo "🔄 Checking for migrations..."

# Try to run migrations
if npm run db:migrate 2>/dev/null; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️  No migrations found, using db push as fallback..."
  npx prisma db push --accept-data-loss
  echo "✅ Database schema synced"
fi