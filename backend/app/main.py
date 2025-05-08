from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa routers individualmente
from app.routers import (
    login,
    catalog_services,
    catalog_service_classification,
    catalog_service_status,
    service_per_customer,
    extra_company_configuration,
    extra_service_sale_assignment,
    service_execution,
    service_execution_task
)

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agrega todos los routers
all_routers = [
    login.router,
    catalog_services.router,
    catalog_service_classification.router,
    catalog_service_status.router,
    service_per_customer.router,
    extra_company_configuration.router,
    extra_service_sale_assignment.router,
    service_execution.router,
    service_execution_task.router,
]

for r in all_routers:
    app.include_router(r)

# Ruta de prueba
@app.get("/ping")
def ping():
    return {"message": "pong 🏓"}