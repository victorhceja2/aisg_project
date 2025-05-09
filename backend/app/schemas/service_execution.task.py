from sqlalchemy.orm import Session
from app.models import ServiceExecutionTasks
from app.schemas.service_execution_task import (
    ServiceExecutionTaskCreate,
    ServiceExecutionTaskUpdate
)

def create_task(db: Session, task_in: ServiceExecutionTaskCreate) -> ServiceExecutionTasks:
    task = ServiceExecutionTasks(**task_in.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_task(db: Session, task_id: int) -> ServiceExecutionTasks | None:
    return db.query(ServiceExecutionTasks).filter(ServiceExecutionTasks.id == task_id).first()

def get_tasks_by_execution(db: Session, execution_id: int) -> list[ServiceExecutionTasks]:
    return db.query(ServiceExecutionTasks).filter(ServiceExecutionTasks.ServiceExecutionID == execution_id).all()

def update_task(db: Session, task: ServiceExecutionTasks, task_in: ServiceExecutionTaskUpdate) -> ServiceExecutionTasks:
    for key, value in task_in.dict(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int) -> ServiceExecutionTasks | None:
    task = get_task(db, task_id)
    if task:
        db.delete(task)
        db.commit()
    return task