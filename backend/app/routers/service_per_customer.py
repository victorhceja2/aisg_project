from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ServicePerCustomer
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Agregar imports para SQL crudo
from sqlalchemy import text

router = APIRouter(prefix="/catalog/service-per-customer", tags=["ServicePerCustomer"])


class ServiceCustomerIn(BaseModel):
    id_service: int
    id_client: int
    id_company: int
    minutes_included: int
    minutes_minimum: int
    fuselage_type: str
    technicians_included: int
    whonew: Optional[str] = "system"


@router.get("/")
def get_all(fuselage_type: str = None, db: Session = Depends(get_db)):
    try:
        query = db.query(ServicePerCustomer)
        if fuselage_type:
            query = query.filter(
                ServicePerCustomer.fuselage_type.ilike(f"%{fuselage_type}%")
            )
        return query.all()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener registros: {str(e)}"
        )


@router.post("/")
def create_item(data: ServiceCustomerIn, db: Session = Depends(get_db)):
    try:
        # Crear el objeto ServicePerCustomer - SQLAlchemy se encargará de los timestamps automáticamente
        obj = ServicePerCustomer(
            id_service=data.id_service,
            id_client=data.id_client,
            id_company=data.id_company,
            minutes_included=data.minutes_included,
            minutes_minimum=data.minutes_minimum,
            fuselage_type=data.fuselage_type,
            technicians_included=data.technicians_included,
            whonew=data.whonew or "system",
            # NO especificar create_at ni updated_at - SQLAlchemy los maneja automáticamente
        )

        db.add(obj)
        db.commit()
        db.refresh(obj)

        # Log para debugging
        print(f"Registro creado con ID: {obj.id_service_per_customer}")
        print(f"create_at: {obj.create_at}")
        print(f"updated_at: {obj.updated_at}")

        return obj
    except Exception as e:
        db.rollback()
        print(f"Error al crear registro: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error al crear registro: {str(e)}"
        )


@router.get("/{id}")
def get_item(id: int, db: Session = Depends(get_db)):
    try:
        item = (
            db.query(ServicePerCustomer)
            .filter(ServicePerCustomer.id_service_per_customer == id)
            .first()
        )
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener registro: {str(e)}"
        )


@router.put("/{id}")
def update_item(id: int, data: ServiceCustomerIn, db: Session = Depends(get_db)):
    try:
        item = (
            db.query(ServicePerCustomer)
            .filter(ServicePerCustomer.id_service_per_customer == id)
            .first()
        )
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")

        # Actualizar campos - updated_at se actualizará automáticamente por onupdate
        item.id_service = data.id_service
        item.id_client = data.id_client
        item.id_company = data.id_company
        item.minutes_included = data.minutes_included
        item.minutes_minimum = data.minutes_minimum
        item.fuselage_type = data.fuselage_type
        item.technicians_included = data.technicians_included
        item.whonew = data.whonew or "system"

        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error al actualizar registro: {str(e)}"
        )


@router.delete("/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    try:
        item = (
            db.query(ServicePerCustomer)
            .filter(ServicePerCustomer.id_service_per_customer == id)
            .first()
        )
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")

        db.delete(item)
        db.commit()
        return {"message": "Registro eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error al eliminar registro: {str(e)}"
        )


# --- NUEVO ENDPOINT PARA DROPDOWNS DE COMPANY Y CLIENT (AIRLINE) ---


@router.get("/dropdown/companies")
def get_companies(db: Session = Depends(get_db)):
    """
    Devuelve la lista de compañías (company) distintas de la tabla DBTableEstCompanyCode.
    """
    try:
        sql = text(
            """
            SELECT DISTINCT
                companyCode AS company_code,
                companyName AS company_name,
                llave AS company_llave
            FROM DBTableEstCompanyCode
            ORDER BY companyName
        """
        )
        result = db.execute(sql)
        companies = [
            {
                "company_code": row.company_code,
                "company_name": row.company_name,
                "company_llave": row.company_llave,
            }
            for row in result
        ]
        return companies
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener compañías: {str(e)}"
        )


@router.get("/dropdown/clients")
def get_clients(
    company_code: str = Query(..., description="Código de la compañía"),
    db: Session = Depends(get_db),
):
    """
    Devuelve la lista de airlines (clientes) para una compañía específica, incluyendo llaves.
    """
    try:
        sql = text(
            """
SELECT DISTINCT
    cc.companyCode            AS company_code,
    cc.companyName            AS company_name,
    cc.llave                  AS company_llave,
    ac.nombre                 AS airline_name,
    ac.linea                  AS airline_code,
    ac.llave                  AS airline_llave,
    ch.noCliente              AS client_code,
    ch.razonSocial            AS client_name,
    ch.estatus                AS client_status,
    ch.llave                  AS client_llave
FROM DBTableDtClienteHeader AS ch
INNER JOIN DBTableEstCompanyCode AS cc
    ON ch.companyCode = cc.companyCode
INNER JOIN DBTableAirlineCode AS ac
    ON ch.noCliente = ac.linea
WHERE cc.companyCode = :company_code
ORDER BY ac.nombre ASC;
            """
        )
        result = db.execute(sql, {"company_code": company_code})
        clients = [
            {
                "company_code": row.company_code,
                "company_name": row.company_name,
                "company_llave": row.company_llave,
                "airline_name": row.airline_name,
                "airline_code": row.airline_code,
                "airline_llave": row.airline_llave,
                "client_code": row.client_code,
                "client_name": row.client_name,
                "client_status": row.client_status,
                "client_llave": row.client_llave
            }
            for row in result
        ]
        return clients
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener airlines: {str(e)}"
        )