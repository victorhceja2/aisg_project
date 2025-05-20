from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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
    id_service_classification = Column(Integer, primary_key=True, index=True)
    service_classification_name = Column(String(100), nullable=False)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CatalogService(Base):
    __tablename__ = "CatalogServices"
    id_service = Column(Integer, primary_key=True, index=True)
    id_service_status = Column(Integer, ForeignKey("CatalogServiceStatus.id_service_status"), nullable=False)
    id_service_classification = Column(Integer, ForeignKey("CatalogServiceClassification.id_service_classification"), nullable=False)
    service_code = Column(String(50), nullable=False)
    service_name = Column(String(150), nullable=False)
    service_description = Column(String(500))
    service_aircraft_type = Column(Boolean, default=False)
    service_by_time = Column(Boolean, default=False)
    min_time_configured = Column(Boolean, default=False)
    service_technicians_included = Column(Boolean, default=False)
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
    applies_detail = Column(Boolean, default=False)
    status = Column(Boolean, default=True)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ExtraServiceSaleAssignment(Base):
    __tablename__ = "ExtraServiceSaleAssignment"
    id_xtra_sale_employee = Column(Integer, primary_key=True, index=True)
    id_service_per_customer = Column(Integer, ForeignKey("ServicePerCustomer.id_service_per_customer"), nullable=False)
    id_sale_flight = Column(Integer, nullable=False)
    id_sale_employee = Column(Integer, nullable=False)
    sale_employee_deleted = Column(Boolean, default=False)
    work_order = Column(String(100))
    status = Column(Boolean, default=True)
    whonew = Column(String(100))
    create_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Nuevos modelos para los catálogos adicionales

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