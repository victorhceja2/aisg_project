from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CatalogBase(BaseModel):
    name: str
    whonew: Optional[str]

class CatalogResponse(CatalogBase):
    id: int
    create_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class CatalogServiceTypeResponse(CatalogResponse):
    pass

class CatalogServiceIncludeResponse(CatalogResponse):
    pass

class CatalogServiceCategoryResponse(CatalogResponse):
    pass

class ServicePerCustomerResponse(BaseModel):
    id_service_per_customer: int
    id_customer: int
    id_service: int
    id_country: int
    id_location: int
    status: int
    whonew: Optional[str]
    create_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
