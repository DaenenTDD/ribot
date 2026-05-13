#!/bin/sh
ENV=${1:-development}  # defaults to development if no arg given
npm ci --omit=dev
npx drizzle-kit migrate
exec npx tsx index.ts env=$ENV