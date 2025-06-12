from pydantic import BaseModel, Field
from typing import Optional, List
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
    create_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

# Modelos de respuesta para cada catálogo
class CatalogServiceTypeResponse(CatalogResponse): 
    id: int = Field(alias="id_service_type")
    name: str = Field(alias="service_type_name")

class CatalogServiceIncludeResponse(CatalogResponse):
    id: int = Field(alias="id_service_include")
    name: str = Field(alias="service_include")

class CatalogServiceCategoryResponse(CatalogResponse):
    id: int = Field(alias="id_service_category")
    name: str = Field(alias="service_category_name")

class CatalogServiceStatusResponse(CatalogResponse):
    id: int = Field(alias="id_service_status")
    name: str = Field(alias="status_name")

# Para respuestas tipo lista
class CatalogServiceTypeListResponse(BaseModel):
    response: List[CatalogServiceTypeResponse]

class CatalogServiceIncludeListResponse(BaseModel):
    response: List[CatalogServiceIncludeResponse]

class CatalogServiceCategoryListResponse(BaseModel):
    response: List[CatalogServiceCategoryResponse]

class CatalogServiceStatusListResponse(BaseModel):
    response: List[CatalogServiceStatusResponse]

# Modelo utilizado en alias
class CatalogServiceCreate(CatalogBase): pass

