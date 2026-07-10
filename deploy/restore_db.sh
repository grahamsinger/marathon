#!/bin/bash
# Restore the Marathon Training database from an iCloud backup snapshot.
#
# Usage:
#   ./deploy/restore_db.sh                  # list available snapshots
#   ./deploy/restore_db.sh <snapshot>       # restore (bare filename or full path)
#
# Safe by design: it verifies the snapshot, stops the app, snapshots the
# CURRENT database first (so the restore is itself reversible), swaps in the
# chosen backup, and restarts the app.
set -euo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB="$REPO_DIR/backend/marathon_training.db"
BACKUPS="$HOME/Library/Mobile Documents/com~apple~CloudDocs/data"
APP_PLIST="$HOME/Library/LaunchAgents/com.marathon.app.plist"

if [ $# -eq 0 ]; then
  echo "Available snapshots (newest first):"
  ls -1t "$BACKUPS"/marathon_training-*.db 2>/dev/null | sed 's#.*/##' | head -30 \
    || echo "  (none found in $BACKUPS)"
  echo
  echo "Restore with:  ./deploy/restore_db.sh <snapshot-filename>"
  exit 0
fi

# Accept either a bare filename (looked up in the backups dir) or a full path.
ARG="$1"
if [ -f "$ARG" ]; then SRC="$ARG"; else SRC="$BACKUPS/$ARG"; fi
if [ ! -f "$SRC" ]; then
  echo "ERROR: snapshot not found: $SRC" >&2
  echo "(If it's in iCloud and shows as not found, it may be offloaded — open it" >&2
  echo " once in Finder to download it, then retry.)" >&2
  exit 1
fi

# Make sure the snapshot is a healthy SQLite file before touching the live DB.
if [ "$(sqlite3 "$SRC" 'PRAGMA integrity_check;')" != "ok" ]; then
  echo "ERROR: snapshot failed integrity check: $SRC" >&2
  exit 1
fi

echo "Stopping the app..."
launchctl unload "$APP_PLIST" 2>/dev/null || true
sleep 2

if [ -f "$DB" ]; then
  PRE="$BACKUPS/pre-restore-$(date +%Y%m%d-%H%M%S).db"
  echo "Snapshotting CURRENT db first -> $(basename "$PRE")"
  sqlite3 "$DB" ".backup '$PRE'"
fi

echo "Restoring $(basename "$SRC") -> marathon_training.db"
cp "$SRC" "$DB"
rm -f "$DB-wal" "$DB-shm"   # drop any stale WAL sidecar files

echo "Restarting the app..."
launchctl load -w "$APP_PLIST"
sleep 3

echo "Done. Restored from: $(basename "$SRC")"
echo "(If anything looks wrong, the pre-restore copy above can be restored the same way.)"
