from datetime import date
from pydantic import BaseModel

from app.schemas.workout import WorkoutResponse


class WeekUpdate(BaseModel):
    mileage_target: float | None = None
    notes: str | None = None


class WeekResponse(BaseModel):
    id: int
    week_start: date
    mileage_target: float | None
    notes: str | None
    workouts: list[WorkoutResponse]

    model_config = {"from_attributes": True}
