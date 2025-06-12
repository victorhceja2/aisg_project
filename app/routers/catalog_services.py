from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogService
from app.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/catalog/services",
    tags=["Catalog Services"]
)

class CatalogServiceIn(BaseModel):
    id_service_status: int
    id_service_classification: int
    id_service_category: int
    id_service_type: int
    id_service_include: int
    service_code: str
    service_name: str
    service_description: str = ""
    service_aircraft_type: int = 1
    service_by_time: int = 1
    min_time_configured: int = 1
    service_technicians_included: int = 1
    whonew: str = "system"

@router.get("/")
def get_services(search: str = Query(None), db: Session = Depends(get_db)):
    try:
        query = db.query(CatalogService)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                CatalogService.service_code.ilike(search_pattern) |
                CatalogService.service_name.ilike(search_pattern) |
                CatalogService.service_description.ilike(search_pattern)
            )
        return query.all()
    except Exception as e:
        logger.error(f"Error al obtener servicios: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener servicios: {str(e)}")

@router.post("/")
def create_service(service: CatalogServiceIn, db: Session = Depends(get_db)):
    try:
        new_service = CatalogService(**service.dict())
        db.add(new_service)
        db.commit()
        db.refresh(new_service)
        return new_service
    except Exception as e:
        logger.error(f"Error al crear servicio: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear servicio: {str(e)}")

@router.get("/{id_service}")
def get_service(id_service: int, db: Session = Depends(get_db)):
    service = db.query(CatalogService).filter(CatalogService.id_service == id_service).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service

@router.put("/{id_service}")
def update_service(id_service: int, updated_service: CatalogServiceIn, db: Session = Depends(get_db)):
    try:
        service = db.query(CatalogService).filter(CatalogService.id_service == id_service).first()
        if not service:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
        for key, value in updated_service.dict().items():
            setattr(service, key, value)
            
        db.commit()
        db.refresh(service)
        return service
    except Exception as e:
        logger.error(f"Error al actualizar servicio: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar servicio: {str(e)}")

@router.delete("/{id_service}")
def delete_service(id_service: int, db: Session = Depends(get_db)):
    try:
        service = db.query(CatalogService).filter(CatalogService.id_service == id_service).first()
        if not service:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        db.delete(service)
        db.commit()
        return {"message": "Servicio eliminado correctamente"}
    except Exception as e:
        logger.error(f"Error al eliminar servicio: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar servicio: {str(e)}")