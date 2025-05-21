from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
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

class Client(Base):
    __tablename__ = "DBTableCliente"
    # id_client                   = Column(Integer, primary_key=True, index=True)
    mote                         = Column(String(40))
    nombre                       = Column(String(40))
    comercial                    = Column(String(40))
    razonSocial                  = Column(String(200))
    rfc                          = Column(String(13))
    taxId                        = Column(String(25))
    noCliente                    = Column(String(25))
    isNacional                   = Column(Integer)
    isParteRelacionada           = Column(Integer)
    residenciaFiscal             = Column(String(5))
    usoCfdi                      = Column(String(5))
    referenciaBancariaValor      = Column(String(35))
    referenciaBancariaPatron     = Column(Integer)
    metodoPago                   = Column(String(75))
    formaPago                    = Column(String(75))
    condicionesDePago            = Column(String(75))
    moneda                       = Column(String(5))
    idCif                        = Column(String(25))
    lineaCredito                 = Column(Numeric(15,6))
    saldo                        = Column(Numeric(15,6))
    jerarquia                    = Column(Numeric(15,6))
    grupo                        = Column(Integer)
    language                     = Column(Integer)
    invoiceFileName              = Column(Integer)
    estatus                      = Column(Integer)
    usuarioRegistro              = Column(String(40))
    fechaRegistro                = Column(Integer)
    horaRegistro                 = Column(Integer)
    companyCode                  = Column(String(25))
    keyObjectId                  = Column(String(25))
    objectKeyValue               = Column(String(25))
    objectKeyIndex               = Column(Integer)
    llave                        = Column(Integer, primary_key=True, index=True)
    llaveAgente                  = Column(Integer)
    adminFeePercentage           = Column(Numeric(15,6))
    formatoMonthlyFee            = Column(Integer)
    taxFree                      = Column(Integer)
    codigoPostal                 = Column(String(10))
    regimenFiscal                = Column(String(10))