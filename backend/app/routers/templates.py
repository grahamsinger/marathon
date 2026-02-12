from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.template import WorkoutTemplate
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateResponse])
def list_templates(db: Session = Depends(get_db)):
    return db.query(WorkoutTemplate).order_by(WorkoutTemplate.name).all()


@router.post("", response_model=TemplateResponse, status_code=201)
def create_template(data: TemplateCreate, db: Session = Depends(get_db)):
    template = WorkoutTemplate(**data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(template_id: int, data: TemplateUpdate, db: Session = Depends(get_db)):
    template = db.get(WorkoutTemplate, template_id)
    if not template:
        raise HTTPException(404, "Template not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.get(WorkoutTemplate, template_id)
    if not template:
        raise HTTPException(404, "Template not found")
    db.delete(template)
    db.commit()
