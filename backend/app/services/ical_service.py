from datetime import timedelta
from icalendar import Calendar, Event
from sqlalchemy.orm import Session

from app.models.workout import Workout
from app.config import RACE_NAME


def _format_pace(seconds: int) -> str:
    return f"{seconds // 60}:{seconds % 60:02d}/mi"


def _workout_summary(w: Workout) -> str:
    parts = [w.workout_type.replace("_", " ").title()]
    if w.distance:
        parts.append(f"{w.distance} mi")
    if w.pace_seconds:
        parts.append(_format_pace(w.pace_seconds))
    if w.duration_minutes:
        parts.append(f"{w.duration_minutes} min")
    return " — ".join(parts)


def generate_ical(db: Session) -> bytes:
    cal = Calendar()
    cal.add("prodid", f"-//{RACE_NAME} Training//EN")
    cal.add("version", "2.0")
    cal.add("x-wr-calname", f"{RACE_NAME} Training")

    workouts = db.query(Workout).order_by(Workout.date).all()
    for w in workouts:
        event = Event()
        event.add("summary", _workout_summary(w))
        event.add("dtstart", w.date)
        event.add("dtend", w.date + timedelta(days=1))
        if w.description:
            event.add("description", w.description)
        event.add("uid", f"workout-{w.id}@marathon-training")
        cal.add_component(event)

    return cal.to_ical()
