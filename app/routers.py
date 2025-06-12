from app.routers import (
    login,
    catalog_services,
    catalog_service_classification,
    catalog_service_status,
    service_per_customer,
    extra_company_configuration,
    extra_service_sale_assignment,
    reports  # Agregar esta línea
)

routers = [
    login.router,
    catalog_services.router,
    catalog_service_classification.router,
    catalog_service_status.router,
    service_per_customer.router,
    extra_company_configuration.router,
    extra_service_sale_assignment.router,
    reports.router  # Agregar esta línea
]