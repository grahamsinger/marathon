# Deployment & operations

How the Marathon Training app runs on the local network, and how to operate it.
The app is served from a Mac that stays on the home network; any device on the
same network (or on the tailnet — see [TAILSCALE.md](TAILSCALE.md)) can use it.

Below, `<your-mac>.local` is the server Mac's Bonjour hostname (System
Settings → General → Sharing → Local hostname).

## What runs where

| Piece | Where | Managed by |
|-------|-------|------------|
| App (FastAPI + built frontend) | `127.0.0.1:8000` | launchd agent `com.marathon.app` |
| Reverse proxy (port-80 → 8000) | `:80` (Apache) | `/etc/apache2/other/marathon.conf` |
| Daily DB backup → iCloud | runs at noon + on login | launchd agent `com.marathon.backup` |

The launchd plists are **generated, not committed**: `deploy/install.sh` writes
them with this machine's absolute paths (launchd can't expand variables) and
loads them. Re-run it any time — after moving the repo, changing agent
settings, or on a new machine.

Reachable on the network at **http://\<your-mac\>.local** (or the Mac's LAN IP).
The app auto-starts at login and restarts if it crashes; Apache is started via
`start_httpd.sh` (and optionally on boot — see below).

The database is a single SQLite file: `backend/marathon_training.db`. It is **not**
in git — it's the live data and is backed up to iCloud instead.

## Scripts (run from the repo root)

| Script | Purpose | sudo |
|--------|---------|------|
| `./deploy/install.sh` | Generate + load the launchd agents for this machine | no |
| `./startup.sh` | Bring up the app (launchd) + Apache proxy | yes (Apache) |
| `./shutdown.sh` | Stop the app + Apache proxy | yes (Apache) |
| `./start_httpd.sh` | Start/restart just the Apache proxy | yes |
| `./serve.sh` | Dev/manual: rebuild frontend + run app in foreground | no |
| `./deploy/backup_db.sh` | Snapshot the DB to iCloud now (also runs daily) | no |
| `./deploy/restore_db.sh` | Restore the DB from a snapshot | no |
| `./status.sh` | Health check: app, proxy, API, launchd agents, last backup age | no |

After changing the **frontend**, rebuild so the served files update:
`cd frontend && npm run build` (or run `./serve.sh` once).

## Checking health (after sleep, reboot, or a missed backup)

```bash
./status.sh
```

Sleep/wake keeps everything running. After a full **reboot**, the app returns at
login automatically; **Apache** only returns on boot if you ran the one-time enable
(see "First-time" below) — otherwise run `./start_httpd.sh`. The status check shows
the last backup's age, so you can confirm the daily backup is current even if the
noon run was missed while the Mac was closed (it then runs on next wake/login).

## Backups

- **Where:** `~/Library/Mobile Documents/com~apple~CloudDocs/data/marathon_training-<timestamp>.db`
  (the local iCloud Drive folder, so snapshots sync off the machine)
- **When:** automatically daily at noon (and once at login); the newest 5 are kept.
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
launchctl unload ~/Library/LaunchAgents/com.marathon.app.plist
cp "~/Library/Mobile Documents/com~apple~CloudDocs/data/<snapshot>.db" \
   backend/marathon_training.db
rm -f backend/marathon_training.db-wal backend/marathon_training.db-shm
launchctl load -w ~/Library/LaunchAgents/com.marathon.app.plist
```

> **iCloud note:** iCloud may offload old snapshots to save space, showing them as
> not-yet-downloaded placeholders. If a restore reports the file as missing, open
> it once in Finder to pull it down, then retry. The data itself is safe in the cloud.

## First-time / after a macOS reset

Everything installs from this `deploy/` folder:

```bash
# App + backup launchd agents (generated with this machine's paths)
./deploy/install.sh

# Reverse proxy (auto-loaded by macOS's httpd.conf)
sudo cp deploy/marathon.apache.conf /etc/apache2/other/marathon.conf
sudo apachectl configtest && sudo apachectl restart
```

To make **Apache** come up on every boot (one-time):

```bash
sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist
```
