from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogService
from app.database import get_db

router = APIRouter(
    prefix="/catalog/services",
    tags=["Catalog Services"]
)

class CatalogServiceIn(BaseModel):
    id_service_status: int
    id_service_classification: int
    service_code: str
    service_name: str
    service_description: str = ""
    service_aircraft_type: bool = False
    service_by_time: bool = False
    min_time_configured: bool = False
    service_technicians_included: bool = False
    whonew: str = "system"

@router.get("/")
def get_services(search: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(CatalogService)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            CatalogService.service_code.ilike(search_pattern) |
            CatalogService.service_name.ilike(search_pattern) |
            CatalogService.service_description.ilike(search_pattern)
        )
    return query.all()

@router.post("/")
def create_service(service: CatalogServiceIn, db: Session = Depends(get_db)):
    new_service = CatalogService(**service.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.get("/{id_service}")
def get_service(id_service: int, db: Session = Depends(get_db)):
    service = db.query(CatalogService).filter(CatalogService.id_service == id_service).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service

@router.put("/{id_service}")
def update_service(id_service: int, updated_service: CatalogServiceIn, db: Session = Depends(get_db)):
    service = db.query(CatalogService).filter(CatalogService.id_service == id_service).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for key, value in updated_service.dict().items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{id_service}")
def delete_service(id_service: int, db: Session = Depends(get_db)):
    service = db.query(CatalogService).filter(CatalogService.id_service == id_service).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    db.delete(service)
    db.commit()
    return {"message": "Servicio eliminado correctamente"}