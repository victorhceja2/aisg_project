from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/service-execution", tags=["Service Execution"])

# ============================
# === Pydantic Schemas ======
# ============================

class ServiceExecutionTaskCreate(BaseModel):
    tarea_id: int
    realizada: bool = False

class ServiceExecutionCreate(BaseModel):
    cliente_id: int
    servicio_id: int
    clasificacion_id: int
    fecha_ejecucion: datetime
    observaciones: str
    estatus_id: int
    tareas: List[ServiceExecutionTaskCreate]

# ============================
# === ENDPOINTS =============
# ============================

@router.post("/create")
def create_service_execution(data: ServiceExecutionCreate, db: Session = Depends(get_db)):
    # Crear cabecera
    execution = models.ServiceExecution(
        cliente_id=data.cliente_id,
        servicio_id=data.servicio_id,
        clasificacion_id=data.clasificacion_id,
        fecha_ejecucion=data.fecha_ejecucion,
        observaciones=data.observaciones,
        estatus_id=data.estatus_id,
        fecha_registro=datetime.utcnow()
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    # Crear tareas asociadas
    for t in data.tareas:
        task = models.ServiceExecutionTask(
            service_execution_id=execution.id,
            tarea_id=t.tarea_id,
            realizada=t.realizada
        )
        db.add(task)

    db.commit()
    return {"message": "Servicio registrado correctamente", "id": execution.id}


@router.get("/all")
def get_all_service_executions(db: Session = Depends(get_db)):
    results = db.query(models.ServiceExecution).all()
    return results


@router.get("/tasks/{execution_id}")
def get_tasks_by_execution(execution_id: int, db: Session = Depends(get_db)):
    tasks = db.query(models.ServiceExecutionTask).filter(models.ServiceExecutionTask.service_execution_id == execution_id).all()
    return tasks
