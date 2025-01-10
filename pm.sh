#!/bin/bash

APP_NAME="accord"
DEFAULT_PORT=33843
PORT=${1:-$DEFAULT_PORT}

echo "Starting Accord on port $PORT..."

npm run build

export PORT=$PORT

pm2 delete accord
pm2 start build/index.js --name "$APP_NAME"
pm2 save

echo "Running on port $PORT"