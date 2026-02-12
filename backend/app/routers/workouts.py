from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.week import Week
from app.models.workout import Workout
from app.models.template import WorkoutTemplate
from app.schemas.workout import (
    WorkoutCreate,
    WorkoutUpdate,
    WorkoutResponse,
    WorkoutFromTemplate,
    WorkoutSwap,
)

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def _monday_of(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _get_or_create_week(db: Session, workout_date: date) -> Week:
    week_start = _monday_of(workout_date)
    week = db.query(Week).filter(Week.week_start == week_start).first()
    if not week:
        week = Week(week_start=week_start)
        db.add(week)
        db.flush()
    return week


@router.get("", response_model=list[WorkoutResponse])
def list_workouts(week_start: date, db: Session = Depends(get_db)):
    week_start = _monday_of(week_start)
    week = db.query(Week).filter(Week.week_start == week_start).first()
    if not week:
        return []
    return week.workouts


@router.post("", response_model=WorkoutResponse, status_code=201)
def create_workout(data: WorkoutCreate, db: Session = Depends(get_db)):
    existing = db.query(Workout).filter(Workout.date == data.date).first()
    if existing:
        raise HTTPException(400, "A workout already exists on this date")

    week = _get_or_create_week(db, data.date)
    workout = Workout(week_id=week.id, **data.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(workout_id: int, data: WorkoutUpdate, db: Session = Depends(get_db)):
    workout = db.get(Workout, workout_id)
    if not workout:
        raise HTTPException(404, "Workout not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(workout, key, value)

    db.commit()
    db.refresh(workout)
    return workout


@router.delete("/{workout_id}", status_code=204)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.get(Workout, workout_id)
    if not workout:
        raise HTTPException(404, "Workout not found")
    db.delete(workout)
    db.commit()


@router.post("/from-template", response_model=WorkoutResponse, status_code=201)
def create_from_template(data: WorkoutFromTemplate, db: Session = Depends(get_db)):
    template = db.get(WorkoutTemplate, data.template_id)
    if not template:
        raise HTTPException(404, "Template not found")

    existing = db.query(Workout).filter(Workout.date == data.date).first()
    if existing:
        raise HTTPException(400, "A workout already exists on this date")

    week = _get_or_create_week(db, data.date)
    workout = Workout(
        week_id=week.id,
        date=data.date,
        workout_type=template.workout_type,
        distance=template.distance,
        pace_seconds=template.pace_seconds,
        interval_pace_seconds=template.interval_pace_seconds,
        duration_minutes=template.duration_minutes,
        description=template.description,
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.post("/swap", response_model=list[WorkoutResponse])
def swap_workouts(data: WorkoutSwap, db: Session = Depends(get_db)):
    w1 = db.get(Workout, data.workout_id_1)
    w2 = db.get(Workout, data.workout_id_2)
    if not w1 or not w2:
        raise HTTPException(404, "Workout not found")

    # Use raw SQL to swap dates atomically, avoiding UNIQUE constraint issues
    date1, date2 = w1.date, w2.date
    week_id1, week_id2 = w1.week_id, w2.week_id
    db.execute(
        text("UPDATE workouts SET date = :temp_date, week_id = :week_id WHERE id = :id"),
        {"temp_date": "1900-01-01", "week_id": week_id2, "id": w1.id},
    )
    db.execute(
        text("UPDATE workouts SET date = :date, week_id = :week_id WHERE id = :id"),
        {"date": str(date1), "week_id": week_id1, "id": w2.id},
    )
    db.execute(
        text("UPDATE workouts SET date = :date WHERE id = :id"),
        {"date": str(date2), "id": w1.id},
    )
    db.commit()
    db.refresh(w1)
    db.refresh(w2)
    return [w1, w2]
