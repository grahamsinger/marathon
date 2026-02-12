#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting backend..."
cd "$DIR/backend"
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting frontend..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""

wait
