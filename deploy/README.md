# Deployment & operations

How the Marathon Training app runs on the local network, and how to operate it.

## What runs where

| Piece | Where | Managed by |
|-------|-------|------------|
| App (FastAPI + built frontend) | `127.0.0.1:8000` | launchd agent `com.grahamsinger.marathon` |
| Reverse proxy (port-80 → 8000) | `:80` (Apache) | `/etc/apache2/other/marathon.conf` |
| Daily DB backup → iCloud | runs at noon + on login | launchd agent `com.grahamsinger.marathon-backup` |

Reachable on the network at **http://Grahams-MBP.local** (or the Mac's LAN IP).
The app auto-starts at login and restarts if it crashes; Apache is started via
`start_httpd.sh` (and optionally on boot — see below).

The database is a single SQLite file: `backend/marathon_training.db`. It is **not**
in git — it's the live data and is backed up to iCloud instead.

## Scripts (run from the repo root)

| Script | Purpose | sudo |
|--------|---------|------|
| `./startup.sh` | Bring up the app (launchd) + Apache proxy | yes (Apache) |
| `./shutdown.sh` | Stop the app + Apache proxy | yes (Apache) |
| `./start_httpd.sh` | Start/restart just the Apache proxy | yes |
| `./serve.sh` | Dev/manual: rebuild frontend + run app in foreground | no |
| `./deploy/backup_db.sh` | Snapshot the DB to iCloud now (also runs daily) | no |
| `./deploy/restore_db.sh` | Restore the DB from a snapshot | no |

After changing the **frontend**, rebuild so the served files update:
`cd frontend && npm run build` (or run `./serve.sh` once).

## Backups

- **Where:** `~/Library/Mobile Documents/com~apple~CloudDocs/data/marathon_training-<timestamp>.db`
- **When:** automatically daily at noon (and once at login); the newest 60 are kept.
- **On demand:** `./deploy/backup_db.sh`
- Snapshots use SQLite's `.backup` (consistent even while the app is running).

## Restoring from a backup

List what's available, then restore one:

```bash
./deploy/restore_db.sh                       # lists snapshots, newest first
./deploy/restore_db.sh marathon_training-20260525-170805.db
```

The script verifies the snapshot, stops the app, snapshots the **current** DB
first (as `pre-restore-<timestamp>.db`, so the restore is reversible), swaps the
chosen file in, and restarts the app.

**Manual equivalent**, if you'd rather do it by hand:

```bash
launchctl unload ~/Library/LaunchAgents/com.grahamsinger.marathon.plist
cp "~/Library/Mobile Documents/com~apple~CloudDocs/data/<snapshot>.db" \
   backend/marathon_training.db
rm -f backend/marathon_training.db-wal backend/marathon_training.db-shm
launchctl load -w ~/Library/LaunchAgents/com.grahamsinger.marathon.plist
```

> **iCloud note:** iCloud may offload old snapshots to save space, showing them as
> not-yet-downloaded placeholders. If a restore reports the file as missing, open
> it once in Finder to pull it down, then retry. The data itself is safe in the cloud.

## First-time / after a macOS reset

The Apache proxy config and the launchd agents live in this `deploy/` folder as the
source of truth. To (re)install:

```bash
# Reverse proxy (auto-loaded by macOS's httpd.conf)
sudo cp deploy/marathon.apache.conf /etc/apache2/other/marathon.conf
sudo apachectl configtest && sudo apachectl restart

# App + backup launchd agents
cp deploy/com.grahamsinger.marathon.plist        ~/Library/LaunchAgents/
cp deploy/com.grahamsinger.marathon-backup.plist ~/Library/LaunchAgents/
launchctl load -w ~/Library/LaunchAgents/com.grahamsinger.marathon.plist
launchctl load -w ~/Library/LaunchAgents/com.grahamsinger.marathon-backup.plist
```

To make **Apache** come up on every boot (one-time):

```bash
sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist
```
