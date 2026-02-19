#!/bin/sh
set -e

echo "Cleaning /app except ghostink.ini and stash.json..."
find /app -mindepth 1 ! -name 'ghostink.ini' ! -name 'stash.json' -exec rm -rf {} +

echo "Copying fresh contents from /app_defaults..."
cp -r /app_defaults/* /app/

echo "Setting permissions..."
find /app -mindepth 1 ! -name 'ghostink.ini' ! -name 'stash.json' -exec chown $(id -u):$(id -g) {} +

exec "$@"
