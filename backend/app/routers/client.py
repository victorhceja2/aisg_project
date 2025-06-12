from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import Cliente
from app.schemas_clients import ClientWithCompanyDetailsResponse
from typing import List  # Importar List para las anotaciones de tipo

router = APIRouter(
    prefix="/catalog/clients",
    tags=["Clients"]
)

@router.get("/")
def get_clients(db: Session = Depends(get_db)):
    return db.query(Cliente).all()

@router.get("/{client_id}")
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Cliente).filter(Cliente.llave == client_id).first()
    if not client:
        return {"error": "Client not found"}
    return client

@router.get("/details-with-company", response_model=List[ClientWithCompanyDetailsResponse])
def get_clients_with_company_details(db: Session = Depends(get_db)) -> List[ClientWithCompanyDetailsResponse]:
    """
    Obtiene una lista de clientes activos (estatus=1) con detalles de su compañía asociada.
    """
    sql_query = """
    SELECT 
        c.noCliente,
        c.nombre,
        c.razonSocial,
        c.rfc,
        c.taxId,
        c.moneda AS monedaCliente,
        c.lineaCredito,
        c.saldo,
        c.jerarquia,
        e.companyName,
        e.moneda AS monedaEmpresa,
        e.fiel,
        e.direccion1,
        e.direccion2,
        e.codigoPostal,
        e.municipio,
        e.estado,
        e.pais
    FROM 
        DBTableCliente c
    INNER JOIN 
        DBTableCompany e ON c.companyCode = e.companyCode
    WHERE 
        c.estatus = 1
    ORDER BY
        c.nombre ASC;
    """
    try:
        result = db.execute(text(sql_query)).fetchall()
        clients_details: List[ClientWithCompanyDetailsResponse] = []
        for row in result:
            clients_details.append(ClientWithCompanyDetailsResponse(
                noCliente=row.noCliente,
                nombre=row.nombre,
                razonSocial=row.razonSocial,
                rfc=row.rfc,
                taxId=row.taxId,
                monedaCliente=row.monedaCliente,
                lineaCredito=row.lineaCredito,
                saldo=row.saldo,
                jerarquia=row.jerarquia,
                companyName=row.companyName,
                monedaEmpresa=row.monedaEmpresa,
                fiel=row.fiel,
                direccion1=row.direccion1,
                direccion2=row.direccion2,
                codigoPostal=row.codigoPostal,
                municipio=row.municipio,
                estado=row.estado,
                pais=row.pais
            ))
        return clients_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener detalles de clientes y compañías: {str(e)}")