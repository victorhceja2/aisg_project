from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer, cast, String, literal_column, text
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import ServiceExecution, CatalogService, Cliente, DBTableCompany, DBTableAvion, DBtableUserHeader, ExtraServiceSaleAssignment
from ..schemas_reports import ServiceExecutionResponse, OperationReportResponse, OperationReportV2Response, ServicesReportResponse

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
        count = db.query(ServiceExecution).count()
        return {"total_count": count}
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
        # Contar directamente de ServiceExecution
        count_query = "SELECT COUNT(*) as total FROM ServiceExecution"
        result = db.execute(count_query).fetchone()
        
        return {"total_count": result.total if result else 0}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el conteo de reportes: {str(e)}")

# NUEVO ENDPOINT V2 para el query específico - SOLO CONSULTA SIN FILTROS
@router.get("/operation-reports-v2", response_model=List[OperationReportV2Response])
async def get_operation_reports_v2(db: Session = Depends(get_db)):
    """
    Obtiene el reporte de operaciones ejecutando el query exacto proporcionado
    Solo consulta, sin filtros de búsqueda (la búsqueda se hace en el frontend)
    """
    try:
        # Query SQL exacto como se proporcionó - SIN FILTROS
        sql_query = """
        SELECT TOP 1000
            cc.razonSocial AS COMPANY,
            cc.llave as LLAVE,
            v.linea AS AIRLINE,
            v.fecha AS [DATE],
            v.station AS STATION,
            v.matricula AS [AC REG],
            v.vuelo AS FLIGTH,
            v.destino AS DEST,
            v.bitacora AS [LOG BOOK],
            v.tipoAvion AS [A/C TYPE],
            FORMAT(DATEADD(SECOND, v.eta, '1970-01-01'), 'HH:mm') AS [START TIME],
            FORMAT(DATEADD(SECOND, v.etd, '1970-01-01'), 'HH:mm') AS [END TIME],
            v.servcio AS [SERV PR],
            FORMAT(DATEADD(SECOND, v.etd - v.eta, '1970-01-01'), 'HH:mm') AS [ON GND],
            cs.service_name AS SERV1,
            cs.service_description AS SERV2,
            cs.service_code AS SERV3,
            cst.service_type_name AS SERV4,
            csc.service_classification_name AS SERV5,
            cs.service_technicians_included AS SERV6,
            v.remarks AS REMARKS,
            v.supervisor AS TECHNICIAN
        FROM DBSaleVuelo v
        LEFT JOIN DBTableCompanyCode cc
            ON cc.companyCode = v.companyCode
        LEFT JOIN CatalogServices cs
            ON TRY_CAST(v.servcio AS INT) = cs.id_service
        LEFT JOIN CatalogServiceType cst
            ON cs.id_service_type = cst.id_service_type
        LEFT JOIN CatalogServiceClassification csc
            ON cs.id_service_classification = csc.id_service_classification
        ORDER BY v.fecha DESC
        """
        
        # Ejecutar query sin parámetros
        result = db.execute(text(sql_query)).fetchall()
        
        # Convertir resultados al formato esperado por el frontend
        reports = []
        for row in result:
            report_data = {
                "COMPANY": row[0],  # cc.razonSocial AS COMPANY
                "LLAVE": row[1] if row[1] is not None else None,  # cc.llave as llave
                "AIRLINE": row[2],  # v.linea AS AIRLINE
                "DATE": row[3],  # v.fecha AS [DATE]
                "STATION": row[4],  # v.station AS STATION (CORREGIDO - era row[3])
                "AC_REG": row[5],  # v.matricula AS [AC REG]
                "FLIGTH": row[6],  # v.vuelo AS FLIGTH
                "DEST": row[7],  # v.destino AS DEST
                "LOG_BOOK": row[8],  # v.bitacora AS [LOG BOOK]
                "AC_TYPE": row[9],  # v.tipoAvion AS [A/C TYPE]
                "START_TIME": row[10],  # FORMAT(...) AS [START TIME]
                "END_TIME": row[11],  # FORMAT(...) AS [END TIME]
                "SERV_PR": row[12],  # v.servcio AS [SERV PR]
                "ON_GND": row[13],  # FORMAT(...) AS [ON GND]
                "SERV1": row[14],  # cs.service_name AS SERV1
                "SERV2": row[15],  # cs.service_description AS SERV2
                "SERV3": row[16],  # cs.service_code AS SERV3
                "SERV4": row[17],  # cst.service_type_name AS SERV4
                "SERV5": row[18],  # csc.service_classification_name AS SERV5
                "SERV6": str(row[19]) if row[19] is not None else None,  # cs.service_technicians_included AS SERV6
                "REMARKS": row[20],  # v.remarks AS REMARKS
                "TECHNICIAN": row[21]  # v.supervisor AS TECHNICIAN
            }
            reports.append(report_data)
        
        return reports
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reportes de operación v2: {str(e)}")

