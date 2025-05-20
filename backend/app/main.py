from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers del sistema
from app.routers import (
    login,
    catalog_services,
    catalog_service_classification,
    catalog_service_status,
    service_per_customer,
    extra_company_configuration,
    extra_service_sale_assignment,
    service_catalogs,
    catalog_services_full,
    catalog_router_aliases,
    operations_report,
    clients  # 👈 nuevo router
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
routers = [
    login.router,
    catalog_services.router,
    catalog_service_classification.router,
    catalog_service_status.router,
    service_per_customer.router,
    extra_company_configuration.router,
    extra_service_sale_assignment.router,
    service_catalogs.router,
    catalog_services_full.router,
    catalog_router_aliases.router,
    operations_report.router,
    clients.router  # 👈 nuevo router
]

for r in routers:
    app.include_router(r)

@app.get("/ping")
def ping():
    return {"message": "pong 🏓"}
