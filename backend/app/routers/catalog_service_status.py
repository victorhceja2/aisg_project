from fastapi import APIRouter, Depends, Query
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
def get_statuses(search: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(CatalogServiceStatus)
    if search:
        query = query.filter(CatalogServiceStatus.status_name.ilike(f"%{search}%"))
    return query.all()

@router.post("/")
def create_status(item: StatusIn, db: Session = Depends(get_db)):
    obj = CatalogServiceStatus(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj