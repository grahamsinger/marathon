from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.week import Week
from app.schemas.week import WeekResponse, WeekUpdate

router = APIRouter(prefix="/api/weeks", tags=["weeks"])


def _monday_of(d: date) -> date:
    return d - timedelta(days=d.weekday())


@router.get("/{week_start}", response_model=WeekResponse)
def get_or_create_week(week_start: date, db: Session = Depends(get_db)):
    week_start = _monday_of(week_start)
    week = db.query(Week).filter(Week.week_start == week_start).first()
    if not week:
        week = Week(week_start=week_start)
        db.add(week)
        db.commit()
        db.refresh(week)
    return week


@router.put("/{week_start}", response_model=WeekResponse)
def update_week(week_start: date, data: WeekUpdate, db: Session = Depends(get_db)):
    week_start = _monday_of(week_start)
    week = db.query(Week).filter(Week.week_start == week_start).first()
    if not week:
        week = Week(week_start=week_start)
        db.add(week)
        db.flush()

    if data.mileage_target is not None:
        week.mileage_target = data.mileage_target
    if data.notes is not None:
        week.notes = data.notes

    db.commit()
    db.refresh(week)
    return week
