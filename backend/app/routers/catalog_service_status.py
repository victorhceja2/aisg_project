from fastapi import APIRouter, Depends, Query, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceStatus
from app.database import get_db
from typing import Optional
import logging

# Este código define un APIRouter para la gestión de estados de servicio,
# permitiendo crear, leer y buscar estados, con soporte para obtener el usuario
# desde un header o el payload.

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/catalog/service-status",
    tags=["CatalogServiceStatus"]
)

class StatusIn(BaseModel):
    status_name: str
    whonew: Optional[str] = None

@router.get("/")
def get_statuses(search: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(CatalogServiceStatus)
    if search:
        query = query.filter(CatalogServiceStatus.status_name.ilike(f"%{search}%"))
    return query.all()

@router.post("/")
def create_status(
    item: StatusIn, 
    db: Session = Depends(get_db),
    x_username: Optional[str] = Header(None)
):
    usuario = x_username or item.whonew or "system"
    data = item.dict()
    data["whonew"] = usuario
    obj = CatalogServiceStatus(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj