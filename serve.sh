#!/bin/bash
# Production-style launch: build the frontend, then serve the whole app
# (React SPA + API) from a single FastAPI server on port 8000.
#
# Access from any device on the local network:
#   http://<your-mac>.local:8000   (or http://<this-mac-ip>:8000)
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building frontend..."
cd "$DIR/frontend"
npm run build

echo "Starting server on http://0.0.0.0:8000 ..."
cd "$DIR/backend"
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
