from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ExtraServiceSaleAssignment
from app.database import get_db

router = APIRouter(
    prefix="/catalog/extra-service-sale-assignment",
    tags=["ExtraServiceSaleAssignment"]
)

class SaleAssignIn(BaseModel):
    id_service_per_customer: int
    id_sale_flight: int
    id_sale_employee: int
    work_order: str
    status: bool = True
    sale_employee_deleted: bool = False

@router.get("/")
def get_all(work_order: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(ExtraServiceSaleAssignment)
    if work_order:
        query = query.filter(ExtraServiceSaleAssignment.work_order.ilike(f"%{work_order}%"))
    return query.all()

@router.post("/")
def create_item(data: SaleAssignIn, db: Session = Depends(get_db)):
    obj = ExtraServiceSaleAssignment(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
