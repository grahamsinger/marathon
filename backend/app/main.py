from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import weeks, workouts, templates, stats, ical, race_info

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
