from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import date
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workout import Workout

router = APIRouter(prefix="/api/stats", tags=["stats"])


class PaceDataPoint(BaseModel):
    date: date
    pace_seconds: int
    distance: float


@router.get("/pace-trend", response_model=list[PaceDataPoint])
def pace_trend(db: Session = Depends(get_db)):
    workouts = (
        db.query(Workout)
        .filter(
            Workout.workout_type == "long_run",
            Workout.pace_seconds.is_not(None),
        )
        .order_by(Workout.date)
        .all()
    )
    return [
        PaceDataPoint(date=w.date, pace_seconds=w.pace_seconds, distance=w.distance or 0)
        for w in workouts
    ]
