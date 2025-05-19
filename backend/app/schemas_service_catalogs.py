from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Clase directa con los campos exactos para recibir del frontend
class ServiceTypeCreate(BaseModel):
    service_type_name: str
    whonew: Optional[str] = None

class ServiceIncludeCreate(BaseModel):
    service_include: str
    whonew: Optional[str] = None

class ServiceCategoryCreate(BaseModel):
    service_category_name: str
    whonew: Optional[str] = None

class ServiceStatusCreate(BaseModel):
    status_name: str
    whonew: Optional[str] = None

# Clase base genérica (mantener para compatibilidad con frontend antiguo)
class CatalogBase(BaseModel):
    name: str
    whonew: Optional[str] = None

# Clases específicas para cada tipo, heredan de CatalogBase
class CatalogServiceTypeBase(CatalogBase):
    name: str = Field(alias="service_type_name")

class CatalogServiceIncludeBase(CatalogBase):
    name: str = Field(alias="service_include")

class CatalogServiceCategoryBase(CatalogBase):
    name: str = Field(alias="service_category_name")

class CatalogServiceStatusBase(CatalogBase):
    name: str = Field(alias="status_name")

# Respuestas (sin cambios)
class CatalogServiceTypeResponse(BaseModel):
    id_service_type: int
    service_type_name: str
    whonew: Optional[str] = None
    create_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class CatalogServiceIncludeResponse(BaseModel):
    id_service_include: int
    service_include: str
    whonew: Optional[str] = None
    create_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class CatalogServiceCategoryResponse(BaseModel):
    id_service_category: int
    service_category_name: str
    whonew: Optional[str] = None
    create_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class CatalogServiceStatusResponse(BaseModel):
    id_service_status: int
    status_name: str
    whonew: Optional[str] = None
    create_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True