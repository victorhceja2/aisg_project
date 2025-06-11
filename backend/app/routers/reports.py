from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer, cast, String, literal_column, text
from typing import List, Optional
from datetime import datetime, timedelta, date, time # Asegurar que time esté importado

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
            CatalogService.service_name
        ).select_from(ServiceExecution)\
        .outerjoin(CatalogService, ServiceExecution.id_service == CatalogService.id_service)
        
        service_executions = query.order_by(ServiceExecution.create_at.desc()).offset(skip).limit(limit).all()
        
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
                "service_name": row.service_name,
                "client_name": None,
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
        
        result = db.execute(text(sql_query), {"offset": skip, "limit": limit}).fetchall()
        
        results = []
        for row_proxy in result:
            row = dict(row_proxy._mapping)
            report_dict = {
                "id": row.get("id"),
                "cliente": "Sin cliente",
                "fuselage_type": row.get("fuselage_type"),
                "servicio_principal": "Sin servicio",
                "fecha": row.get("create_at"),
                "work_order": row.get("work_order"),
                "tecnico_asignado": "Sin asignar"
            }
            
            try:
                if row.get("id_client"):
                    cliente_query = "SELECT nombre FROM DBTableCliente WHERE llave = :cliente_id"
                    cliente_result = db.execute(text(cliente_query), {"cliente_id": str(row.get("id_client"))}).fetchone()
                    if cliente_result:
                        report_dict["cliente"] = cliente_result[0]
            except Exception:
                pass
                
            try:
                if row.get("id_service"):
                    service_query = "SELECT service_name FROM CatalogServices WHERE id_service = :service_id"
                    service_result = db.execute(text(service_query), {"service_id": row.get("id_service")}).fetchone()
                    if service_result:
                        report_dict["servicio_principal"] = service_result[0]
            except Exception:
                pass
                
            try:
                if row.get("id_user"):
                    user_query = "SELECT userName FROM DBtableUserHeader WHERE userId = :user_id"
                    user_result = db.execute(text(user_query), {"user_id": row.get("id_user")}).fetchone()
                    if user_result:
                        report_dict["tecnico_asignado"] = user_result[0]
            except Exception:
                pass
                
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
        count_query = "SELECT COUNT(*) as total FROM ServiceExecution"
        result = db.execute(text(count_query)).fetchone()
        
        return {"total_count": result.total if result else 0}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el conteo de reportes: {str(e)}")

