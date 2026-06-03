#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy --config /app/prisma.config.mjs
fi

if [ "${RUN_SEEDS:-false}" = "true" ]; then
  echo "Running database seeds..."
  npx prisma db seed --config /app/prisma.config.mjs
fi

exec node /app/main.js
