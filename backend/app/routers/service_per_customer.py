# backend/app/routers/service_per_customer.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ServicePerCustomer
from app.database import get_db

router = APIRouter(
    prefix="/catalog/service-per-customer",
    tags=["ServicePerCustomer"]
)

class ServiceCustomerIn(BaseModel):
    id_service: int
    id_client: int
    id_company: int
    minutes_included: int
    minutes_minimum: int
    fuselage_type: str
    technicians_included: int

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(ServicePerCustomer).all()

@router.post("/")
def create_item(data: ServiceCustomerIn, db: Session = Depends(get_db)):
    obj = ServicePerCustomer(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
