from sqlalchemy import Column, Integer, Float, Date, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True)
    week_id = Column(Integer, ForeignKey("weeks.id"), nullable=False)
    date = Column(Date, unique=True, nullable=False, index=True)
    workout_type = Column(String(50), nullable=False)
    distance = Column(Float, nullable=True)
    pace_seconds = Column(Integer, nullable=True)
    interval_pace_seconds = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, nullable=False, default=False)

    week = relationship("Week", back_populates="workouts")
