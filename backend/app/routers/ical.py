from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.ical_service import generate_ical

router = APIRouter(prefix="/api/ical", tags=["ical"])


@router.get("/feed")
def ical_feed(db: Session = Depends(get_db)):
    cal_bytes = generate_ical(db)
    return Response(content=cal_bytes, media_type="text/calendar")
