# Marathon Training

A personal marathon-training planner built for one runner training for the
**Chicago Marathon 2026**. It plans future workouts week by week — the thing
Strava and friends don't do — and keeps only marathon-specific data, with no
noise from dog walks or cross-app clutter.

It runs on a Mac on the home network (and remotely via Tailscale), used
day-to-day from an iPhone.

## Features

- **Week view** — a Monday-start calendar of the current week with compact
  previous/next-week rows. Add, edit, complete, delete, or swap workouts;
  set a weekly mileage target and week notes.
- **Workout types** — long run, medium long run, speed work, easy run,
  cross-train, rest, strength — each with the fields that make sense for it
  (distance, target/actual/interval pace, duration, notes).
- **Templates** — save any workout as a reusable template, apply templates to
  a day, or copy a recent day's whole workout combo.
- **Summary** — every week as a collapsible section (newest two expanded) with
  completed-mileage-vs-target bars and per-workout rows.
- **Pace trend** — chart of long-run target vs. actual pace over time.
- **iCal feed** — a subscription URL (copy it from the header) that puts the
  whole plan in Apple/Google Calendar.
- **Feedback** — a built-in "report a problem" modal; entries land in the
  database for review.

## How it's built

```
frontend/   React 19 + TypeScript + Vite + Tailwind, React Query for data,
            React Router for the four pages, Recharts for the pace chart
backend/    FastAPI + SQLAlchemy on SQLite (backend/marathon_training.db)
deploy/     launchd agents, Apache reverse-proxy config, backup/restore
            scripts, and the operations README
```

In production a single FastAPI process serves both the API (under `/api/*`)
and the built frontend (`frontend/dist`) on port 8000, fronted by Apache on
port 80. Race facts (name, date, goal time) are constants in
`backend/app/config.py`.

> **The database is live data.** `backend/marathon_training.db` is not in git;
> it holds real training history and is snapshotted daily to iCloud (newest 5
> kept). Schema changes must be additive (`ALTER TABLE`) — never rebuild the
> file. See [deploy/README.md](deploy/README.md) for backup/restore.

## Development

Backend uses [uv](https://docs.astral.sh/uv/); frontend uses npm.

```bash
./run.sh          # dev mode: uvicorn --reload on :8000 + Vite dev server on :5173
```

Or run the pieces yourself:

```bash
cd backend && uv run uvicorn app.main:app --reload   # API on :8000
cd frontend && npm install && npm run dev            # UI on :5173 (proxies /api)
```

### Tests & coverage

```bash
cd backend && uv run pytest --cov=app --cov-report=term-missing
cd frontend && npm test              # or: npm run coverage (writes coverage/index.html)
```

Backend tests hit the real FastAPI app against an in-memory SQLite database.
Frontend has unit tests for the date/pace utilities plus jsdom integration
tests for the workout form and summary views.

## Deployment & operations

The app runs as a launchd agent that auto-starts at login and restarts on
crash. Day-to-day:

```bash
./status.sh       # health check: app, proxy, API, launchd agents, last backup
./startup.sh      # bring up the app + Apache proxy
./shutdown.sh     # stop both (backups stay scheduled)
./serve.sh        # manual/foreground alternative: rebuild frontend + run app
```

After changing the frontend, rebuild so the served files update:
`cd frontend && npm run build` — the server picks up `dist/` immediately, no
restart needed.

Full operations detail — first-time install, backups, restore, Apache — is in
[deploy/README.md](deploy/README.md). Remote (off-Wi-Fi) access is documented
in [deploy/TAILSCALE.md](deploy/TAILSCALE.md).

## Project history

The original design Q&A that shaped the app is in [questions.md](questions.md).
