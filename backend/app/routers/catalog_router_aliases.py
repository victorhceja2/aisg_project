from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas_service_catalogs import CatalogBase

router = APIRouter(prefix="/catalog")

# Alias de service-status
@router.get("/service-status")
def get_statuses(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceStatus).all()

@router.post("/service-status")
def create_status(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceStatus(status_name=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    return {"ok": True}

# Alias de service-types
@router.get("/service-types")
def get_types(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceType).all()

@router.post("/service-types")
def create_type(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceType(service_type_name=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    return {"ok": True}

# Alias de service-includes
@router.get("/service-includes")
def get_includes(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceInclude).all()

@router.post("/service-includes")
def create_include(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceInclude(service_include=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    return {"ok": True}

# Alias de service-categories
@router.get("/service-categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.CatalogServiceCategory).all()

@router.post("/service-categories")
def create_category(item: CatalogBase, db: Session = Depends(get_db)):
    nuevo = models.CatalogServiceCategory(service_category_name=item.name, whonew=item.whonew)
    db.add(nuevo)
    db.commit()
    return {"ok": True}

# Alias de extra-company-configuration
@router.post("/extra-company-configuration")
def create_extra_company(item: dict, db: Session = Depends(get_db)):
    nuevo = models.ExtraCompanyConfiguration(**item)
    db.add(nuevo)
    db.commit()
    return {"ok": True}

# Alias de extra-service-sale-assignment
@router.post("/extra-service-sale-assignment")
def create_extra_service(item: dict, db: Session = Depends(get_db)):
    nuevo = models.ExtraServiceSaleAssignment(**item)
    db.add(nuevo)
    db.commit()
    return {"ok": True}

@router.get("/aircraft-fuselages")
def get_aircraft_fuselages(db: Session = Depends(get_db)):
    """
    Obtiene todos los tipos de fuselaje únicos desde DBTableAvion
    """
    try:
        # Obtener fuselajes únicos y no nulos
        fuselages = db.query(models.DBTableAvion.fuselaje).filter(
            models.DBTableAvion.fuselaje.isnot(None)
        ).distinct().all()
        
        # Convertir a formato esperado por el frontend
        result = [{"fuselage_type": f.fuselaje} for f in fuselages if f.fuselaje and f.fuselaje.strip()]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener tipos de fuselaje: {str(e)}")
