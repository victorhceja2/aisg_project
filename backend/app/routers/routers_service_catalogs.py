from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas_service_catalogs import *

router = APIRouter()

# --- CatalogServiceType ---
@router.get("/service-types", response_model=list[CatalogServiceTypeResponse])
def get_service_types(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceType).all()

@router.post("/service-types", response_model=CatalogServiceTypeResponse)
def create_service_type(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceType(service_type_name=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/service-types/{item_id}", response_model=CatalogServiceTypeResponse)
def update_service_type(item_id: int, item: CatalogBase, db: Session = Depends(get_db)):
    registro = db.query(models.CatalogServiceType).filter_by(id_service_type=item_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="No encontrado")
    registro.service_type_name = item.name
    registro.whonew = item.whonew
    db.commit()
    return registro

@router.delete("/service-types/{item_id}")
def delete_service_type(item_id: int, db: Session = Depends(get_db)):
    registro = db.query(models.CatalogServiceType).filter_by(id_service_type=item_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(registro)
    db.commit()
    return {"ok": True}

# --- CatalogServiceInclude ---
@router.get("/service-includes", response_model=list[CatalogServiceIncludeResponse])
def get_service_includes(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceInclude).all()

@router.post("/service-includes", response_model=CatalogServiceIncludeResponse)
def create_service_include(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceInclude(service_include_name=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/service-includes/{item_id}", response_model=CatalogServiceIncludeResponse)
def update_service_include(item_id: int, item: CatalogBase, db: Session = Depends(get_db)):
    registro = db.query(models.CatalogServiceInclude).filter_by(id_service_include=item_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="No encontrado")
    registro.service_include_name = item.name
    registro.whonew = item.whonew
    db.commit()
    return registro

@router.delete("/service-includes/{item_id}")
def delete_service_include(item_id: int, db: Session = Depends(get_db)):
    registro = db.query(models.CatalogServiceInclude).filter_by(id_service_include=item_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(registro)
    db.commit()
    return {"ok": True}

# --- CatalogServiceCategory ---
@router.get("/service-categories", response_model=list[CatalogServiceCategoryResponse])
def get_service_categories(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceCategory).all()

@router.post("/service-categories", response_model=CatalogServiceCategoryResponse)
def create_service_category(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceCategory(service_category_name=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/service-categories/{item_id}", response_model=CatalogServiceCategoryResponse)
def update_service_category(item_id: int, item: CatalogBase, db: Session = Depends(get_db)):
    registro = db.query(models.CatalogServiceCategory).filter_by(id_service_category=item_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="No encontrado")
    registro.service_category_name = item.name
    registro.whonew = item.whonew
    db.commit()
    return registro

@router.delete("/service-categories/{item_id}")
def delete_service_category(item_id: int, db: Session = Depends(get_db)):
    registro = db.query(models.CatalogServiceCategory).filter_by(id_service_category=item_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(registro)
    db.commit()
    return {"ok": True}

# --- ServicePerCustomer (solo GET por ahora) ---
@router.get("/service-per-customer", response_model=list[ServicePerCustomerResponse])
def get_service_per_customer(db: Session = Depends(get_db)):
    return db.query(models.ServicePerCustomer).all()
