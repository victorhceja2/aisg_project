from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import ExtraCompanyConfiguration
from app.database import get_db

router = APIRouter(prefix="/catalog/extra-company-configuration", tags=["ExtraCompanyConfiguration"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(ExtraCompanyConfiguration).all()

@router.post("/")
def create(item: dict, db: Session = Depends(get_db)):
    obj = ExtraCompanyConfiguration(**item)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
