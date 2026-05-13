#!/bin/sh
ENV=${1:-development}  # defaults to development if no arg given
npm ci
exec npx tsx index.ts env=$ENV