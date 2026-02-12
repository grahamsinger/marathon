from datetime import date
from pydantic import BaseModel


class WorkoutCreate(BaseModel):
    date: date
    workout_type: str
    distance: float | None = None
    pace_seconds: int | None = None
    interval_pace_seconds: int | None = None
    duration_minutes: int | None = None
    description: str | None = None


class WorkoutUpdate(BaseModel):
    workout_type: str | None = None
    distance: float | None = None
    pace_seconds: int | None = None
    interval_pace_seconds: int | None = None
    duration_minutes: int | None = None
    description: str | None = None


class WorkoutResponse(BaseModel):
    id: int
    week_id: int
    date: date
    workout_type: str
    distance: float | None
    pace_seconds: int | None
    interval_pace_seconds: int | None
    duration_minutes: int | None
    description: str | None

    model_config = {"from_attributes": True}


class WorkoutFromTemplate(BaseModel):
    template_id: int
    date: date


class WorkoutSwap(BaseModel):
    workout_id_1: int
    workout_id_2: int
