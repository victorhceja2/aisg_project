from pydantic import BaseModel
from typing import Optional

class CompanyResponse(BaseModel):
    companyCode: str
    companyName: str
    MonedaEmpresa: Optional[str] = None
    RFC_En_Company: Optional[str] = None
    RazonSocial_En_CompanyCode: Optional[str] = None
    NombreComercial: Optional[str] = None
    TipoPersona: Optional[str] = None
    MonedaEnCompanyCode: Optional[str] = None
    Producto: Optional[str] = None
    Estatus: Optional[str] = None
    UsuarioRegistro: Optional[str] = None
    FechaRegistro: Optional[str] = None
    HoraRegistro: Optional[str] = None
    Llave: Optional[int] = None

    class Config:
        from_attributes = True

class AirlineResponse(BaseModel):
    llave: int
    linea: Optional[str] = None
    nombre: Optional[str] = None
    callSign: Optional[str] = None
    pais: Optional[str] = None
    companyCode: Optional[str] = None
    keyObjectId: Optional[str] = None
    objectKeyValue: Optional[str] = None
    objectKeyIndex: Optional[int] = None

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