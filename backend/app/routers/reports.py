from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer, cast, String, literal_column, text
from typing import List, Optional, Any  # Añadido Any para los helpers
from datetime import datetime, timedelta, date, time

from ..database import get_db
from ..models import (
    ServiceExecution,
    CatalogService,
    Cliente,
    DBTableCompany,
    DBTableAvion,
    DBtableUserHeader,
    ExtraServiceSaleAssignment,
)
from ..schemas_reports import (
    ServiceExecutionResponse,
    OperationReportResponse,
    OperationReportV2Response,
    ServicesReportResponse,
)

router = APIRouter(prefix="/reports", tags=["reports"])

# --- Helper Functions ---


def _format_seconds_to_hhmmss(total_seconds_val: Optional[int]) -> Optional[str]:
    """Formatea un total de segundos (entero) a una cadena HH:MM:SS."""
    if total_seconds_val is None:
        return None
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


def _process_timedelta_or_int_as_duration(value: Any) -> Optional[str]:
    """Procesa un valor que puede ser timedelta o int (segundos) a una cadena de duración HH:MM:SS."""
    if isinstance(value, timedelta):
        return _format_seconds_to_hhmmss(int(value.total_seconds()))
    elif isinstance(value, int):
        return _format_seconds_to_hhmmss(value)
    elif value is not None:
        return str(value)
    return None


def _process_date_value(date_value: Any) -> Optional[str]:
    """Procesa un valor de fecha (int, datetime, date) a una cadena ISO."""
    if date_value is None:
        return None
    if isinstance(date_value, int):
        if date_value > 0:
            try:
                # Asumiendo que el entero es días desde 0001-01-01 (ordinal de Python)
                base_date = date(1, 1, 1)
                actual_date = base_date + timedelta(days=date_value - 1)
                return actual_date.isoformat()
            except OverflowError:
                return str(date_value)  # Fallback si el número es muy grande
        else:
            return str(date_value)  # Fallback para 0 o negativos
    elif isinstance(date_value, datetime):
        return date_value.date().isoformat()
    elif isinstance(date_value, date):
        return date_value.isoformat()
    return str(date_value)


def _process_time_value(time_val: Any) -> Optional[str]:
    """Procesa un valor de tiempo (time, int en segundos desde medianoche) a una cadena HH:MM:SS."""
    if time_val is None:
        return None
    if isinstance(time_val, time):
        return time_val.isoformat(timespec="seconds")  # Formato HH:MM:SS
    elif isinstance(time_val, int):
        # Asumir segundos desde medianoche.
        if 0 <= time_val < 86400:  # 24 * 60 * 60
            return _format_seconds_to_hhmmss(time_val)
        else:
            return str(time_val)  # Valor fuera de rango, tratar como string
    return str(time_val)


# --- End Helper Functions ---


@router.get("/service-executions", response_model=List[ServiceExecutionResponse])
async def get_service_executions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(
        100, ge=1, le=1000, description="Límite de registros a retornar"
    ),
):
    """
    Obtiene la lista de ejecuciones de servicios con datos relacionados mediante LEFT JOINs
    """
    try:
        query = (
            db.query(
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
                CatalogService.service_name,
            )
            .select_from(ServiceExecution)
            .outerjoin(
                CatalogService, ServiceExecution.id_service == CatalogService.id_service
            )
        )

        service_executions_data = (
            query.order_by(ServiceExecution.create_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        result = [
            {
                **row._asdict(),  # o dict(row) si _asdict() no está disponible o row._mapping
                "client_name": None,  # Mantener como None según el código original
                "company_name": None,  # Mantener como None según el código original
                "aircraft_model": None,  # Mantener como None según el código original
            }
            for row in service_executions_data
        ]
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las ejecuciones de servicios: {str(e)}",
        )


@router.get("/service-executions/count")
async def get_service_executions_count(db: Session = Depends(get_db)):
    """
    Obtiene el conteo total de ejecuciones de servicios
    """
    try:
        count = db.query(func.count(ServiceExecution.id)).scalar()
        return {"total_count": count}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener el conteo: {str(e)}"
        )


