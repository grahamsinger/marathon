#!/bin/bash
# Start the Marathon Training stack: the app server (:8000, via launchd) and
# the Apache reverse proxy (:80). This is the mirror of shutdown.sh.
#
# NOTE: this is NOT serve.sh. serve.sh is the manual/dev path — it rebuilds the
# frontend and runs the app in the foreground, and would conflict with the
# launchd-managed app on port 8000. This script instead brings up the managed
# background services (which is what auto-starts on login/reboot anyway).
#
# It does NOT rebuild the frontend. If you changed the UI, rebuild first:
#   cd frontend && npm run build
#
# Starting Apache needs sudo and will prompt for your password.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PLIST="$HOME/Library/LaunchAgents/com.marathon.app.plist"
HOST_LOCAL="$(scutil --get LocalHostName 2>/dev/null || hostname -s).local"

echo "Starting the app (loading its LaunchAgent)..."
if launchctl list | grep -q 'com\.marathon\.app$'; then
  echo "  (app already running)"
elif [ ! -f "$APP_PLIST" ]; then
  echo "  agent not installed yet — run ./deploy/install.sh first" >&2
  exit 1
else
  launchctl load -w "$APP_PLIST"
fi

echo "Starting the Apache reverse proxy..."
"$DIR/start_httpd.sh"

echo "Done. App on :8000, proxy on :80 -> http://$HOST_LOCAL"
