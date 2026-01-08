#!/bin/bash

# Render deployment initialization script
# Run this if you need to set up the database or run migrations

set -e

echo "🚀 Initializing ChatApp on Render..."

# Run database migrations
if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Running production migrations..."
  pnpm db:push
else
  echo "📦 Running development migrations..."
  pnpm db:push
fi

echo "✅ Initialization complete!"
