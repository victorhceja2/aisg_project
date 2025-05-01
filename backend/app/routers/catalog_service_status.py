from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import CatalogServiceStatus
from app.database import get_db

router = APIRouter(prefix="/catalog/service-status", tags=["CatalogServiceStatus"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(CatalogServiceStatus).all()

@router.post("/")
def create(item: dict, db: Session = Depends(get_db)):
    obj = CatalogServiceStatus(**item)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
