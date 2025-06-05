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

# Nuevo schema para el reporte de operación v2 basado en el query exacto
class OperationReportV2Response(BaseModel):
    COMPANY: Optional[str] = None
    LLAVE: Optional[int] = None
    AIRLINE: Optional[str] = None
    DATE: Optional[str] = None
    STATION: Optional[str] = None
    AC_REG: Optional[str] = None
    FLIGTH: Optional[str] = None
    DEST: Optional[str] = None
    LOG_BOOK: Optional[str] = None
    AC_TYPE: Optional[str] = None
    START_TIME: Optional[str] = None
    END_TIME: Optional[str] = None
    SERV_PR: Optional[str] = None
    ON_GND: Optional[str] = None
    SERV1: Optional[str] = None
    SERV2: Optional[str] = None
    SERV3: Optional[str] = None
    SERV4: Optional[str] = None
    SERV5: Optional[str] = None
    SERV6: Optional[str] = None
    REMARKS: Optional[str] = None
    TECHNICIAN: Optional[str] = None

    class Config:
        from_attributes = True

# Nuevo schema para el reporte de servicios
class ServicesReportResponse(BaseModel):
    COMPANY: Optional[str] = None
    LLAVE: Optional[int] = None
    AIRLINE: Optional[str] = None
    DATE: Optional[str] = None
    STATION: Optional[str] = None
    AC_REG: Optional[str] = None
    FLIGHT: Optional[str] = None
    AC_TYPE: Optional[str] = None
    START_TIME: Optional[str] = None
    END_TIME: Optional[str] = None
    ON_GND: Optional[str] = None
    SERVICE: Optional[str] = None
    WORK_REFERENCE: Optional[str] = None
    TECHNICIAN: Optional[str] = None

    class Config:
        from_attributes = True