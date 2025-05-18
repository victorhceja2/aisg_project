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

class CatalogServiceTypeResponse(CatalogResponse): pass
class CatalogServiceIncludeResponse(CatalogResponse): pass
class CatalogServiceCategoryResponse(CatalogResponse): pass
class CatalogServiceStatusResponse(CatalogResponse): pass
