from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, func
from app.database import Base
from datetime import datetime

class CatalogServiceStatus(Base):
    __tablename__ = "CatalogServiceStatus"
    id_service_status = Column(Integer, primary_key=True, index=True)
    status_name = Column(String(255), nullable=False)
    whonew = Column(String(255))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class CatalogServiceClassification(Base):
    __tablename__ = "CatalogServiceClassification"
    
    id_service_classification = Column(Integer, primary_key=True, index=True)
    service_classification_name = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=func.getdate())
    updated_at = Column(DateTime, onupdate=func.getdate())

class CatalogServiceType(Base):
    __tablename__ = "CatalogServiceType"
    id_service_type = Column(Integer, primary_key=True, index=True)
    service_type_name = Column(String(255), nullable=False)
    whonew = Column(String(255))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class CatalogServiceInclude(Base):
    __tablename__ = "CatalogServiceInclude"
    id_service_include = Column(Integer, primary_key=True, index=True)
    service_include = Column(String(255), nullable=False)
    whonew = Column(String(255))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class CatalogServiceCategory(Base):
    __tablename__ = "CatalogServiceCategory"
    id_service_category = Column(Integer, primary_key=True, index=True)
    service_category_name = Column(String(255), nullable=False)
    whonew = Column(String(255))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class CatalogService(Base):
    __tablename__ = "CatalogServices"
    id_service = Column(Integer, primary_key=True, index=True)
    service_code = Column(String(50), nullable=False)
    service_name = Column(String(255), nullable=False)
    service_description = Column(Text)
    id_service_status = Column(Integer, nullable=False)
    id_service_classification = Column(Integer, nullable=False)
    id_service_category = Column(Integer, nullable=False)
    id_service_type = Column(Integer, nullable=False)
    id_service_include = Column(Integer, nullable=False)
    service_aircraft_type = Column(Integer, nullable=False)
    service_by_time = Column(Integer, default=0)
    min_time_configured = Column(Integer, default=0)
    service_technicians_included = Column(Integer, default=1)
    whonew = Column(String(255))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class ServicePerCustomer(Base):
    __tablename__ = "ServicePerCustomer"
    id_service_per_customer = Column(Integer, primary_key=True, index=True)
    id_service = Column(Integer, nullable=False)
    id_client = Column(Integer, nullable=False)
    id_company = Column(Integer, nullable=False)
    minutes_included = Column(Integer, nullable=False, default=0)
    minutes_minimum = Column(Integer, nullable=False, default=0)
    fuselage_type = Column(String(50), nullable=False)
    technicians_included = Column(Integer, nullable=False, default=0)
    whonew = Column(String(255), nullable=False)
    create_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

class ExtraCompanyConfiguration(Base):
    __tablename__ = "ExtraCompanyConfiguration"
    id_xtra_company = Column(Integer, primary_key=True, index=True)
    id_company = Column(Integer, nullable=False)
    applies_detail = Column(Integer, default=0)
    status = Column(Integer, default=1)

class ExtraServiceSaleAssignment(Base):
    __tablename__ = "ExtraServiceSaleAssignment"
    id_xtra_sale_employee = Column(Integer, primary_key=True, index=True)
    id_service_per_customer = Column(Integer, nullable=False)
    work_order = Column(String(50), nullable=False)
    minute_charged = Column(Integer, nullable=False)
    minute_executed = Column(Integer, nullable=False)
    minute_difference = Column(Integer, nullable=False)
    minute_value = Column(Numeric(10, 2), nullable=False)
    technician_charged = Column(Integer, nullable=False)
    technician_executed = Column(Integer, nullable=False)
    technician_difference = Column(Integer, nullable=False)
    technician_value = Column(Numeric(10, 2), nullable=False)
    is_quoted = Column(String(10), nullable=False)
    whonew = Column(String(50), nullable=False)
    create_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=False)

