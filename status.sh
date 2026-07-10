#!/bin/bash
# Health check for the Marathon Training stack. Read-only — safe to run anytime,
# including while the app is in use. Reports the app, the Apache proxy, the API,
# the launchd agents, and the most recent backup (age + integrity).
export PATH="/usr/bin:/bin:/usr/sbin:/sbin"

DB_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/data"
APP_LABEL="com.marathon.app"
BACKUP_LABEL="com.marathon.backup"
HOST_LOCAL="$(scutil --get LocalHostName 2>/dev/null || hostname -s).local"

ok()  { printf "  \033[32m✓\033[0m %s\n" "$1"; }
bad() { printf "  \033[31m✗\033[0m %s\n" "$1"; }

echo "Marathon Training — status ($(date '+%Y-%m-%d %H:%M'))"

# App listening on :8000
if lsof -nP -iTCP:8000 -sTCP:LISTEN >/dev/null 2>&1; then
  ok "app listening on :8000"
else
  bad "app NOT on :8000  ->  ./startup.sh"
fi

# API reachable through the proxy on :80
code=$(curl -s -o /dev/null -m 5 -w '%{http_code}' http://localhost/api/race-info)
if [ "$code" = "200" ]; then
  ok "proxy + API healthy on :80  (http://$HOST_LOCAL)"
else
  bad "proxy/API on :80 returned HTTP ${code:-no-response}  ->  ./start_httpd.sh"
fi

# launchd: app agent loaded?
if launchctl list | grep -q "${APP_LABEL}\$"; then
  ok "app launchd agent loaded (auto-restarts)"
else
  bad "app launchd agent NOT loaded  ->  ./deploy/install.sh"
fi

# launchd: backup agent loaded + last exit status
bexit=$(launchctl list | awk -v l="$BACKUP_LABEL" '$3==l {print $2}')
if [ -z "$bexit" ]; then
  bad "backup agent NOT loaded"
elif [ "$bexit" = "0" ]; then
  ok "backup agent loaded (last run succeeded)"
else
  bad "backup agent last run FAILED (exit $bexit) -> see marathon.backup.log"
fi

# Most recent backup: age + integrity + size
newest=$(ls -1t "$DB_DIR"/marathon_training-*.db 2>/dev/null | head -1)
if [ -z "$newest" ]; then
  bad "no backups found in iCloud data dir"
else
  age_h=$(( ( $(date +%s) - $(stat -f %m "$newest") ) / 3600 ))
  integ=$(sqlite3 "$newest" 'PRAGMA integrity_check;' 2>/dev/null)
  rows=$(sqlite3 "$newest" 'SELECT COUNT(*) FROM workouts;' 2>/dev/null)
  msg="last backup ~${age_h}h ago: $(basename "$newest")  (${rows} workouts, integrity ${integ:-unknown})"
  if [ "$integ" = "ok" ] && [ "$age_h" -lt 36 ]; then ok "$msg"; else bad "$msg  <-- stale or unhealthy"; fi
fi
