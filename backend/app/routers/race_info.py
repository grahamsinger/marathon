from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel

from app.config import RACE_DATE, RACE_NAME, GOAL_TIME_SECONDS, GOAL_PACE_SECONDS

router = APIRouter(prefix="/api/race-info", tags=["race-info"])


class RaceInfo(BaseModel):
    race_name: str
    race_date: date
    days_until_race: int
    goal_time_seconds: int
    goal_pace_seconds: int


@router.get("", response_model=RaceInfo)
def get_race_info():
    days_until = (RACE_DATE - date.today()).days
    return RaceInfo(
        race_name=RACE_NAME,
        race_date=RACE_DATE,
        days_until_race=max(days_until, 0),
        goal_time_seconds=GOAL_TIME_SECONDS,
        goal_pace_seconds=GOAL_PACE_SECONDS,
    )
