from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceClassification
from app.database import get_db
from typing import Optional

router = APIRouter(
    prefix="/catalog/service-classification",
    tags=["CatalogServiceClassification"]
)

class ClassificationIn(BaseModel):
    service_classification_name: str
    whonew: str = "system"

class ClassificationUpdate(BaseModel):
    service_classification_name: str
    status: Optional[bool] = None
    whoedit: str = "system"

@router.get("/")
def get_classifications(search: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(CatalogServiceClassification)
    if search:
        query = query.filter(CatalogServiceClassification.service_classification_name.ilike(f"%{search}%"))
    return query.all()

@router.get("/{classification_id}")
def get_classification(classification_id: int, db: Session = Depends(get_db)):
    classification = db.query(CatalogServiceClassification).filter(CatalogServiceClassification.id_service_classification == classification_id).first()
    if not classification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clasificación con ID {classification_id} no encontrada"
        )
    return classification

@router.post("/")
def create_classification(item: ClassificationIn, db: Session = Depends(get_db)):
    obj = CatalogServiceClassification(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{classification_id}")
def update_classification(classification_id: int, item: ClassificationUpdate, db: Session = Depends(get_db)):
    classification = db.query(CatalogServiceClassification).filter(CatalogServiceClassification.id_service_classification == classification_id).first()
    if not classification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clasificación con ID {classification_id} no encontrada"
        )
    
    # Actualizar campos
    for key, value in item.dict(exclude_unset=True).items():
        setattr(classification, key, value)
    
    db.commit()
    db.refresh(classification)
    return classification

@router.delete("/{classification_id}")
def delete_classification(classification_id: int, db: Session = Depends(get_db)):
    classification = db.query(CatalogServiceClassification).filter(CatalogServiceClassification.id_service_classification == classification_id).first()
    if not classification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clasificación con ID {classification_id} no encontrada"
        )
    
    db.delete(classification)
    db.commit()
    return {"message": f"Clasificación con ID {classification_id} eliminada exitosamente"}