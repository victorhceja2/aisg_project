from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/operations/report")
def get_operations_report():
    # Simulación de un reporte sencillo
    return [
        {
            "operation_id": 1,
            "service": "Mantenimiento",
            "status": "Activo",
            "fecha": datetime.utcnow()
        },
        {
            "operation_id": 2,
            "service": "Inspección",
            "status": "Pendiente",
            "fecha": datetime.utcnow()
        }
    ]
