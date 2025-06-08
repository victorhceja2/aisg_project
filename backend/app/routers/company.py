from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import text
from ..database import get_db
from ..schemas_company import CompanyResponse, AirlineResponse
from ..models import DBTableCompany, DBTableCompanyCode, DBTableAirlineCode

router = APIRouter(
    prefix="/companies",
    tags=["companies"]
)

@router.get("/", response_model=List[CompanyResponse])
async def get_companies(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las compañías para dropdown,
    solo aquellas que tengan relación en ambas tablas por companyCode y taxId = rfc.
    """
    try:
        companies = (
            db.query(
                DBTableCompany.companyCode,
                DBTableCompany.companyName,
                DBTableCompany.moneda.label("MonedaEmpresa"),
                DBTableCompany.taxId.label("RFC_En_Company"),
                DBTableCompanyCode.razonSocial.label("RazonSocial_En_CompanyCode"),
                DBTableCompanyCode.comercial.label("NombreComercial"),
                DBTableCompanyCode.tipoPersona.label("TipoPersona"),
                DBTableCompanyCode.moneda.label("MonedaEnCompanyCode"),
                DBTableCompanyCode.producto.label("Producto"),
                DBTableCompanyCode.estatus.label("Estatus"),
                DBTableCompanyCode.usuarioRegistro.label("UsuarioRegistro"),
                DBTableCompanyCode.fechaRegistro.label("FechaRegistro"),
                DBTableCompanyCode.horaRegistro.label("HoraRegistro"),
                DBTableCompanyCode.llave.label("Llave"),
            )
            .join(
                DBTableCompanyCode,
                (DBTableCompany.companyCode == DBTableCompanyCode.companyCode) &
                (DBTableCompany.taxId == DBTableCompanyCode.rfc)
            )
            .all()
        )

        companies_data = []
        for company in companies:
            companies_data.append({
                "companyCode": company.companyCode,
                "companyName": company.companyName,
                "MonedaEmpresa": company.MonedaEmpresa,
                "RFC_En_Company": company.RFC_En_Company,
                "RazonSocial_En_CompanyCode": company.RazonSocial_En_CompanyCode,
                "NombreComercial": company.NombreComercial,
                "TipoPersona": company.TipoPersona,
                "MonedaEnCompanyCode": company.MonedaEnCompanyCode,
                "Producto": company.Producto,
                "Estatus": company.Estatus,
                "UsuarioRegistro": company.UsuarioRegistro,
                "FechaRegistro": company.FechaRegistro,
                "HoraRegistro": company.HoraRegistro,
                "Llave": company.Llave,
            })

        return companies_data

    except Exception as e:
        print(f"Error en get_companies: {str(e)}")
        # Devolver lista vacía si hay error
        return []

@router.get("/airlines", response_model=List[AirlineResponse])
async def get_airlines(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las aerolíneas para dropdown desde DBTableAirlineCode.
    """
    try:
        airlines = db.query(DBTableAirlineCode).all()

        airlines_data = []
        for airline in airlines:
            airlines_data.append({
                "llave": airline.llave,
                "linea": airline.linea,
                "nombre": airline.nombre,
                "callSign": airline.callSign,
                "pais": airline.pais,
                "companyCode": airline.companyCode,
                "keyObjectId": airline.keyObjectId,
                "objectKeyValue": airline.objectKeyValue,
                "objectKeyIndex": airline.objectKeyIndex,
            })

        return airlines_data

    except Exception as e:
        print(f"Error en get_airlines: {str(e)}")
        # Devolver lista vacía si hay error
        return []