from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class ServiceResponse(BaseModel):
    id_service: int
    service_code: str
    service_name: str
    service_description: Optional[str] = None
    id_service_status: int
    id_service_clasification: int  # Una sola "s" para mantener consistencia con el modelo
    id_service_category: int
    id_service_type: int
    id_service_include: int
    service_aircraft_type: int
    service_by_time: int
    min_time_configured: int
    service_technicians_included: int
    whonew: Optional[str] = None

@router.get("/catalog-services/full", response_model=List[ServiceResponse], tags=["catalog"])
def get_catalog_services_full(db: Session = Depends(get_db)):
    """
    Obtiene la lista completa de servicios del catálogo
    """
    try:
        services = db.query(models.CatalogService).all()
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener servicios: {str(e)}")

@router.get("/catalog-services/full/{service_id}", response_model=ServiceResponse, tags=["catalog"])
def get_service_by_id(service_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un servicio específico por su ID
    """
    service = db.query(models.CatalogService).filter(models.CatalogService.id_service == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service