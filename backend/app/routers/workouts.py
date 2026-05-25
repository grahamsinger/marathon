from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
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
    ApplyDay,
    RecentDay,
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


@router.get("/all", response_model=list[WorkoutResponse])
def list_all_workouts(db: Session = Depends(get_db)):
    return db.query(Workout).order_by(Workout.date.desc()).all()


@router.get("/recent-days", response_model=list[RecentDay])
def recent_days(limit: int = 5, db: Session = Depends(get_db)):
    """Recent distinct days that have workouts, most recent first.

    De-duplicated by the day's "shape" (its set of workout types) so the list
    surfaces distinct day setups to reuse, not the same combo repeated.
    """
    dates = [
        d[0]
        for d in db.query(Workout.date).distinct().order_by(Workout.date.desc()).all()
    ]
    result: list[dict] = []
    seen_shapes: set[tuple[str, ...]] = set()
    for d in dates:
        workouts = (
            db.query(Workout).filter(Workout.date == d).order_by(Workout.id).all()
        )
        shape = tuple(sorted(w.workout_type for w in workouts))
        if shape in seen_shapes:
            continue
        seen_shapes.add(shape)
        result.append({"date": d, "workouts": workouts})
        if len(result) >= limit:
            break
    return result


@router.get("", response_model=list[WorkoutResponse])
def list_workouts(week_start: date, db: Session = Depends(get_db)):
    week_start = _monday_of(week_start)
    week = db.query(Week).filter(Week.week_start == week_start).first()
    if not week:
        return []
    return week.workouts


@router.post("", response_model=WorkoutResponse, status_code=201)
def create_workout(data: WorkoutCreate, db: Session = Depends(get_db)):
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


@router.post("/apply-day", response_model=list[WorkoutResponse], status_code=201)
def apply_day(data: ApplyDay, db: Session = Depends(get_db)):
    """Copy all workouts from one day onto another (additive).

    Copies the plan (type, distance, target pace, etc.) but resets actual pace
    and completion, since the target day is being planned, not logged.
    """
    source = (
        db.query(Workout)
        .filter(Workout.date == data.source_date)
        .order_by(Workout.id)
        .all()
    )
    if not source:
        raise HTTPException(404, "No workouts on the source date")

    week = _get_or_create_week(db, data.target_date)
    created = []
    for w in source:
        new_workout = Workout(
            week_id=week.id,
            date=data.target_date,
            workout_type=w.workout_type,
            distance=w.distance,
            pace_seconds=w.pace_seconds,
            actual_pace_seconds=None,
            interval_pace_seconds=w.interval_pace_seconds,
            duration_minutes=w.duration_minutes,
            description=w.description,
            is_completed=False,
        )
        db.add(new_workout)
        created.append(new_workout)
    db.commit()
    for w in created:
        db.refresh(w)
    return created


@router.post("/swap", response_model=list[WorkoutResponse])
def swap_workouts(data: WorkoutSwap, db: Session = Depends(get_db)):
    w1 = db.get(Workout, data.workout_id_1)
    w2 = db.get(Workout, data.workout_id_2)
    if not w1 or not w2:
        raise HTTPException(404, "Workout not found")

    # No UNIQUE constraint on date anymore, so swap dates/weeks directly.
    w1.date, w2.date = w2.date, w1.date
    w1.week_id, w2.week_id = w2.week_id, w1.week_id
    db.commit()
    db.refresh(w1)
    db.refresh(w2)
    return [w1, w2]
