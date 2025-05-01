from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import ExtraServiceSaleAssignment
from app.database import get_db

router = APIRouter(prefix="/catalog/extra-service-sale-assignment", tags=["ExtraServiceSaleAssignment"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(ExtraServiceSaleAssignment).all()

@router.post("/")
def create(item: dict, db: Session = Depends(get_db)):
    obj = ExtraServiceSaleAssignment(**item)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