# NUEVO ENDPOINT para Services Report
@router.get("/services-reports", response_model=List[ServicesReportResponse])
async def get_services_reports(db: Session = Depends(get_db)):
    """
    Obtiene el reporte de servicios ejecutando el query específico con mapeo de servicios
    Solo consulta, sin filtros de búsqueda (la búsqueda se hace en el frontend)
    """
    try:
        # Query SQL exacto como se proporcionó con CTE para mapeo de servicios
        sql_query = """
        WITH ServicioMap AS (
            SELECT 'P' AS servcio, 'RIPQ' AS service_code
            UNION ALL SELECT 'R', 'ROPQ'
            UNION ALL SELECT 'T', 'TRPQ'
            UNION ALL SELECT 'X', 'SV3'
        )
        SELECT TOP 1000
            cc.razonSocial AS COMPANY,
            cc.llave AS LLAVE,
            v.linea AS AIRLINE,
            v.fecha AS [DATE],
            v.station AS STATION,
            v.matricula AS [AC REG],
            v.vuelo AS FLIGHT,
            v.tipoAvion AS [A/C TYPE],
            FORMAT(DATEADD(SECOND, v.eta, '1970-01-01'), 'HH:mm') AS [START TIME],
            FORMAT(DATEADD(SECOND, v.etd, '1970-01-01'), 'HH:mm') AS [END TIME],
            FORMAT(DATEADD(SECOND, v.etd - v.eta, '1970-01-01'), 'HH:mm') AS [ON GND],
            cs.service_name AS SERVICE,
            v.bitacora AS [WORK REFERENCE],
            v.supervisor AS TECHNICIAN
        FROM DBSaleVuelo v
        LEFT JOIN DBTableCompanyCode cc
            ON cc.companyCode = v.companyCode
        LEFT JOIN ServicioMap sm
            ON v.servcio = sm.servcio
        LEFT JOIN CatalogServices cs
            ON sm.service_code = cs.service_code
        ORDER BY v.fecha DESC
        """
        
        # Ejecutar query
        result = db.execute(text(sql_query)).fetchall()
        
        # Convertir resultados al formato esperado por el frontend
        reports = []
        for row in result:
            report_data = {
                "COMPANY": row[0],  # cc.razonSocial AS COMPANY
                "LLAVE": row[1] if row[1] is not None else None,  # cc.llave AS LLAVE
                "AIRLINE": row[2],  # v.linea AS AIRLINE
                "DATE": row[3],  # v.fecha AS [DATE]
                "STATION": row[4],  # v.station AS STATION
                "AC_REG": row[5],  # v.matricula AS [AC REG]
                "FLIGHT": row[6],  # v.vuelo AS FLIGHT
                "AC_TYPE": row[7],  # v.tipoAvion AS [A/C TYPE]
                "START_TIME": row[8],  # FORMAT(...) AS [START TIME]
                "END_TIME": row[9],  # FORMAT(...) AS [END TIME]
                "ON_GND": row[10],  # FORMAT(...) AS [ON GND]
                "SERVICE": row[11],  # cs.service_name AS SERVICE
                "WORK_REFERENCE": row[12],  # v.bitacora AS [WORK REFERENCE]
                "TECHNICIAN": row[13]  # v.supervisor AS TECHNICIAN
            }
            reports.append(report_data)
        
        return reports
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reportes de servicios: {str(e)}")