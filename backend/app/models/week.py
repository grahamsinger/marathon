from sqlalchemy import Column, Integer, Float, Date, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Week(Base):
    __tablename__ = "weeks"

    id = Column(Integer, primary_key=True)
    week_start = Column(Date, unique=True, nullable=False, index=True)
    mileage_target = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    workouts = relationship("Workout", back_populates="week", cascade="all, delete-orphan")
