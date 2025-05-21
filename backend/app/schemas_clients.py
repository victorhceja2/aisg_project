from pydantic import BaseModel
from decimal import Decimal

class ClientResponse(BaseModel):
    # id_client: int
    mote: str | None
    nombre: str | None
    comercial: str | None
    razonSocial: str | None
    rfc: str | None
    taxId: str | None
    noCliente: str | None
    isNacional: int | None
    isParteRelacionada: int | None
    residenciaFiscal: str | None
    usoCfdi: str | None
    referenciaBancariaValor: str | None
    referenciaBancariaPatron: int | None
    metodoPago: str | None
    formaPago: str | None
    condicionesDePago: str | None
    moneda: str | None
    idCif: str | None
    lineaCredito: Decimal | None
    saldo: Decimal | None
    jerarquia: Decimal | None
    grupo: int | None
    language: int | None
    invoiceFileName: int | None
    estatus: int | None
    usuarioRegistro: str | None
    fechaRegistro: int | None
    horaRegistro: int | None
    companyCode: str | None
    keyObjectId: str | None
    objectKeyValue: str | None
    objectKeyIndex: int | None
    llave: int | None
    llaveAgente: int | None
    adminFeePercentage: Decimal | None
    formatoMonthlyFee: int | None
    taxFree: int | None
    codigoPostal: str | None
    regimenFiscal: str | None

    class Config:
        orm_mode = True