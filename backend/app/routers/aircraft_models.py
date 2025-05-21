from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/aircraft-models")

@router.get("/")
def get_aircraft_models(db: Session = Depends(get_db)):
    return db.query(models.DBTableAvion).all()