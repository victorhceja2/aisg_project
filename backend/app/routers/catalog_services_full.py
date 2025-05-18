from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models

router = APIRouter()

@router.get("/catalog-services/full")
def get_catalog_services_full(db: Session = Depends(get_db)):
    results = db.query(models.CatalogServices).options(
        joinedload(models.CatalogServices.status),
        joinedload(models.CatalogServices.classification),
        joinedload(models.CatalogServices.category),
        joinedload(models.CatalogServices.type),
        joinedload(models.CatalogServices.include)
    ).all()

    response = []
    for item in results:
        response.append({
            "id_service": item.id_service,
            "service_code": item.service_code,
            "service_name": item.service_name,
            "service_description": item.service_description,
            "aircraft_type": item.service_aircraft_type,
            "by_time": item.service_by_time,
            "min_time_configured": item.min_time_configured,
            "technicians_included": item.service_technicians_included,
            "status": {
                "id": item.id_service_status,
                "name": item.status.status_name if item.status else None
            },
            "classification": {
                "id": item.id_service_classification,
                "name": item.classification.service_classification_name if item.classification else None
            },
            "category": {
                "id": item.id_service_category,
                "name": item.category.service_category_name if item.category else None
            },
            "type": {
                "id": item.id_service_type,
                "name": item.type.service_type_name if item.type else None
            },
            "include": {
                "id": item.id_service_include,
                "name": item.include.service_include if item.include else None
            },
            "whonew": item.whonew,
            "create_at": item.create_at,
            "updated_at": item.updated_at
        })

    return response
