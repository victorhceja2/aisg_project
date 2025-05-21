from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models  # asegúrate de que el modelo DBTableCliente esté definido en models.py

router = APIRouter(prefix="/clients")

@router.get("/")
def get_clients(db: Session = Depends(get_db)):
    return db.query(models.DBTableCliente).all()