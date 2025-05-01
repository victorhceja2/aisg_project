from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import ServicePerCustomer
from app.database import get_db

router = APIRouter(prefix="/catalog/service-per-customer", tags=["ServicePerCustomer"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(ServicePerCustomer).all()

@router.post("/")
def create(item: dict, db: Session = Depends(get_db)):
    obj = ServicePerCustomer(**item)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
