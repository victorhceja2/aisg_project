# backend/app/routers/extra_service_sale_assignment.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ExtraServiceSaleAssignment
from app.database import get_db

router = APIRouter(
    prefix="/catalog/extra-service-sale-assignment",
    tags=["ExtraServiceSaleAssignment"]
)

class SaleAssignIn(BaseModel):
    sale_id: int
    service_id: int

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(ExtraServiceSaleAssignment).all()

@router.post("/")
def create_item(data: SaleAssignIn, db: Session = Depends(get_db)):
    obj = ExtraServiceSaleAssignment(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
