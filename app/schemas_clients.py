from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

class ClientResponse(BaseModel):
    # id_client: int # Comentado ya que llave es el PK en el modelo Cliente
    mote: Optional[str] = None
    nombre: Optional[str] = None
    comercial: Optional[str] = None
    razonSocial: Optional[str] = None
    rfc: Optional[str] = None
    taxId: Optional[str] = None
    noCliente: Optional[str] = None
    isNacional: Optional[int] = None
    isParteRelacionada: Optional[int] = None
    residenciaFiscal: Optional[str] = None
    usoCfdi: Optional[str] = None
    referenciaBancariaValor: Optional[str] = None
    referenciaBancariaPatron: Optional[int] = None
    metodoPago: Optional[str] = None
    formaPago: Optional[str] = None
    condicionesDePago: Optional[str] = None
    moneda: Optional[str] = None
    idCif: Optional[str] = None
    lineaCredito: Optional[Decimal] = None
    saldo: Optional[Decimal] = None
    jerarquia: Optional[Decimal] = None
    grupo: Optional[int] = None
    language: Optional[int] = None
    invoiceFileName: Optional[int] = None
    estatus: Optional[int] = None
    usuarioRegistro: Optional[str] = None
    fechaRegistro: Optional[int] = None
    horaRegistro: Optional[int] = None
    companyCode: Optional[str] = None
    keyObjectId: Optional[str] = None
    objectKeyValue: Optional[str] = None
    objectKeyIndex: Optional[int] = None
    llave: Optional[int] = None
    llaveAgente: Optional[int] = None
    adminFeePercentage: Optional[Decimal] = None
    formatoMonthlyFee: Optional[int] = None
    taxFree: Optional[int] = None
    codigoPostal: Optional[str] = None # Ya estaba, pero para confirmar
    regimenFiscal: Optional[str] = None

    class Config:
        from_attributes = True # Cambiado de orm_mode a from_attributes para Pydantic v2

# Nuevo schema para la respuesta combinada de cliente y compañía
class ClientWithCompanyDetailsResponse(BaseModel):
    noCliente: Optional[str] = None
    nombre: Optional[str] = None
    razonSocial: Optional[str] = None
    rfc: Optional[str] = None
    taxId: Optional[str] = None # taxId del cliente
    monedaCliente: Optional[str] = None
    lineaCredito: Optional[Decimal] = None
    saldo: Optional[Decimal] = None
    jerarquia: Optional[Decimal] = None
    
    # Campos de la compañía
    companyName: Optional[str] = None
    monedaEmpresa: Optional[str] = None
    fiel: Optional[str] = None
    direccion1: Optional[str] = None
    direccion2: Optional[str] = None
    codigoPostal: Optional[str] = None # codigoPostal de la empresa
    municipio: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None

    # Para mantener compatibilidad si se mapea desde el ORM en algún caso
    # y para que el endpoint individual pueda usarlo también.
    llave: Optional[int] = None # PK del cliente para referencia

    class Config:
        from_attributes = True