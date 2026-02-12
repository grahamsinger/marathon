from sqlalchemy import Column, DateTime, Integer, String, Text, func

from app.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    page = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
