from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ServicePerCustomer
from app.database import get_db
from typing import Optional

router = APIRouter(
    prefix="/catalog/service-per-customer",
    tags=["ServicePerCustomer"]
)

class ServiceCustomerIn(BaseModel):
    id_service: int
    id_client: int
    id_company: int
    minutes_included: int
    minutes_minimum: int  # Ya está bien escrito
    fuselage_type: str
    technicians_included: int
    whonew: Optional[str] = "system"

@router.get("/")
def get_all(fuselage_type: str = Query(None), db: Session = Depends(get_db)):
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
        obj = ServicePerCustomer(**data.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj
    except Exception as e:
        db.rollback()
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
        
        # Actualizar campos
        for key, value in data.dict().items():
            setattr(item, key, value)
        
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