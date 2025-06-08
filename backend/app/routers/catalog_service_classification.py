from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceClassification
from app.database import get_db
from typing import Optional
from datetime import datetime

router = APIRouter(
    prefix="/catalog/service-classification",
    tags=["CatalogServiceClassification"]
)

class ClassificationIn(BaseModel):
    service_classification_name: str
    whonew: str = "system"

class ClassificationUpdate(BaseModel):
    service_classification_name: Optional[str] = None
    status: Optional[bool] = None
    whonew: Optional[str] = None  # Cambiar de whoedit a whonew para coincidir con el frontend

@router.get("/")
def get_classifications(search: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(CatalogServiceClassification)
    if search:
        query = query.filter(CatalogServiceClassification.service_classification_name.ilike(f"%{search}%"))
    return query.all()

@router.get("/{classification_id}")
def get_classification(classification_id: int, db: Session = Depends(get_db)):
    classification = db.query(CatalogServiceClassification).filter(
        CatalogServiceClassification.id_service_classification == classification_id
    ).first()
    if not classification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clasificación con ID {classification_id} no encontrada"
        )
    return classification

@router.post("/")
def create_classification(item: ClassificationIn, db: Session = Depends(get_db)):
    # Crear objeto con datos del request y timestamps
    classification_data = item.dict()
    classification_data['create_at'] = datetime.utcnow()
    
    obj = CatalogServiceClassification(**classification_data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{classification_id}")
def update_classification(classification_id: int, item: ClassificationUpdate, db: Session = Depends(get_db)):
    classification = db.query(CatalogServiceClassification).filter(
        CatalogServiceClassification.id_service_classification == classification_id
    ).first()
    if not classification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clasificación con ID {classification_id} no encontrada"
        )
    
    # Obtener solo los campos que no son None del request
    update_data = item.dict(exclude_unset=True, exclude_none=True)
    
    # Agregar timestamp de actualización
    update_data['updated_at'] = datetime.utcnow()
    
    # Debug: imprimir los datos recibidos
    print(f"Datos recibidos del frontend: {item.dict()}")
    print(f"Datos a actualizar: {update_data}")
    
    # Actualizar solo los campos presentes en el request
    for key, value in update_data.items():
        if hasattr(classification, key):
            print(f"Actualizando {key} = {value}")
            setattr(classification, key, value)
        else:
            print(f"Campo {key} no existe en el modelo")
    
    db.commit()
    db.refresh(classification)
    return classification

@router.delete("/{classification_id}")
def delete_classification(classification_id: int, db: Session = Depends(get_db)):
    classification = db.query(CatalogServiceClassification).filter(
        CatalogServiceClassification.id_service_classification == classification_id
    ).first()
    if not classification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clasificación con ID {classification_id} no encontrada"
        )
    
    db.delete(classification)
    db.commit()
    return {"message": f"Clasificación con ID {classification_id} eliminada exitosamente"}