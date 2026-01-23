#!/bin/sh
# Railway start script with migration
set -e

echo "🔄 Running database migrations..."
npm run db:migrate || npx prisma db push --accept-data-loss || echo "⚠️  Migration failed, continuing anyway..."

echo "🚀 Starting server..."
node dist/index.js
