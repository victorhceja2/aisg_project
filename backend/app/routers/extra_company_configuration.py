from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ExtraCompanyConfiguration
from app.database import get_db

router = APIRouter(
    prefix="/catalog/extra-company-configuration",
    tags=["ExtraCompanyConfiguration"]
)

class ConfigIn(BaseModel):
    id_company: int
    applies_detail: bool
    status: bool

@router.get("/")
def get_all(id_company: int = Query(None), db: Session = Depends(get_db)):
    query = db.query(ExtraCompanyConfiguration)
    if id_company is not None:
        query = query.filter(ExtraCompanyConfiguration.id_company == id_company)
    return query.all()

@router.post("/")
def create_item(data: ConfigIn, db: Session = Depends(get_db)):
    obj = ExtraCompanyConfiguration(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