@router.get("/operation-reports", response_model=List[OperationReportResponse])
async def get_operation_reports(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(
        100, ge=1, le=1000, description="Límite de registros a retornar"
    ),
):
    """
    Obtiene la lista de reportes de operación sin filtros obligatorios, optimizado con JOINs.
    """
    try:
        # Uso de CAST para compatibilidad de tipos en JOINs (ej. UUID a VARCHAR)
        # Asegúrate que los tipos de columna en los modelos SQLAlchemy sean correctos
        # o que la base de datos maneje las conversiones implícitas si no se usa CAST.
        # Aquí se asume que id_client y id_user podrían necesitar CAST a string.
        sql_query = """
        SELECT 
            se.id,
            COALESCE(cli.nombre, 'Sin cliente') AS cliente,
            se.fuselage_type,
            COALESCE(cs.service_name, 'Sin servicio') AS servicio_principal,
            se.create_at AS fecha,
            se.work_order,
            COALESCE(usr.userName, 'Sin asignar') AS tecnico_asignado
        FROM 
            ServiceExecution se
        LEFT JOIN 
            DBTableCliente cli ON CAST(se.id_client AS VARCHAR) = cli.llave
        LEFT JOIN 
            CatalogServices cs ON se.id_service = cs.id_service
        LEFT JOIN 
            DBtableUserHeader usr ON CAST(se.id_user AS VARCHAR) = usr.userId
        ORDER BY 
            se.create_at DESC
        OFFSET :offset ROWS
        FETCH NEXT :limit ROWS ONLY
        """

        result_proxy = db.execute(
            text(sql_query), {"offset": skip, "limit": limit}
        ).fetchall()

        # Mapear directamente los resultados a la estructura del schema
        results = [dict(row._mapping) for row in result_proxy]
        return results

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener los reportes de operación: {str(e)}",
        )


@router.get("/operation-reports/count")
async def get_operation_reports_count(db: Session = Depends(get_db)):
    """
    Obtiene el conteo total de reportes de operación
    """
    try:
        # La query original es correcta y eficiente para un simple conteo.
        count_query = "SELECT COUNT(*) as total FROM ServiceExecution"
        result = db.execute(text(count_query)).fetchone()
        return {"total_count": result.total if result else 0}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al obtener el conteo de reportes: {str(e)}"
        )


@router.get("/operation-reports-v2", response_model=List[OperationReportV2Response])
async def get_operation_reports_v2(db: Session = Depends(get_db)):
    """
    Obtiene el reporte de operaciones ejecutando el query exacto proporcionado,
    con procesamiento de datos refactorizado.
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
            cc.companyCode AS COMPANY,
            ac.nombre AS AIRLINE,
            se.fecha AS DATE,
            sv.station AS STATION,
            sv.matricula AS [AC REG],
            sv.vuelo AS FLIGTH, -- Mantenido typo FLIGTH por consistencia con schema
            sv.destino AS DEST,
            sv.bitacora AS [LOG BOOK],
            sv.avion AS [A/C TYPE],
            sp.[SERV PR],
            sv.claveProducto AS [ASSISTANT TYPE],
            sv.aog AS [AOG],
            se.horaInicio AS [START TIME],
            se.horaFin AS [END TIME],
            (se.horaFin - se.horaInicio) AS [TOTAL TECHNICIAN TIME], -- Esto podría ser un intervalo/número dependiendo de DB
            sp.SERV1, sp.SERV2, sp.SERV3, sp.SERV4, sp.SERV5, sp.SERV6,
            se.remarks AS REMARKS,
            CONCAT(te.paterno, ' ', te.materno, ' ', te.primerNombre, ' ', ISNULL(te.segundoNombre, '')) AS TECHNICIAN

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
            ac.nombre,
            se.fecha,
            sv.station,
            sv.matricula,
            sv.vuelo,
            sv.destino,
            sv.bitacora,
            sv.avion,
            sp.[SERV PR],
            sv.claveProducto,
            sv.aog,
            se.horaInicio,
            se.horaFin,
            sp.SERV1, sp.SERV2, sp.SERV3, sp.SERV4, sp.SERV5, sp.SERV6,
            se.remarks,
            te.paterno, te.materno, te.primerNombre, te.segundoNombre
        """
        result_proxy = db.execute(text(sql_query)).fetchall()
        reports = []

        for row_data in result_proxy:
            row = dict(row_data._mapping)
            report_data = {
                "COMPANY": row.get("COMPANY"),
                "AIRLINE": row.get("AIRLINE"),
                "DATE": _process_date_value(row.get("DATE")),
                "STATION": row.get("STATION"),
                "AC_REG": row.get("AC REG"),
                "FLIGTH": row.get("FLIGTH"),  # Mantenido typo FLIGTH
                "DEST": row.get("DEST"),
                "LOG_BOOK": row.get("LOG BOOK"),
                "AC_TYPE": row.get("A/C TYPE"),
                "SERV_PR": row.get("SERV PR"),
                "ASSISTANT_TYPE": row.get("ASSISTANT TYPE"),
                "AOG": str(row.get("AOG")) if row.get("AOG") is not None else None,
                "START_TIME": _process_time_value(row.get("START TIME")),
                "END_TIME": _process_time_value(row.get("END TIME")),
                "TOTAL_TECHNICIAN_TIME": _process_timedelta_or_int_as_duration(
                    row.get("TOTAL TECHNICIAN TIME")
                ),
                "SERV1": row.get("SERV1"),
                "SERV2": row.get("SERV2"),
                "SERV3": row.get("SERV3"),
                "SERV4": row.get("SERV4"),
                "SERV5": row.get("SERV5"),
                "SERV6": (
                    str(row.get("SERV6")) if row.get("SERV6") is not None else None
                ),
                "REMARKS": row.get("REMARKS"),
                "TECHNICIAN": row.get("TECHNICIAN"),
            }
            reports.append(report_data)
        return reports

    except Exception as e:
        # Mantener el traceback para depuración en el servidor si es necesario
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener reportes de operación v2: {str(e)}",
        )


