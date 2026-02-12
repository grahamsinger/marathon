from pydantic import BaseModel


class TemplateCreate(BaseModel):
    name: str
    workout_type: str
    distance: float | None = None
    pace_seconds: int | None = None
    interval_pace_seconds: int | None = None
    duration_minutes: int | None = None
    description: str | None = None


class TemplateUpdate(BaseModel):
    name: str | None = None
    workout_type: str | None = None
    distance: float | None = None
    pace_seconds: int | None = None
    interval_pace_seconds: int | None = None
    duration_minutes: int | None = None
    description: str | None = None


class TemplateResponse(BaseModel):
    id: int
    name: str
    workout_type: str
    distance: float | None
    pace_seconds: int | None
    interval_pace_seconds: int | None
    duration_minutes: int | None
    description: str | None

    model_config = {"from_attributes": True}
