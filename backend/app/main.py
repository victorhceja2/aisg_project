from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

<<<<<<< HEAD
# Routers del sistema
=======
# Importa routers individuales
>>>>>>> 8e202d035a167e3c6cd713b2179dbe0262f54890
from app.routers import (
    login,
    catalog_services,
    catalog_service_classification,
    catalog_service_status,
    service_per_customer,
    extra_company_configuration,
    extra_service_sale_assignment,
<<<<<<< HEAD
    service_catalogs,
    catalog_services_full,
    catalog_router_aliases,
    operations_report,
    client,  # ✅ este es el correcto
    aircraft_models
=======
    service_catalogs,             # Nuevo: CRUD catálogos
    catalog_services_full,        # Nuevo: /catalog-services/full con joins
>>>>>>> 8e202d035a167e3c6cd713b2179dbe0262f54890
)
# Importa el router de clientes desde su módulo
from app.routers.client import router as clients_router

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
<<<<<<< HEAD
    catalog_router_aliases.router,
    operations_report.router,
    client.router  # ✅ este es el único que debe ir
=======
    clients_router,  
>>>>>>> 8e202d035a167e3c6cd713b2179dbe0262f54890
]

for r in routers:
    app.include_router(r)

@app.get("/ping")
def ping():
    return {"message": "pong 🏓"}