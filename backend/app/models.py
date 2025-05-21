from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base
from datetime import datetime

class CatalogServiceStatus(Base):
    __tablename__ = "CatalogServiceStatus"
    id_service_status = Column(Integer, primary_key=True, index=True)
    status_name = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CatalogServiceClassification(Base):
    __tablename__ = "CatalogServiceClassification"
    id_service_classification = Column(Integer, primary_key=True, index=True)  # CAMBIADO: ahora con doble "s"
    service_classification_name = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CatalogServiceType(Base):
    __tablename__ = "CatalogServiceType"
    id_service_type = Column(Integer, primary_key=True, index=True)
    service_type_name = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CatalogServiceInclude(Base):
    __tablename__ = "CatalogServiceInclude"
    id_service_include = Column(Integer, primary_key=True, index=True)
    service_include = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CatalogServiceCategory(Base):
    __tablename__ = "CatalogServiceCategory"
    id_service_category = Column(Integer, primary_key=True, index=True)
    service_category_name = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CatalogService(Base):
    __tablename__ = "CatalogServices"
    id_service = Column(Integer, primary_key=True, index=True)
    id_service_status = Column(Integer, ForeignKey("CatalogServiceStatus.id_service_status"), nullable=False)
    id_service_classification = Column(Integer, ForeignKey("CatalogServiceClassification.id_service_classification"), nullable=False)  # CAMBIADO: ahora con doble "s" 
    id_service_category = Column(Integer, ForeignKey("CatalogServiceCategory.id_service_category"), nullable=False)
    id_service_type = Column(Integer, ForeignKey("CatalogServiceType.id_service_type"), nullable=False)
    id_service_include = Column(Integer, ForeignKey("CatalogServiceInclude.id_service_include"), nullable=False)
    service_code = Column(String(50), nullable=False)
    service_name = Column(String(150), nullable=False)
    service_description = Column(String(500))
    service_aircraft_type = Column(Integer, default=1)
    service_by_time = Column(Integer, default=1)
    min_time_configured = Column(Integer, default=1)
    service_technicians_included = Column(Integer, default=1)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ServicePerCustomer(Base):
    __tablename__ = "ServicePerCustomer"
    id_service_per_customer = Column(Integer, primary_key=True, index=True)
    id_service = Column(Integer, ForeignKey("CatalogServices.id_service"), nullable=False)
    id_client = Column(Integer, nullable=False)
    id_company = Column(Integer, nullable=False)
    minutes_included = Column(Integer, default=0)
    minutes_minimum = Column(Integer, default=0)
    fuselage_type = Column(String(10))
    technicians_included = Column(Integer, default=0)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ExtraCompanyConfiguration(Base):
    __tablename__ = "ExtraCompanyConfiguration"
    id_xtra_company = Column(Integer, primary_key=True, index=True)
    id_company = Column(Integer, nullable=False)
    applies_detail = Column(Integer, default=1)
    status = Column(Integer, default=1)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ExtraServiceSaleAssignment(Base):
    __tablename__ = "ExtraServiceSaleAssignment"
    id_xtra_sale_employee = Column(Integer, primary_key=True, index=True)
    id_service_per_customer = Column(Integer, ForeignKey("ServicePerCustomer.id_service_per_customer"), nullable=False)
    id_sale_flight = Column(Integer, nullable=False)
    id_sale_employee = Column(Integer, nullable=False)
    sale_employee_deleted = Column(Integer, default=1)
    work_order = Column(String(100))
    status = Column(Integer, default=1)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Cliente(Base):
    __tablename__ = "DBTableCliente"

    llave = Column(String, primary_key=True, index=True)
    mote = Column(String)
    nombre = Column(String)
    comercial = Column(String)
    razonSocial = Column(String)
    rfc = Column(String)
    taxId = Column(String)
    noCliente = Column(String)
    isNacional = Column(Integer)
    isParteRelacionada = Column(Integer)
    residenciaFiscal = Column(String)
    usoCfdi = Column(String)
    referenciaBancariaValor = Column(String)
    referenciaBancariaPatron = Column(String)
    metodoPago = Column(String)
    formaPago = Column(String)
    condicionesDePago = Column(String)
    moneda = Column(String)
    idCif = Column(String)
    lineaCredito = Column(String)
    saldo = Column(String)
    jerarquia = Column(String)
    grupo = Column(String)
    language = Column(String)
    invoiceFileName = Column(String)
    estatus = Column(String)
    usuarioRegistro = Column(String)
    fechaRegistro = Column(DateTime)
    horaRegistro = Column(String)
    companyCode = Column(String)
    keyObjectId = Column(String)
    objectKeyValue = Column(String)
    objectKeyIndex = Column(String)
    llaveAgente = Column(String)
    adminFeePercentage = Column(String)
    formatoMonthlyFee = Column(String)
    taxFree = Column(Integer)
    codigoPostal = Column(String)
    regimenFiscal = Column(String)

# 👇 Esta clase debe estar FUERA de Cliente
class DBTableAvion(Base):
    __tablename__ = "DBTableAvion"
    modelo = Column(String(50), primary_key=True, index=True)
    fuselaje = Column(String(10))