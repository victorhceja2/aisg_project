from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models import ServiceExecution, ServiceExecutionTasks
from app.schemas import schemas

router = APIRouter(prefix="/service-execution", tags=["Service Execution"])

# === CREAR ejecución de servicio ===
@router.post("/", response_model=schemas.ServiceExecutionInDB)
def create_service_execution(data: schemas.ServiceExecutionCreate, db: Session = Depends(get_db)):
    service = ServiceExecution(**data.dict())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

# === LISTAR ejecuciones ===
@router.get("/", response_model=list[schemas.ServiceExecutionInDB])
def get_all_executions(db: Session = Depends(get_db)):
    return db.query(ServiceExecution).all()

# === OBTENER una ejecución ===
@router.get("/{execution_id}", response_model=schemas.ServiceExecutionInDB)
def get_execution_by_id(execution_id: int, db: Session = Depends(get_db)):
    service = db.query(ServiceExecution).filter(ServiceExecution.id == execution_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service execution not found")
    return service

# === ACTUALIZAR ejecución ===
@router.put("/{execution_id}", response_model=schemas.ServiceExecutionInDB)
def update_execution(execution_id: int, data: schemas.ServiceExecutionUpdate, db: Session = Depends(get_db)):
    service = db.query(ServiceExecution).filter(ServiceExecution.id == execution_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service

# === REPORTE FILTRADO tipo bitácora ===
@router.get("/report", response_model=list[schemas.ServiceExecutionInDB])
def get_service_execution_report(
    cliente_id: Optional[int] = Query(None),
    servicio_id: Optional[int] = Query(None),
    estatus_id: Optional[int] = Query(None),
    fecha_inicio: Optional[datetime] = Query(None),
    fecha_fin: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ServiceExecution)

    if cliente_id:
        query = query.filter(ServiceExecution.cliente_id == cliente_id)
    if servicio_id:
        query = query.filter(ServiceExecution.servicio_id == servicio_id)
    if estatus_id:
        query = query.filter(ServiceExecution.estatus_id == estatus_id)
    if fecha_inicio:
        query = query.filter(ServiceExecution.fecha_ejecucion >= fecha_inicio)
    if fecha_fin:
        query = query.filter(ServiceExecution.fecha_ejecucion <= fecha_fin)

    return query.all()
