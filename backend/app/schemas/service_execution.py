from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.service_execution_task import (
    ServiceExecutionTaskCreate,
    ServiceExecutionTaskUpdate,
    ServiceExecutionTaskInDB
)
from app.crud import service_execution_task as crud_tasks

router = APIRouter(
    prefix="/service-execution-tasks",
    tags=["Service Execution Tasks"]
)

@router.post("/", response_model=ServiceExecutionTaskInDB)
def create_task(task_in: ServiceExecutionTaskCreate, db: Session = Depends(get_db)):
    return crud_tasks.create_task(db, task_in)

@router.get("/{task_id}", response_model=ServiceExecutionTaskInDB)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = crud_tasks.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/by-execution/{execution_id}", response_model=list[ServiceExecutionTaskInDB])
def read_tasks_by_execution(execution_id: int, db: Session = Depends(get_db)):
    return crud_tasks.get_tasks_by_execution(db, execution_id)

@router.put("/{task_id}", response_model=ServiceExecutionTaskInDB)
def update_task(task_id: int, task_in: ServiceExecutionTaskUpdate, db: Session = Depends(get_db)):
    db_task = crud_tasks.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud_tasks.update_task(db, db_task, task_in)

@router.delete("/{task_id}", response_model=ServiceExecutionTaskInDB)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = crud_tasks.delete_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task