from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client
from app.schemas_clients import ClientResponse

router = APIRouter(
    prefix="/catalog/clients",
    tags=["Clients"]
)

@router.get("/", response_model=list[ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()