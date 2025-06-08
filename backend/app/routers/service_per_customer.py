from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ServicePerCustomer
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/catalog/service-per-customer", tags=["ServicePerCustomer"])

class ServiceCustomerIn(BaseModel):
    id_service: int
    id_client: int
    id_company: int
    minutes_included: int
    minutes_minimum: int
    fuselage_type: str
    technicians_included: int
    whonew: Optional[str] = "system"

@router.get("/")
def get_all(fuselage_type: str = None, db: Session = Depends(get_db)):
    try:
        query = db.query(ServicePerCustomer)
        if fuselage_type:
            query = query.filter(ServicePerCustomer.fuselage_type.ilike(f"%{fuselage_type}%"))
        return query.all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener registros: {str(e)}")

@router.post("/")
def create_item(data: ServiceCustomerIn, db: Session = Depends(get_db)):
    try:
        # Crear el objeto ServicePerCustomer - SQLAlchemy se encargará de los timestamps automáticamente
        obj = ServicePerCustomer(
            id_service=data.id_service,
            id_client=data.id_client,
            id_company=data.id_company,
            minutes_included=data.minutes_included,
            minutes_minimum=data.minutes_minimum,
            fuselage_type=data.fuselage_type,
            technicians_included=data.technicians_included,
            whonew=data.whonew or "system"
            # NO especificar create_at ni updated_at - SQLAlchemy los maneja automáticamente
        )
        
        db.add(obj)
        db.commit()
        db.refresh(obj)
        
        # Log para debugging
        print(f"Registro creado con ID: {obj.id_service_per_customer}")
        print(f"create_at: {obj.create_at}")
        print(f"updated_at: {obj.updated_at}")
        
        return obj
    except Exception as e:
        db.rollback()
        print(f"Error al crear registro: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear registro: {str(e)}")

@router.get("/{id}")
def get_item(id: int, db: Session = Depends(get_db)):
    try:
        item = db.query(ServicePerCustomer).filter(ServicePerCustomer.id_service_per_customer == id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener registro: {str(e)}")

@router.put("/{id}")
def update_item(id: int, data: ServiceCustomerIn, db: Session = Depends(get_db)):
    try:
        item = db.query(ServicePerCustomer).filter(ServicePerCustomer.id_service_per_customer == id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        
        # Actualizar campos - updated_at se actualizará automáticamente por onupdate
        item.id_service = data.id_service
        item.id_client = data.id_client
        item.id_company = data.id_company
        item.minutes_included = data.minutes_included
        item.minutes_minimum = data.minutes_minimum
        item.fuselage_type = data.fuselage_type
        item.technicians_included = data.technicians_included
        item.whonew = data.whonew or "system"
        
        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar registro: {str(e)}")

@router.delete("/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    try:
        item = db.query(ServicePerCustomer).filter(ServicePerCustomer.id_service_per_customer == id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        
        db.delete(item)
        db.commit()
        return {"message": "Registro eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar registro: {str(e)}")