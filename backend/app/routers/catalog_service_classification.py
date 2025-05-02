# backend/app/routers/catalog_service_classification.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceClassification
from app.database import get_db

router = APIRouter(
    prefix="/catalog/service-classification",
    tags=["CatalogServiceClassification"]
)

class ClassificationIn(BaseModel):
    name: str
    status: str

@router.get("/")
def get_classifications(db: Session = Depends(get_db)):
    return db.query(CatalogServiceClassification).all()

@router.post("/")
def create_classification(item: ClassificationIn, db: Session = Depends(get_db)):
    obj = CatalogServiceClassification(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
