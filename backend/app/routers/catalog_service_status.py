# backend/app/routers/catalog_service_status.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceStatus
from app.database import get_db

router = APIRouter(
    prefix="/catalog/service-status",
    tags=["CatalogServiceStatus"]
)

class StatusIn(BaseModel):
    status_name: str

@router.get("/")
def get_statuses(db: Session = Depends(get_db)):
    return db.query(CatalogServiceStatus).all()

@router.post("/")
def create_status(item: StatusIn, db: Session = Depends(get_db)):
    obj = CatalogServiceStatus(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj