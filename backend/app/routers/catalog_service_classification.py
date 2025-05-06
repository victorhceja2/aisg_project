from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceClassification
from app.database import get_db

router = APIRouter(
    prefix="/catalog/service-classification",
    tags=["CatalogServiceClassification"]
)

class ClassificationIn(BaseModel):
    service_classification_name: str
    whonew: str = "system"

@router.get("/")
def get_classifications(search: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(CatalogServiceClassification)
    if search:
        query = query.filter(CatalogServiceClassification.service_classification_name.ilike(f"%{search}%"))
    return query.all()

@router.post("/")
def create_classification(item: ClassificationIn, db: Session = Depends(get_db)):
    obj = CatalogServiceClassification(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
