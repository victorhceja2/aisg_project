
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Cliente

router = APIRouter(
    prefix="/catalog/clients",
    tags=["Clients"]
)

@router.get("/")
def get_clients(db: Session = Depends(get_db)):
    return db.query(Cliente).all()