class Cliente(Base):
    __tablename__ = "DBTableCliente"
    llave = Column(Integer, primary_key=True, index=True)
    mote = Column(String(40))
    nombre = Column(String(40))
    comercial = Column(String(40))
    razonSocial = Column(String(200))
    rfc = Column(String(13))
    taxId = Column(String(25))
    noCliente = Column(String(25))
    isNacional = Column(Integer)
    isParteRelacionada = Column(Integer)
    residenciaFiscal = Column(String(5))
    usoCfdi = Column(String(5))
    referenciaBancariaValor = Column(String(35))
    referenciaBancariaPatron = Column(Integer)
    metodoPago = Column(String(75))
    formaPago = Column(String(75))
    condicionesDePago = Column(String(75))
    moneda = Column(String(5))
    idCif = Column(String(25))
    lineaCredito = Column(Numeric)
    saldo = Column(Numeric)
    jerarquia = Column(Numeric)
    grupo = Column(Integer)
    language = Column(Integer)
    invoiceFileName = Column(Integer)
    estatus = Column(Integer)
    usuarioRegistro = Column(String(40))
    fechaRegistro = Column(Integer)
    horaRegistro = Column(Integer)
    companyCode = Column(String(25))
    keyObjectId = Column(String(25))
    objectKeyValue = Column(String(25))
    objectKeyIndex = Column(Integer)
    llaveAgente = Column(Integer)
    adminFeePercentage = Column(Numeric)
    formatoMonthlyFee = Column(Integer)
    taxFree = Column(Integer)
    codigoPostal = Column(String(10))
    regimenFiscal = Column(String(10))

class DBTableAvion(Base):
    __tablename__ = "DBTableAvion"
    modelo = Column(String(10), primary_key=True, index=True)
    fuselaje = Column(String(2))

class DBTableCompany(Base):
    __tablename__ = "DBTableCompany"
    companyCode = Column(String(4), primary_key=True, index=True)
    companyName = Column(String(100))
    moneda = Column(String(5))
    fiel = Column(String(150))
    taxId = Column(String(25))
    direccion1 = Column(String(60))
    direccion2 = Column(String(60))
    direccion3 = Column(String(60))
    direccion4 = Column(String(60))
    direccion5 = Column(String(60))
    codigoPostal = Column(String(6))
    municipio = Column(String(60))
    estado = Column(String(60))
    pais = Column(String(60))

class ServiceExecution(Base):
    __tablename__ = "ServiceExecution"
    id = Column(Integer, primary_key=True, index=True)
    id_service = Column(Integer, nullable=False)
    id_client = Column(String, nullable=False)
    id_company = Column(Integer, nullable=False)
    id_service_per_customer = Column(Integer, nullable=False)  
    fuselage_type = Column(String(50), nullable=False)
    id_avion = Column(Integer, nullable=False)
    id_user = Column(Integer, nullable=False)
    work_order = Column(String(50), nullable=False)
    whonew = Column(String(50), nullable=False)
    create_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=False)

class DBtableUserHeader(Base):
    __tablename__ = "DBtableUserHeader"
    userId = Column(Integer, primary_key=True, index=True)
    userName = Column(String(100))
    userNick = Column(String(50))
    password = Column(String(50))
    perfil = Column(String(50))
    estatus = Column(Integer)

class OperationReport(Base):
    __tablename__ = "vw_ReporteOperacion"
    __table_args__ = {"info": {"is_view": True}}
    
    id = Column(Integer, primary_key=True)
    cliente = Column(String)
    fuselage_type = Column(String)
    servicio_principal = Column(String)
    fecha = Column(DateTime)
    work_order = Column(String)
    tecnico_asignado = Column(String)

# Nuevos modelos para el query específico
class DBSaleVuelo(Base):
    __tablename__ = "DBSaleVuelo"
    id = Column(Integer, primary_key=True, index=True)
    linea = Column(String(100))
    fecha = Column(String(50))
    station = Column(String(10))
    matricula = Column(String(20))
    vuelo = Column(String(20))
    destino = Column(String(10))
    bitacora = Column(String(50))
    tipoAvion = Column(String(20))
    eta = Column(Integer)
    etd = Column(Integer)
    servcio = Column(String(50))
    remarks = Column(Text)
    supervisor = Column(String(100))
    companyCode = Column(String(10))

class DBTableCompanyCode(Base):
    __tablename__ = "DBTableCompanyCode"
    llave = Column(Integer, primary_key=True, index=True)
    companyCode = Column(String(10))
    razonSocial = Column(String(200))
    comercial = Column(String(100))
    tipoPersona = Column(String(50))
    moneda = Column(String(5))
    producto = Column(String(50))
    estatus = Column(Integer)
    usuarioRegistro = Column(String(40))
    fechaRegistro = Column(Integer)
    horaRegistro = Column(Integer)
    rfc = Column(String(25))

class DBTableAirlineCode(Base):
    __tablename__ = "DBTableAirlineCode"
    llave = Column(Integer, primary_key=True, index=True)
    linea = Column(String(100))
    nombre = Column(String(100))
    callSign = Column(String(100))
    pais = Column(String(100))
    companyCode = Column(String(10))
    keyObjectId = Column(String(25))
    objectKeyValue = Column(String(25))
    objectKeyIndex = Column(Integer)