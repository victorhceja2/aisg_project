from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema para respuesta de ServiceExecution
class ServiceExecutionResponse(BaseModel):
    id: int
    id_service: int
    id_client: int
    id_company: int
    fuselage_type: str
    id_avion: int
    id_user: int
    work_order: str
    whonew: str

    class Config:
        from_attributes = True

# Schema para el reporte de operación
class OperationReportResponse(BaseModel):
    id: int
    cliente: str
    fuselage_type: str
    servicio_principal: str
    fecha: datetime
    work_order: Optional[str] = None
    tecnico_asignado: Optional[str] = None

    class Config:
        from_attributes = True