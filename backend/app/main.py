from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import weeks, workouts, templates, stats, ical, race_info, feedback

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marathon Training")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weeks.router)
app.include_router(workouts.router)
app.include_router(templates.router)
app.include_router(stats.router)
app.include_router(ical.router)
app.include_router(race_info.router)
app.include_router(feedback.router)

# Serve the built frontend (frontend/dist) so the whole app runs from this one
# server on a single origin. API routers are registered above and take priority;
# everything else falls through to the SPA handler below.
DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if DIST.exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        candidate = DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST / "index.html")
