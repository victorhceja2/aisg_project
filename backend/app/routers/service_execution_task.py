from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ServiceExecutionTasks
from app.schemas import schemas

router = APIRouter(prefix="/service-execution-tasks", tags=["Service Execution Tasks"])

# === Crear tarea ejecutada ===
@router.post("/", response_model=schemas.ServiceExecutionTaskInDB)
def create_execution_task(data: schemas.ServiceExecutionTaskCreate, db: Session = Depends(get_db)):
    task = ServiceExecutionTasks(**data.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

# === Obtener todas las tareas ejecutadas ===
@router.get("/", response_model=list[schemas.ServiceExecutionTaskInDB])
def get_all_tasks(db: Session = Depends(get_db)):
    return db.query(ServiceExecutionTasks).all()

# === Obtener tareas por ejecución ===
@router.get("/by-execution/{execution_id}", response_model=list[schemas.ServiceExecutionTaskInDB])
def get_tasks_by_execution(execution_id: int, db: Session = Depends(get_db)):
    return db.query(ServiceExecutionTasks).filter(ServiceExecutionTasks.service_execution_id == execution_id).all()

# === Actualizar tarea ===
@router.put("/{task_id}", response_model=schemas.ServiceExecutionTaskInDB)
def update_task(task_id: int, data: schemas.ServiceExecutionTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(ServiceExecutionTasks).filter(ServiceExecutionTasks.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task