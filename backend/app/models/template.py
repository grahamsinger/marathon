from sqlalchemy import Column, Integer, Float, String, Text

from app.database import Base


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    workout_type = Column(String(50), nullable=False)
    distance = Column(Float, nullable=True)
    pace_seconds = Column(Integer, nullable=True)
    interval_pace_seconds = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