@router.get("/services-reports", response_model=List[ServicesReportResponse])
async def get_services_reports(db: Session = Depends(get_db)):
    """
    Obtiene el reporte de servicios ejecutando el query específico,
    con procesamiento de datos refactorizado.
    """
    try:
        sql_query = """
SELECT
    cc.companyCode                              AS COMPANY,
    cc.llave                                    AS LLAVE, -- Campo LLAVE añadido
    ac.nombre                                   AS AIRLINE,
    se.fecha                                    AS DATE,
    sv.station                                  AS STATION,
    sv.matricula                                AS AC_REG,
    sv.vuelo                                    AS FLIGHT,
    sv.avion                                    AS AC_TYPE,
    sv.claveProducto                            AS [ASSISTANT TYPE], 
    sv.aog                                      AS [AOG], 
    se.horaInicio                               AS START_TIME,
    se.horaFin                                  AS END_TIME,
    (se.horaFin - se.horaInicio)                AS [TOTAL TECHNICIAN TIME], -- Usado para ON_GND
    cs.service_name                             AS SERVICE,
    essa.work_reference                         AS WORK_REFERENCE,
    CONCAT(te.paterno, ' ', te.materno, ' ',
        te.primerNombre, ' ',
        ISNULL(te.segundoNombre, ''))           AS TECHNICIAN

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

WHERE cs.service_name IS NOT NULL

GROUP BY
    cc.companyCode,
    cc.llave,
    ac.nombre,
    se.fecha,
    sv.station,
    sv.matricula,
    sv.vuelo,
    sv.avion,
    sv.claveProducto,
    sv.aog,
    se.horaInicio,
    se.horaFin,
    cs.service_name,
    essa.work_reference,
    te.paterno,
    te.materno,
    te.primerNombre,
    te.segundoNombre;

        """
        result_proxy = db.execute(text(sql_query)).fetchall()
        reports = []

        for row_data in result_proxy:
            row = dict(row_data._mapping)
            report_data = {
                "COMPANY": row.get("COMPANY"),
                "LLAVE": row.get("LLAVE"), # Campo LLAVE añadido al mapeo
                "AIRLINE": row.get("AIRLINE"),
                "DATE": _process_date_value(row.get("DATE")),
                "STATION": row.get("STATION"),
                "AC_REG": row.get("AC_REG"),
                "FLIGHT": row.get("FLIGHT"),
                "AC_TYPE": row.get("AC_TYPE"),
                "ASSISTANT_TYPE": row.get("ASSISTANT TYPE"), # Comentado ya que no está en ServicesReportResponse
                "AOG": row.get("AOG"), # Comentado ya que no está en ServicesReportResponse
                "START_TIME": _process_time_value(row.get("START_TIME")),
                "END_TIME": _process_time_value(row.get("END_TIME")),
                "ON_GND": _process_timedelta_or_int_as_duration(row.get("TOTAL TECHNICIAN TIME")), # Corregido para usar TOTAL TECHNICIAN TIME
                "SERVICE": row.get("SERVICE"),
                "WORK_REFERENCE": row.get("WORK_REFERENCE"),
                "TECHNICIAN": row.get("TECHNICIAN"),
            }
            reports.append(report_data)
        return reports

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Error al obtener reportes de servicios: {str(e)}"
        )