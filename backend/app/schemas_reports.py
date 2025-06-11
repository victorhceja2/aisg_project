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
    # Campos adicionales que se unieron
    service_name: Optional[str] = None
    client_name: Optional[str] = None
    company_name: Optional[str] = None
    aircraft_model: Optional[str] = None
    create_at: datetime # Añadido para consistencia si se usa
    updated_at: Optional[datetime] = None # Añadido para consistencia si se usa


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
    AIRLINE: Optional[str] = None
    DATE: Optional[str] = None # Convertido a str en el endpoint
    STATION: Optional[str] = None
    AC_REG: Optional[str] = None
    FLIGTH: Optional[str] = None # Coincide con el alias SQL 'FLIGTH'
    DEST: Optional[str] = None
    LOG_BOOK: Optional[str] = None
    AC_TYPE: Optional[str] = None
    SERV_PR: Optional[str] = None
    ASSISTANT_TYPE: Optional[str] = None # Añadido
    AOG: Optional[str] = None # Añadido
    START_TIME: Optional[str] = None # Convertido a str en el endpoint
    END_TIME: Optional[str] = None # Convertido a str en el endpoint
    TOTAL_TECHNICIAN_TIME: Optional[str] = None # Añadido
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
    LLAVE: Optional[str] = None # Añadido para incluir el identificador de la compañía
    AIRLINE: Optional[str] = None
    DATE: Optional[str] = None # Convertido a str en el endpoint
    STATION: Optional[str] = None
    AC_REG: Optional[str] = None
    FLIGHT: Optional[str] = None # Coincide con el alias SQL 'FLIGHT'
    AC_TYPE: Optional[str] = None
    ASSISTANT_TYPE: Optional[str] = None # Añadido
    AOG: Optional[str] = None # Añadido
    START_TIME: Optional[str] = None # Formateado como str en el endpoint
    END_TIME: Optional[str] = None # Formateado como str en el endpoint
    ON_GND: Optional[str] = None # Formateado como str en el endpoint
    SERVICE: Optional[str] = None
    WORK_REFERENCE: Optional[str] = None
    TECHNICIAN: Optional[str] = None

    class Config:
        from_attributes = True