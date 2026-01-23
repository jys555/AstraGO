#!/bin/sh
# Railway start script with migration

echo "🔄 Running database migrations..."

# Try migrate deploy first
if npm run db:migrate 2>&1 | grep -q "No pending migrations"; then
  echo "⚠️  No migrations found, using db push..."
  # Use db push as fallback if migrations don't exist
  npx prisma db push --accept-data-loss --skip-generate || {
    echo "⚠️  db push failed, but continuing..."
  }
elif npm run db:migrate; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️  Migration failed, trying db push..."
  npx prisma db push --accept-data-loss --skip-generate || {
    echo "⚠️  db push also failed, but continuing..."
  }
fi

echo "🚀 Starting server..."
node dist/index.js
