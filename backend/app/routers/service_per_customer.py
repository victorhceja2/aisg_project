from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ServicePerCustomer
from pydantic import BaseModel
from typing import Optional
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
            query = query.filter(ServicePerCustomer.fuselage_type.ilike(f"%{fuselage_type}%"))
        return query.all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener registros: {str(e)}")

@router.post("/")
def create_item(data: ServiceCustomerIn, db: Session = Depends(get_db)):
    try:
        obj = ServicePerCustomer(**data.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        print(f"Registro creado con ID: {obj.id_service_per_customer}")
        print(f"create_at: {obj.create_at}")
        print(f"updated_at: {obj.updated_at}")
        return obj
    except Exception as e:
        db.rollback()
        print(f"Error al crear registro: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear registro: {str(e)}")

@router.get("/{id}")
def get_item(id: int, db: Session = Depends(get_db)):
    try:
        item = db.query(ServicePerCustomer).filter(ServicePerCustomer.id_service_per_customer == id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener registro: {str(e)}")

@router.put("/{id}")
def update_item(id: int, data: ServiceCustomerIn, db: Session = Depends(get_db)):
    try:
        item = db.query(ServicePerCustomer).filter(ServicePerCustomer.id_service_per_customer == id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        for field, value in data.dict().items():
            setattr(item, field, value)
        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar registro: {str(e)}")

@router.delete("/{id}")
def delete_item(id: int, db: Session = Depends(get_db)):
    try:
        item = db.query(ServicePerCustomer).filter(ServicePerCustomer.id_service_per_customer == id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        db.delete(item)
        db.commit()
        return {"message": "Registro eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar registro: {str(e)}")

@router.get("/dropdown/companies")
def get_companies(db: Session = Depends(get_db)):
    try:
        sql = text("""
            SELECT DISTINCT
                companyCode AS company_code,
                companyName AS company_name,
                llave AS company_llave
            FROM DBTableEstCompanyCode
            ORDER BY companyName
        """)
        result = db.execute(sql)
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener compañías: {str(e)}")

@router.get("/dropdown/clients")
def get_clients(company_code: str = Query(..., description="Código de la compañía"), db: Session = Depends(get_db)):
    try:
        sql = text("""
            SELECT DISTINCT
                cc.companyCode AS company_code,
                cc.companyName AS company_name,
                cc.llave AS company_llave,
                ac.nombre AS airline_name,
                ac.linea AS airline_code,
                ac.llave AS airline_llave,
                ch.noCliente AS client_code,
                ch.razonSocial AS client_name,
                ch.estatus AS client_status,
                ch.llave AS client_llave
            FROM DBTableDtClienteHeader AS ch
            INNER JOIN DBTableEstCompanyCode AS cc ON ch.companyCode = cc.companyCode
            INNER JOIN DBTableAirlineCode AS ac ON ch.noCliente = ac.linea
            WHERE cc.companyCode = :company_code
            ORDER BY ac.nombre ASC;
        """)
        result = db.execute(sql, {"company_code": company_code})
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener airlines: {str(e)}")