@router.get("/operation-reports-v2", response_model=List[OperationReportV2Response])
async def get_operation_reports_v2(db: Session = Depends(get_db)):
    """
    Obtiene el reporte de operaciones ejecutando el query exacto proporcionado
    """
    try:
        sql_query = """
WITH servicios_pivot AS (
    SELECT
        id_sale_employee,
        id_sale_flight,
        MAX(CASE WHEN rn = 1 THEN service_name END) AS SERV1,
        MAX(CASE WHEN rn = 2 THEN service_name END) AS SERV2,
        MAX(CASE WHEN rn = 3 THEN service_name END) AS SERV3,
        MAX(CASE WHEN rn = 4 THEN service_name END) AS SERV4,
        MAX(CASE WHEN rn = 5 THEN service_name END) AS SERV5,
        MAX(CASE WHEN rn = 6 THEN service_name END) AS SERV6,
        MAX(CASE WHEN rn = 1 THEN service_description END) AS [SERV PR]
    FROM (
        SELECT
            essa.id_sale_employee,
            essa.id_sale_flight,
            cs.service_name,
            cs.service_description,
            ROW_NUMBER() OVER (
                PARTITION BY essa.id_sale_employee, essa.id_sale_flight
                ORDER BY cs.service_name
            ) AS rn
        FROM aisgProduction.dbo.ExtraServiceSaleAssignment AS essa
        INNER JOIN aisgProduction.dbo.ServicePerCustomer AS spc
            ON essa.id_service_per_customer = spc.id_service_per_customer
        INNER JOIN aisgProduction.dbo.CatalogServices AS cs
            ON spc.id_service = cs.id_service
    ) AS sub
    GROUP BY id_sale_employee, id_sale_flight
)

SELECT
    -- ORDEN PERSONALIZADO
    cc.companyCode AS COMPANY,
    cc.llave AS LLAVE, -- Campo LLAVE agregado
    ac.nombre AS AIRLINE,
    se.fecha AS DATE,
    sv.station AS STATION,
    sv.matricula AS [AC REG],
    sv.vuelo AS FLIGTH,
    sv.destino AS DEST,
    sv.bitacora AS [LOG BOOK],
    sv.avion AS [A/C TYPE],
    se.horaInicio AS [START TIME],
    se.horaFin AS [END TIME],
    sp.[SERV PR],
    (se.horaFin - se.horaInicio) AS [ON GND],
    sp.SERV1, sp.SERV2, sp.SERV3, sp.SERV4, sp.SERV5, sp.SERV6,
    se.remarks AS REMARKS,
    CONCAT(te.paterno, ' ', te.materno, ' ', te.primerNombre, ' ', ISNULL(te.segundoNombre, '')) AS TECHNICIAN

    -- CAMPOS ADICIONALES COMENTADOS
    -- essa.id_xtra_sale_employee,
    -- essa.id_sale_employee,
    -- essa.id_sale_flight,
    -- cc.companyName,
    -- ch.noCliente,
    -- spc.id_client,
    -- spc.id_company,
    -- se.horaInicio,
    -- se.horaFin,
    -- te.paterno,
    -- te.materno,
    -- te.primerNombre,
    -- te.segundoNombre

FROM aisgProduction.dbo.ExtraServiceSaleAssignment AS essa
INNER JOIN aisgProduction.dbo.ServicePerCustomer AS spc
    ON essa.id_service_per_customer = spc.id_service_per_customer
INNER JOIN aisgProduction.dbo.DBTableEstCompanyCode AS cc
    ON spc.id_company = cc.llave
INNER JOIN aisgProduction.dbo.DBSaleEmpleado AS se
    ON essa.id_sale_employee = se.llave
INNER JOIN aisgProduction.dbo.DBTableEmployee AS te
    ON se.empleado = te.numeroNomina
INNER JOIN aisgProduction.dbo.DBSaleVuelo AS sv
    ON essa.id_sale_flight = sv.llave
INNER JOIN aisgProduction.dbo.DBTableDtClienteHeader AS ch
    ON spc.id_client = ch.llave
INNER JOIN aisgProduction.dbo.DBTableAirlineCode AS ac
    ON ch.noCliente = ac.linea
INNER JOIN servicios_pivot AS sp
    ON sp.id_sale_employee = essa.id_sale_employee
   AND sp.id_sale_flight = essa.id_sale_flight

GROUP BY
    cc.companyCode,
    cc.llave, -- Campo LLAVE agregado al GROUP BY
    ac.nombre,
    se.fecha,
    sv.station,
    sv.matricula,
    sv.vuelo,
    sv.destino,
    sv.bitacora,
    sv.avion,
    se.horaInicio,
    se.horaFin,
    sp.[SERV PR],
    sp.SERV1, sp.SERV2, sp.SERV3, sp.SERV4, sp.SERV5, sp.SERV6,
    se.remarks,
    te.paterno, te.materno, te.primerNombre, te.segundoNombre
        """
        
        result = db.execute(text(sql_query)).fetchall()
        
        reports = []

        # Helper para formatear segundos a HH:MM:SS
        def format_seconds_to_hhmmss(total_seconds_val) -> str:
            if not isinstance(total_seconds_val, int):
                # Si no es un entero, no podemos procesarlo como segundos.
                # Devolver como cadena o manejar como error según sea necesario.
                return str(total_seconds_val) 
            
            sign = "-" if total_seconds_val < 0 else ""
            abs_seconds = abs(total_seconds_val)
            
            hours = abs_seconds // 3600
            minutes = (abs_seconds % 3600) // 60
            secs = abs_seconds % 60
            return f"{sign}{hours:02}:{minutes:02}:{secs:02}"

        for row_proxy in result:
            row = dict(row_proxy._mapping)
            
            # Procesamiento de ON GND
            on_gnd_value = row.get("ON GND") # Query alias for ON_GND
            on_gnd_str: Optional[str] = None
            if isinstance(on_gnd_value, timedelta):
                on_gnd_str = format_seconds_to_hhmmss(int(on_gnd_value.total_seconds()))
            elif isinstance(on_gnd_value, int):
                on_gnd_str = format_seconds_to_hhmmss(on_gnd_value)
            elif on_gnd_value is not None:
                on_gnd_str = str(on_gnd_value)

            # Procesamiento de DATE
            date_value = row.get("DATE")
            date_str: Optional[str] = None
            if date_value is not None:
                if isinstance(date_value, int):
                    if date_value > 0: 
                        try:
                            # Asumiendo que el entero es días desde 0001-01-01
                            base_date = date(1, 1, 1)
                            actual_date = base_date + timedelta(days=date_value - 1)
                            date_str = actual_date.isoformat()
                        except OverflowError: 
                            date_str = str(date_value) # Fallback si el número es muy grande
                    else:
                        date_str = str(date_value) # Fallback para 0 o negativos
                elif isinstance(date_value, datetime):
                    date_str = date_value.date().isoformat()
                elif isinstance(date_value, date):
                    date_str = date_value.isoformat()
                else:
                    date_str = str(date_value)

            # Procesamiento de START TIME
            start_time_value = row.get("START TIME") # Query alias for START_TIME
            start_time_str: Optional[str] = None
            if isinstance(start_time_value, time):
                start_time_str = start_time_value.isoformat(timespec='seconds') # Formato HH:MM:SS
            elif isinstance(start_time_value, int):
                # Asumir segundos desde medianoche. Debe ser positivo y menor que segundos en un día.
                if 0 <= start_time_value < 86400: # 24 * 60 * 60
                    start_time_str = format_seconds_to_hhmmss(start_time_value)
                else:
                    start_time_str = str(start_time_value) # Valor fuera de rango, tratar como string
            elif start_time_value is not None:
                start_time_str = str(start_time_value)

            # Procesamiento de END TIME
            end_time_value = row.get("END TIME") # Query alias for END_TIME
            end_time_str: Optional[str] = None
            if isinstance(end_time_value, time):
                end_time_str = end_time_value.isoformat(timespec='seconds') # Formato HH:MM:SS
            elif isinstance(end_time_value, int):
                # Asumir segundos desde medianoche
                if 0 <= end_time_value < 86400:
                    end_time_str = format_seconds_to_hhmmss(end_time_value)
                else:
                    end_time_str = str(end_time_value) # Valor fuera de rango
            elif end_time_value is not None:
                end_time_str = str(end_time_value)

            report_data = {
                "COMPANY": row.get("COMPANY"),
                "LLAVE": row.get("LLAVE"),
                "AIRLINE": row.get("AIRLINE"),
                "DATE": date_str,
                "STATION": row.get("STATION"),
                "AC_REG": row.get("AC REG"), # Query alias for AC_REG
                "FLIGTH": row.get("FLIGTH"), # Query alias for FLIGHT
                "DEST": row.get("DEST"),
                "LOG_BOOK": row.get("LOG BOOK"), # Query alias for LOG_BOOK
                "AC_TYPE": row.get("A/C TYPE"),    # Query alias for AC_TYPE
                "START_TIME": start_time_str,
                "END_TIME": end_time_str,
                "SERV_PR": row.get("SERV PR"), # Query alias for SERV_PR
                "ON_GND": on_gnd_str,
                "SERV1": row.get("SERV1"),
                "SERV2": row.get("SERV2"),
                "SERV3": row.get("SERV3"),
                "SERV4": row.get("SERV4"),
                "SERV5": row.get("SERV5"),
                "SERV6": str(row.get("SERV6")) if row.get("SERV6") is not None else None,
                "REMARKS": row.get("REMARKS"),
                "TECHNICIAN": row.get("TECHNICIAN")
            }
            reports.append(report_data)
        
        return reports
        
    except Exception as e:
        print(f"Error en get_operation_reports_v2: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener reportes de operación v2: {str(e)}")

