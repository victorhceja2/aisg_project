from pydantic import BaseModel
from typing import Optional

class CompanyResponse(BaseModel):
    companyCode: str
    companyName: str
    moneda: Optional[str] = None
    fiel: Optional[str] = None
    taxId: Optional[str] = None
    direccion1: Optional[str] = None
    direccion2: Optional[str] = None
    direccion3: Optional[str] = None
    direccion4: Optional[str] = None
    direccion5: Optional[str] = None
    codigoPostal: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    
    class Config:
        from_attributes = True

class CompanyCreate(BaseModel):
    companyCode: str
    companyName: str
    moneda: Optional[str] = None
    fiel: Optional[str] = None
    taxId: Optional[str] = None
    direccion1: Optional[str] = None
    direccion2: Optional[str] = None
    direccion3: Optional[str] = None
    direccion4: Optional[str] = None
    direccion5: Optional[str] = None
    codigoPostal: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None

class CompanyUpdate(BaseModel):
    companyName: Optional[str] = None
    moneda: Optional[str] = None
    fiel: Optional[str] = None
    taxId: Optional[str] = None
    direccion1: Optional[str] = None
    direccion2: Optional[str] = None
    direccion3: Optional[str] = None
    direccion4: Optional[str] = None
    direccion5: Optional[str] = None
    codigoPostal: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None