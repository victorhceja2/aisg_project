from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import DBTableAvion
from app.database import get_db
from sqlalchemy import text

router = APIRouter(
    prefix="/aircraft-models",
    tags=["Aircraft Models"]
)

@router.get("/")
def get_aircraft_models(db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT modelo, fuselaje FROM DBTableAvion WHERE fuselaje IS NOT NULL AND fuselaje != ''")
        )
        # List comprehension para mayor eficiencia y brevedad
        return [{"modelo": row.modelo, "fuselaje": row.fuselaje} for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching aircraft models: {str(e)}")