@router.get("/services-reports", response_model=List[ServicesReportResponse])
async def get_services_reports(db: Session = Depends(get_db)):
    """
    Obtiene el reporte de servicios ejecutando el query específico con mapeo de servicios
    """
    try:
        sql_query = """
SELECT
    cc.companyCode                              AS COMPANY,
    cc.llave                                    AS LLAVE,
    ac.nombre                                   AS AIRLINE,
    se.fecha                                    AS DATE,
    sv.station                                  AS STATION,
    sv.matricula                                AS AC_REG,
    sv.vuelo                                    AS FLIGHT,
    sv.avion                                    AS AC_TYPE,
    se.horaInicio                               AS START_TIME,
    se.horaFin                                  AS END_TIME,
    (se.horaFin - se.horaInicio)                AS ON_GND,
    cs.service_name                             AS SERVICE,
    sv.workOrderNumero                          AS WORK_REFERENCE,
    CONCAT(te.paterno, ' ', te.materno, ' ',
           te.primerNombre, ' ',
           ISNULL(te.segundoNombre, ''))        AS TECHNICIAN
FROM aisgProduction.dbo.ExtraServiceSaleAssignment     AS essa
INNER JOIN aisgProduction.dbo.ServicePerCustomer       AS spc
    ON essa.id_service_per_customer = spc.id_service_per_customer
INNER JOIN aisgProduction.dbo.CatalogServices          AS cs
    ON spc.id_service = cs.id_service
INNER JOIN aisgProduction.dbo.DBTableEstCompanyCode    AS cc
    ON spc.id_company = cc.llave
INNER JOIN aisgProduction.dbo.DBSaleEmpleado           AS se
    ON essa.id_sale_employee = se.llave
INNER JOIN aisgProduction.dbo.DBTableEmployee          AS te
    ON se.empleado = te.numeroNomina
INNER JOIN aisgProduction.dbo.DBSaleVuelo              AS sv
    ON essa.id_sale_flight = sv.llave
INNER JOIN aisgProduction.dbo.DBTableDtClienteHeader   AS ch
    ON spc.id_client = ch.llave
INNER JOIN aisgProduction.dbo.DBTableAirlineCode       AS ac
    ON ch.noCliente = ac.linea
WHERE cs.service_name IS NOT NULL;
        """
        
        result = db.execute(text(sql_query)).fetchall()
        
        reports = []

        # Helper para formatear segundos a HH:MM:SS (copiado de get_operation_reports_v2)
        def format_seconds_to_hhmmss(total_seconds_val) -> str:
            if not isinstance(total_seconds_val, int):
                return str(total_seconds_val) 
            
            sign = "-" if total_seconds_val < 0 else ""
            abs_seconds = abs(total_seconds_val)
            
            hours = abs_seconds // 3600
            minutes = (abs_seconds % 3600) // 60
            secs = abs_seconds % 60
            return f"{sign}{hours:02}:{minutes:02}:{secs:02}"

        for row_proxy in result:
            row = dict(row_proxy._mapping)
            
            # Procesamiento de ON_GND
            on_gnd_value = row.get("ON_GND")
            on_gnd_str: Optional[str] = None
            if isinstance(on_gnd_value, timedelta):
                on_gnd_str = format_seconds_to_hhmmss(int(on_gnd_value.total_seconds()))
            elif isinstance(on_gnd_value, int):
                on_gnd_str = format_seconds_to_hhmmss(on_gnd_value)
            elif on_gnd_value is not None:
                on_gnd_str = str(on_gnd_value)

            # Procesamiento de DATE
            date_value = row.get("DATE")
            date_str: Optional[str] = None
            if date_value is not None:
                if isinstance(date_value, int):
                    if date_value > 0: 
                        try:
                            base_date = date(1, 1, 1)
                            actual_date = base_date + timedelta(days=date_value - 1)
                            date_str = actual_date.isoformat()
                        except OverflowError: 
                            date_str = str(date_value) 
                    else:
                        date_str = str(date_value) 
                elif isinstance(date_value, datetime):
                    date_str = date_value.date().isoformat()
                elif isinstance(date_value, date):
                    date_str = date_value.isoformat()
                else:
                    date_str = str(date_value)

            # Procesamiento de START_TIME
            start_time_value = row.get("START_TIME")
            start_time_str: Optional[str] = None
            if isinstance(start_time_value, time):
                start_time_str = start_time_value.isoformat(timespec='seconds')
            elif isinstance(start_time_value, int):
                if 0 <= start_time_value < 86400: 
                    start_time_str = format_seconds_to_hhmmss(start_time_value)
                else:
                    start_time_str = str(start_time_value) 
            elif start_time_value is not None:
                start_time_str = str(start_time_value)

            # Procesamiento de END_TIME
            end_time_value = row.get("END_TIME")
            end_time_str: Optional[str] = None
            if isinstance(end_time_value, time):
                end_time_str = end_time_value.isoformat(timespec='seconds')
            elif isinstance(end_time_value, int):
                if 0 <= end_time_value < 86400:
                    end_time_str = format_seconds_to_hhmmss(end_time_value)
                else:
                    end_time_str = str(end_time_value) 
            elif end_time_value is not None:
                end_time_str = str(end_time_value)

            report_data = {
                "COMPANY": row.get("COMPANY"),
                "LLAVE": row.get("LLAVE"),
                "AIRLINE": row.get("AIRLINE"),
                "DATE": date_str,
                "STATION": row.get("STATION"),
                "AC_REG": row.get("AC_REG"),
                "FLIGHT": row.get("FLIGHT"),
                "AC_TYPE": row.get("AC_TYPE"),
                "START_TIME": start_time_str,
                "END_TIME": end_time_str,
                "ON_GND": on_gnd_str,
                "SERVICE": row.get("SERVICE"),
                "WORK_REFERENCE": row.get("WORK_REFERENCE"),
                "TECHNICIAN": row.get("TECHNICIAN")
            }
            reports.append(report_data)
        
        return reports
        
    except Exception as e:
        print(f"Error en get_services_reports: {str(e)}") # Mensaje de error específico
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener reportes de servicios: {str(e)}")