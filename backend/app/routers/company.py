from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Company
from ..schemas_company import CompanyResponse

router = APIRouter(
    prefix="/companies",
    tags=["companies"]
)

@router.get("/", response_model=List[CompanyResponse])
async def get_companies(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las compañías para dropdown
    """
    try:
        companies = db.query(Company).all()
        print(f"Número de compañías encontradas: {len(companies)}")
        if companies:
            print(f"Primera compañía: {companies[0].__dict__}")
        
        # Convertir cada objeto SQLAlchemy a dict para evitar problemas de serialización
        companies_data = []
        for company in companies:
            company_dict = {
                "companyCode": company.companyCode,
                "companyName": company.companyName,
                "moneda": company.moneda,
                "fiel": company.fiel,
                "taxId": company.taxId,
                "direccion1": company.direccion1,
                "direccion2": company.direccion2,
                "direccion3": company.direccion3,
                "direccion4": company.direccion4,
                "direccion5": company.direccion5,
                "codigoPostal": company.codigoPostal,
                "municipio": company.municipio,
                "estado": company.estado,
                "pais": company.pais
            }
            companies_data.append(company_dict)
        
        return companies_data
    except Exception as e:
        print(f"Error detallado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener las compañías: {str(e)}")