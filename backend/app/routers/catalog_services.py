# backend/app/routers/catalog_services.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import CatalogService
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

router = APIRouter()

class CatalogServiceIn(BaseModel):
    name: str
    description: str
    status: str

@router.get("/catalog/services")
def get_services(db: Session = Depends(get_db)):
    return db.query(CatalogService).all()

@router.post("/catalog/services")
def create_service(service: CatalogServiceIn, db: Session = Depends(get_db)):
    new_service = CatalogService(**service.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


# backend/app/routers/catalog_service_classification.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceClassification
from app.database import get_db

router = APIRouter()

class ClassificationIn(BaseModel):
    name: str
    status: str

@router.get("/catalog/service-classifications")
def get_classifications(db: Session = Depends(get_db)):
    return db.query(CatalogServiceClassification).all()

@router.post("/catalog/service-classifications")
def create_classification(item: ClassificationIn, db: Session = Depends(get_db)):
    obj = CatalogServiceClassification(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# backend/app/routers/catalog_service_status.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import CatalogServiceStatus
from app.database import get_db

router = APIRouter()

class StatusIn(BaseModel):
    name: str

@router.get("/catalog/service-status")
def get_statuses(db: Session = Depends(get_db)):
    return db.query(CatalogServiceStatus).all()

@router.post("/catalog/service-status")
def create_status(item: StatusIn, db: Session = Depends(get_db)):
    obj = CatalogServiceStatus(**item.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# backend/app/routers/service_per_customer.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ServicePerCustomer
from app.database import get_db

router = APIRouter()

class ServiceCustomerIn(BaseModel):
    customer_id: int
    service_id: int

@router.get("/catalog/service-per-customer")
def get_all(db: Session = Depends(get_db)):
    return db.query(ServicePerCustomer).all()

@router.post("/catalog/service-per-customer")
def create_item(data: ServiceCustomerIn, db: Session = Depends(get_db)):
    obj = ServicePerCustomer(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# backend/app/routers/extra_company_configuration.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ExtraCompanyConfiguration
from app.database import get_db

router = APIRouter()

class ConfigIn(BaseModel):
    company_id: int
    key: str
    value: str

@router.get("/catalog/extra-company-configuration")
def get_all(db: Session = Depends(get_db)):
    return db.query(ExtraCompanyConfiguration).all()

@router.post("/catalog/extra-company-configuration")
def create_item(data: ConfigIn, db: Session = Depends(get_db)):
    obj = ExtraCompanyConfiguration(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# backend/app/routers/extra_service_sale_assignment.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ExtraServiceSaleAssignment
from app.database import get_db

router = APIRouter()

class SaleAssignIn(BaseModel):
    sale_id: int
    service_id: int

@router.get("/catalog/extra-service-sale-assignment")
def get_all(db: Session = Depends(get_db)):
    return db.query(ExtraServiceSaleAssignment).all()

@router.post("/catalog/extra-service-sale-assignment")
def create_item(data: SaleAssignIn, db: Session = Depends(get_db)):
    obj = ExtraServiceSaleAssignment(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
