from datetime import datetime
from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    message: str
    page: str | None = None


class FeedbackResponse(BaseModel):
    id: int
    message: str
    page: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
