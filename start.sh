#!/bin/sh
set -e

npx drizzle-kit migrate
exec npx tsx index.ts --debug