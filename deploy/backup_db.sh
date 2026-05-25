#!/bin/bash
# Back up the Marathon Training SQLite database to iCloud Drive.
#
# Uses SQLite's .backup command (the backup API), which produces a CONSISTENT
# copy even while the app is running — unlike a plain cp, which can capture a
# torn/locked file mid-write.
#
# Run manually any time:   ./deploy/backup_db.sh
# Runs automatically daily via the LaunchAgent:
#   deploy/com.grahamsinger.marathon-backup.plist
set -euo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin"

DB="/Users/grahamsinger/dev/claude_code/marathon_training/backend/marathon_training.db"
DEST="/Users/grahamsinger/Library/Mobile Documents/com~apple~CloudDocs/data"
KEEP=60   # how many recent snapshots to retain (each is tiny, ~28 KB)

mkdir -p "$DEST"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DEST/marathon_training-$STAMP.db"

# Consistent online backup (note the single-quoted path handles spaces).
/usr/bin/sqlite3 "$DB" ".backup '$OUT'"

# Sanity-check the copy actually opens and is well-formed.
if [ "$(/usr/bin/sqlite3 "$OUT" 'PRAGMA integrity_check;')" != "ok" ]; then
  echo "ERROR: integrity check failed for $OUT" >&2
  exit 1
fi

# Prune: keep the newest $KEEP snapshots, delete older ones. Operate on bare
# filenames (avoids shell globbing, which behaved inconsistently under launchd)
# and never let pruning fail the whole backup ( || true ).
ls -1t "$DEST" 2>/dev/null | grep -E '^marathon_training-[0-9-]+\.db$' \
  | tail -n +"$((KEEP + 1))" | while IFS= read -r name; do
    rm -f "$DEST/$name"
  done || true

echo "Backed up to: $OUT"
