from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/aircraft-models")

@router.get("/")
def get_aircraft_models(db: Session = Depends(get_db)):
    return db.query(models.DBTableAvion).all()

# Nuevo endpoint para obtener solo los tipos de fuselaje únicos
@router.get("/fuselages")
def get_fuselage_types(db: Session = Depends(get_db)):
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