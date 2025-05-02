# backend/app/routers/catalog_services.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogService
from app.database import get_db

router = APIRouter(
    prefix="/catalog/services",
    tags=["Catalog Services"]
)

class CatalogServiceIn(BaseModel):
    name: str
    description: str
    status: str

@router.get("/")
def get_services(db: Session = Depends(get_db)):
    return db.query(CatalogService).all()

@router.post("/")
def create_service(service: CatalogServiceIn, db: Session = Depends(get_db)):
    new_service = CatalogService(**service.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service
