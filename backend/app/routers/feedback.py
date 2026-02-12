from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse, status_code=201)
def create_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    feedback = Feedback(**data.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("", response_model=list[FeedbackResponse])
def list_feedback(db: Session = Depends(get_db)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


@router.delete("/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = db.get(Feedback, feedback_id)
    if not feedback:
        raise HTTPException(404, "Feedback not found")
    db.delete(feedback)
    db.commit()
