
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

@router.get("/{client_id}")
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Cliente).filter(Cliente.id_cliente == client_id).first()
    if not client:
        return {"error": "Client not found"}
    return client
