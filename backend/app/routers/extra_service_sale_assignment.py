from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ExtraServiceSaleAssignment
from app.database import get_db

router = APIRouter(
    prefix="/catalog/extra-service-sale-assignment",
    tags=["ExtraServiceSaleAssignment"]
)

class SaleAssignIn(BaseModel):
    id_service_per_customer: int
    id_sale_flight: int
    id_sale_employee: int
    work_order: str
    status: bool = True
    sale_employee_deleted: bool = False

@router.get("/")
def get_all(work_order: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(ExtraServiceSaleAssignment)
    if work_order:
        query = query.filter(ExtraServiceSaleAssignment.work_order.ilike(f"%{work_order}%"))
    return query.all()

@router.post("/")
def create_item(data: SaleAssignIn, db: Session = Depends(get_db)):
    obj = ExtraServiceSaleAssignment(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/{id}")
def get_one(id: int, db: Session = Depends(get_db)):
    item = db.query(ExtraServiceSaleAssignment).filter(ExtraServiceSaleAssignment.id_xtra_sale_employee == id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asignación de servicio con ID {id} no encontrada"
        )
    return item

@router.put("/{id}")
def update_item(id: int, data: SaleAssignIn, db: Session = Depends(get_db)):
    # Buscar la asignación existente
    item = db.query(ExtraServiceSaleAssignment).filter(ExtraServiceSaleAssignment.id_xtra_sale_employee == id).first()
    
    # Verificar si existe
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asignación de servicio con ID {id} no encontrada"
        )
    
    # Actualizar los campos
    for key, value in data.dict().items():
        setattr(item, key, value)
    
    # Guardar los cambios
    db.commit()
    db.refresh(item)
    
    return item

@router.delete("/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    # Buscar la asignación existente
    item = db.query(ExtraServiceSaleAssignment).filter(ExtraServiceSaleAssignment.id_xtra_sale_employee == id).first()
    
    # Verificar si existe
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asignación de servicio con ID {id} no encontrada"
        )
    
    # Eliminar la asignación
    db.delete(item)
    db.commit()
    
    return {"message": f"Asignación de servicio con ID {id} eliminada exitosamente"}