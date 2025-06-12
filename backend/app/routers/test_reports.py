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
                MAX(CASE WHEN rn = 1 THEN service_description END) AS "SERV PR"
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
            cc.llave AS LLAVE,
            ac.nombre AS AIRLINE,
            CONVERT(DATE, se.fecha) AS "DATE", -- Fixed conversion
            sv.station AS STATION,
            sv.matricula AS "AC REG",
            sv.vuelo AS FLIGTH,
            sv.destino AS DEST,
            sv.bitacora AS "LOG BOOK",
            sv.avion AS "A/C TYPE",
            se.horaInicio AS "START TIME",
            se.horaFin AS "END TIME",
            sp."SERV PR",
            (se.horaFin - se.horaInicio) AS "ON GND", 
            sp.SERV1, 
            sp.SERV2, 
            sp.SERV3, 
            sp.SERV4, 
            sp.SERV5, 
            sp.SERV6,
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
            cc.llave, 
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
            sp."SERV PR",
            sp.SERV1, sp.SERV2, sp.SERV3, sp.SERV4, sp.SERV5, sp.SERV6,
            se.remarks,
            te.paterno, te.materno, te.primerNombre, te.segundoNombre
        ORDER BY se.fecha DESC, cc.companyCode, ac.nombre
        """
        
        result = db.execute(text(sql_query)).fetchall()
        
        reports = []
        for row_proxy in result:
            row = dict(row_proxy._mapping)
            on_gnd_value = row.get("ON GND")
            if isinstance(on_gnd_value, timedelta):
                total_seconds = int(on_gnd_value.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                on_gnd_str = f"{hours:02}:{minutes:02}:{seconds:02}"
            elif on_gnd_value is None:
                on_gnd_str = None
            else:
                on_gnd_str = str(on_gnd_value)

            report_data = {
                "COMPANY": row.get("COMPANY"),
                "LLAVE": row.get("LLAVE"),
                "AIRLINE": row.get("AIRLINE"),
                "DATE": str(row.get("DATE")) if row.get("DATE") else None,
                "STATION": row.get("STATION"),
                "AC_REG": row.get("AC REG"),
                "FLIGTH": row.get("FLIGTH"),
                "DEST": row.get("DEST"),
                "LOG_BOOK": row.get("LOG BOOK"),
                "AC_TYPE": row.get("A/C TYPE"),
                "START_TIME": str(row.get("START TIME")) if row.get("START TIME") else None,
                "END_TIME": str(row.get("END TIME")) if row.get("END TIME") else None,
                "SERV_PR": row.get("SERV PR"),
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
        raise HTTPException(status_code=500, detail=f"Error al obtener reportes de operación v2: {str(e)}")