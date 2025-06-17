from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# Importar el esquema de seguridad
from app.authorization import CustomHTTPBearer

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
    client,
    aircraft_models,
    company,
    reports  # Agregar esta línea
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia del esquema de seguridad
oauth2_scheme = CustomHTTPBearer()

# Registrar routers protegidos (excepto login)
routers = [
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
    client.router,
    aircraft_models.router,
    company.router,
    reports.router
]

# Registrar router de login sin protección
app.include_router(login.router)

# Registrar routers protegidos con dependencia global
for r in routers:
    app.include_router(r, dependencies=[Depends(oauth2_scheme)])

@app.get("/ping")
def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)