from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer, cast, String, literal_column
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import ServiceExecution, CatalogService, Cliente, Company, DBTableAvion, DBtableUserHeader, ExtraServiceSaleAssignment
from ..schemas_reports import ServiceExecutionResponse, OperationReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/service-executions", response_model=List[ServiceExecutionResponse])
async def get_service_executions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Límite de registros a retornar")
):
    """
    Obtiene la lista de ejecuciones de servicios con datos relacionados mediante LEFT JOINs
    """
    try:
        # Query simplificada sin CAST para evitar errores de conversión
        query = db.query(
            ServiceExecution.id,
            ServiceExecution.id_service,
            ServiceExecution.id_client,
            ServiceExecution.id_company,
            ServiceExecution.fuselage_type,
            ServiceExecution.id_avion,
            ServiceExecution.id_user,
            ServiceExecution.work_order,
            ServiceExecution.whonew,
            ServiceExecution.create_at,
            ServiceExecution.updated_at,
            # Solo JOIN con CatalogService que sí tiene relación directa
            CatalogService.service_name
        ).select_from(ServiceExecution)\
        .outerjoin(CatalogService, ServiceExecution.id_service == CatalogService.id_service)
        
        # Aplicar paginación y ordenamiento
        service_executions = query.order_by(ServiceExecution.create_at.desc()).offset(skip).limit(limit).all()
        
        # Convertir a formato de respuesta
        result = []
        for row in service_executions:
            result.append({
                "id": row.id,
                "id_service": row.id_service,
                "id_client": row.id_client,
                "id_company": row.id_company,
                "fuselage_type": row.fuselage_type,
                "id_avion": row.id_avion,
                "id_user": row.id_user,
                "work_order": row.work_order,
                "whonew": row.whonew,
                "create_at": row.create_at,
                "updated_at": row.updated_at,
                # Solo service_name por ahora
                "service_name": row.service_name,
                "client_name": None,  # Por ahora None hasta resolver las relaciones
                "company_name": None,
                "aircraft_model": None
            })
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener las ejecuciones de servicios: {str(e)}")

@router.get("/service-executions/count")
async def get_service_executions_count(db: Session = Depends(get_db)):
    """
    Obtiene el conteo total de ejecuciones de servicios
    """
    try:
        total_count = db.query(ServiceExecution).count()
        return {"total_count": total_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el conteo: {str(e)}")

# Endpoint ULTRASIMPLIFICADO para reportes de operación - SIN UNIONES
@router.get("/operation-reports", response_model=List[OperationReportResponse])
async def get_operation_reports(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Límite de registros a retornar")
):
    """
    Obtiene la lista de reportes de operación sin filtros obligatorios
    """
    try:
        # Consulta extremadamente simplificada - sin TOP, solo OFFSET y FETCH
        sql_query = """
        SELECT 
            id,
            id_client, 
            fuselage_type,
            id_service,
            create_at,
            work_order,
            id_user
        FROM 
            ServiceExecution 
        ORDER BY 
            create_at DESC
        OFFSET :offset ROWS
        FETCH NEXT :limit ROWS ONLY
        """
        
        # Ejecutar consulta SQL directa
        result = db.execute(sql_query, {"offset": skip, "limit": limit}).fetchall()
        
        # Convertir los resultados a diccionarios, obteniendo datos adicionales por separado
        results = []
        for row in result:
            # Datos básicos del resultado con valores por defecto
            report_dict = {
                "id": row.id,
                "cliente": "Sin cliente",  # Valor por defecto en lugar de None
                "fuselage_type": row.fuselage_type,
                "servicio_principal": "Sin servicio",  # Valor por defecto en lugar de None
                "fecha": row.create_at,
                "work_order": row.work_order,
                "tecnico_asignado": "Sin asignar"  # Valor por defecto en lugar de None
            }
            
            # Intentar obtener datos adicionales uno por uno, manejando errores de forma independiente
            try:
                # Obtener nombre del cliente
                if row.id_client:
                    cliente_query = "SELECT nombre FROM DBTableCliente WHERE llave = :cliente_id"
                    cliente_result = db.execute(cliente_query, {"cliente_id": str(row.id_client)}).fetchone()
                    if cliente_result:
                        report_dict["cliente"] = cliente_result[0]
            except Exception:
                pass  # Mantener valor por defecto "Sin cliente"
                
            try:
                # Obtener nombre del servicio
                if row.id_service:
                    service_query = "SELECT service_name FROM CatalogServices WHERE id_service = :service_id"
                    service_result = db.execute(service_query, {"service_id": row.id_service}).fetchone()
                    if service_result:
                        report_dict["servicio_principal"] = service_result[0]
            except Exception:
                pass  # Mantener valor por defecto "Sin servicio"
                
            try:
                # Obtener nombre del técnico
                if row.id_user:
                    user_query = "SELECT userName FROM DBtableUserHeader WHERE userId = :user_id"
                    user_result = db.execute(user_query, {"user_id": row.id_user}).fetchone()
                    if user_result:
                        report_dict["tecnico_asignado"] = user_result[0]
            except Exception:
                pass  # Mantener valor por defecto "Sin asignar"
                
            # Añadir a la lista de resultados
            results.append(report_dict)
            
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los reportes de operación: {str(e)}")

@router.get("/operation-reports/count")
async def get_operation_reports_count(db: Session = Depends(get_db)):
    """
    Obtiene el conteo total de reportes de operación
    """
    try:
        # Consulta extremadamente simplificada para el conteo
        sql_query = """
        SELECT COUNT(id) FROM ServiceExecution
        """
        
        # Ejecutar consulta SQL directa
        result = db.execute(sql_query).scalar()
        
        return {"total_count": result or 0}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el conteo: {str(e)}")