from fastapi import APIRouter, Depends
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
def get_all(db: Session = Depends(get_db)):
    return db.query(ExtraCompanyConfiguration).all()

@router.post("/")
def create_item(data: ConfigIn, db: Session = Depends(get_db)):
    obj = ExtraCompanyConfiguration(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
