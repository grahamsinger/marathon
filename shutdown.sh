#!/bin/bash
# Shut down the Marathon Training stack: stop the app server (:8000) and the
# Apache reverse proxy (:80). Scheduled iCloud backups are left enabled — they
# don't depend on the app running.
#
# Note: the app is managed by launchd with KeepAlive, so simply killing the
# process won't work (it would restart). This unloads the LaunchAgent instead.
#
# To bring it back up:
#   ./startup.sh          # app on :8000 + proxy on :80
# Both also come back automatically on your next login / reboot.
#
# Stopping Apache needs sudo and will prompt for your password.
set -e

APP_PLIST="$HOME/Library/LaunchAgents/com.marathon.app.plist"

echo "Stopping the app (unloading its LaunchAgent)..."
launchctl unload "$APP_PLIST" 2>/dev/null || echo "  (app agent was not loaded)"

echo "Stopping the Apache reverse proxy..."
if pgrep -x httpd >/dev/null; then
  sudo apachectl stop
else
  echo "  (Apache was not running)"
fi

echo "Done. App (:8000) and proxy (:80) are stopped. Daily backups remain scheduled."
