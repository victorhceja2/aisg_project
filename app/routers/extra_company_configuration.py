from fastapi import APIRouter, Depends, Query, HTTPException
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

@router.get("/{id}")
def get_item(id: int, db: Session = Depends(get_db)):
    item = db.query(ExtraCompanyConfiguration).filter(ExtraCompanyConfiguration.id_xtra_company == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return item

@router.put("/{id}")
def update_item(id: int, data: ConfigIn, db: Session = Depends(get_db)):
    item = db.query(ExtraCompanyConfiguration).filter(ExtraCompanyConfiguration.id_xtra_company == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    
    # Actualiza los campos
    item.id_company = data.id_company
    item.applies_detail = data.applies_detail
    item.status = data.status
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    item = db.query(ExtraCompanyConfiguration).filter(ExtraCompanyConfiguration.id_xtra_company == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    
    db.delete(item)
    db.commit()
    return {"detail": "Configuración eliminada correctamente"}