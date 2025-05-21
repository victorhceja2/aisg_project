from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Clases específicas para creación directa desde frontend
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

# Clase base genérica reutilizable
class CatalogBase(BaseModel):
    name: str
    whonew: Optional[str] = None

# Alias para entrada con campos personalizados
class CatalogServiceTypeBase(CatalogBase):
    name: str = Field(alias="service_type_name")

class CatalogServiceIncludeBase(CatalogBase):
    name: str = Field(alias="service_include")

class CatalogServiceCategoryBase(CatalogBase):
    name: str = Field(alias="service_category_name")

class CatalogServiceStatusBase(CatalogBase):
    name: str = Field(alias="status_name")

# Clase base para respuestas genéricas
class CatalogResponse(CatalogBase):
    id: int
    create_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

# Modelos de respuesta para cada catálogo
class CatalogServiceTypeResponse(CatalogResponse): pass
class CatalogServiceIncludeResponse(CatalogResponse): pass
class CatalogServiceCategoryResponse(CatalogResponse): pass
class CatalogServiceStatusResponse(CatalogResponse): pass

# Modelo utilizado en alias
class CatalogServiceCreate(CatalogBase): pass