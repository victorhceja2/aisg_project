from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import CatalogServiceClassification
from app.database import get_db

router = APIRouter(prefix="/catalog/service-classification", tags=["CatalogServiceClassification"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(CatalogServiceClassification).all()

@router.post("/")
def create(item: dict, db: Session = Depends(get_db)):
    obj = CatalogServiceClassification(**item)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
