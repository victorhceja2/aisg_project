from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas_service_catalogs import *
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/catalog",  # Prefijo común para todas las rutas
    tags=["Service Catalogs"]  # Tag para agrupar en Swagger
)

# ----- Service Type -----
@router.get("/service-types", response_model=list[CatalogServiceTypeResponse])
def get_service_types(db: Session = Depends(get_db)):
    try:
        return db.query(models.CatalogServiceType).all()
    except Exception as e:
        logger.error(f"Error al obtener service-types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/service-types", response_model=CatalogServiceTypeResponse)
def create_service_type(item: ServiceTypeCreate, db: Session = Depends(get_db)):
    try:
        nuevo = models.CatalogServiceType(
            service_type_name=item.service_type_name, 
            whonew=item.whonew
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear service-type: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/service-types/{item_id}", response_model=CatalogServiceTypeResponse)
def update_service_type(item_id: int, item: ServiceTypeCreate, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceType).filter_by(id_service_type=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        registro.service_type_name = item.service_type_name
        registro.whonew = item.whonew  # <-- Aquí se actualiza el usuario
        db.commit()
        db.refresh(registro)
        return registro
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar service-type: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/service-types/{item_id}")
def delete_service_type(item_id: int, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceType).filter_by(id_service_type=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(registro)
        db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al eliminar service-type: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ----- Service Include -----
@router.get("/service-includes", response_model=list[CatalogServiceIncludeResponse])
def get_service_includes(db: Session = Depends(get_db)):
    try:
        return db.query(models.CatalogServiceInclude).all()
    except Exception as e:
        logger.error(f"Error al obtener service-includes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/service-includes", response_model=CatalogServiceIncludeResponse)
def create_service_include(item: ServiceIncludeCreate, db: Session = Depends(get_db)):
    try:
        nuevo = models.CatalogServiceInclude(
            service_include=item.service_include, 
            whonew=item.whonew
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear service-include: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/service-includes/{item_id}", response_model=CatalogServiceIncludeResponse)
def update_service_include(item_id: int, item: ServiceIncludeCreate, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceInclude).filter_by(id_service_include=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        registro.service_include = item.service_include
        registro.whonew = item.whonew  # <-- Aquí se actualiza el usuario
        db.commit()
        db.refresh(registro)
        return registro
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar service-include: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/service-includes/{item_id}")
def delete_service_include(item_id: int, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceInclude).filter_by(id_service_include=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(registro)
        db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al eliminar service-include: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ----- Service Category -----
@router.get("/service-categories", response_model=list[CatalogServiceCategoryResponse])
def get_service_categories(db: Session = Depends(get_db)):
    try:
        return db.query(models.CatalogServiceCategory).all()
    except Exception as e:
        logger.error(f"Error al obtener service-categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/service-categories", response_model=CatalogServiceCategoryResponse)
def create_service_category(item: ServiceCategoryCreate, db: Session = Depends(get_db)):
    try:
        nuevo = models.CatalogServiceCategory(
            service_category_name=item.service_category_name, 
            whonew=item.whonew
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear service-category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/service-categories/{item_id}", response_model=CatalogServiceCategoryResponse)
def update_service_category(item_id: int, item: ServiceCategoryCreate, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceCategory).filter_by(id_service_category=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        registro.service_category_name = item.service_category_name
        registro.whonew = item.whonew
        db.commit()
        db.refresh(registro)
        return registro
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar service-category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/service-categories/{item_id}")
def delete_service_category(item_id: int, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceCategory).filter_by(id_service_category=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(registro)
        db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al eliminar service-category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ----- Service Status -----
@router.get("/service-status", response_model=list[CatalogServiceStatusResponse])
def get_service_status(db: Session = Depends(get_db)):
    try:
        return db.query(models.CatalogServiceStatus).all()
    except Exception as e:
        logger.error(f"Error al obtener service-status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/service-status/{item_id}", response_model=CatalogServiceStatusResponse)
def get_service_status_by_id(item_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Buscando status con ID: {item_id}")
        registro = db.query(models.CatalogServiceStatus).filter_by(id_service_status=item_id).first()
        
        if not registro:
            logger.warning(f"Status con ID {item_id} no encontrado")
            raise HTTPException(status_code=404, detail="Status no encontrado")
            
        logger.info(f"Status encontrado: {registro.status_name}, creado por: {registro.whonew}")
        return registro
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener service-status por ID: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/service-status", response_model=CatalogServiceStatusResponse)
def create_service_status(item: ServiceStatusCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Request body completo: {item}")
        logger.info(f"Datos recibidos para crear status: {item.dict()}")
        
        # Asegurar que siempre haya un valor para whonew
        usuario = "system"
        if hasattr(item, 'whonew') and item.whonew:
            usuario = item.whonew
        
        # Crear el registro con el valor de usuario garantizado
        nuevo = models.CatalogServiceStatus(
            status_name=item.status_name,
            whonew=usuario
        )
        
        logger.info(f"Objeto a guardar: status_name={nuevo.status_name!r}, whonew={nuevo.whonew!r}")
        
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        
        logger.info(f"Registro guardado en DB: id={nuevo.id_service_status}, whonew={nuevo.whonew!r}")
        
        return nuevo
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear service-status: {e}")
        logger.exception("Excepción detallada:")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/service-status/{item_id}", response_model=CatalogServiceStatusResponse)
def update_service_status(item_id: int, item: ServiceStatusCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Actualizando status ID={item_id} con datos: {item.dict()}")
        
        registro = db.query(models.CatalogServiceStatus).filter_by(id_service_status=item_id).first()
        if not registro:
            logger.warning(f"No se encontró el status con ID={item_id}")
            raise HTTPException(status_code=404, detail="No encontrado")
        
        # Asegurar que whonew siempre tenga un valor
        usuario = "system"
        if hasattr(item, 'whonew') and item.whonew:
            usuario = item.whonew
        
        # Guardar valores anteriores para comparar
        old_values = {
            "status_name": registro.status_name,
            "whonew": registro.whonew
        }
        
        registro.status_name = item.status_name
        registro.whonew = usuario
        
        logger.info(f"Cambios: {old_values} -> {{'status_name': '{registro.status_name}', 'whonew': '{registro.whonew}'}}")
        
        db.commit()
        db.refresh(registro)
        
        logger.info(f"Registro actualizado en DB: id={registro.id_service_status}, whonew={registro.whonew}")
        
        return registro
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar service-status: {e}")
        logger.exception("Excepción detallada:")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/service-status/{item_id}")
def delete_service_status(item_id: int, db: Session = Depends(get_db)):
    try:
        registro = db.query(models.CatalogServiceStatus).filter_by(id_service_status=item_id).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(registro)
        db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al eliminar service-status: {e}")
        raise HTTPException(status_code=500, detail=str(e))