const API_ROUTES = {

  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh"
  },

  CATALOG: {
    COMPANIES: "/companies",
    COMPANIES_AIRLINES: "/companies/airlines",
    
    SERVICE_STATUS: "/catalog/service-status",
    SERVICE_CLASSIFICATION: "/catalog/service-classification", 
    SERVICES: "/catalog/services",
    SERVICE_CATEGORIES: "/catalog/service-categories",
    SERVICE_TYPES: "/catalog/service-types",
    SERVICE_INCLUDES: "/catalog/service-includes",
    SERVICE_PER_CUSTOMER: "/catalog/service-per-customer",
    
    CLIENTS: "/catalog/clients",
    AIRCRAFT_MODELS: "/catalog/aircraft-models",
    EXTRA_COMPANY_CONFIGURATION: "/catalog/extra-company-configuration",
    EXTRA_SERVICE_SALE_ASSIGNMENT: "/catalog/extra-service-sale-assignment"
  },

  REPORTS: {
    OPERATION_REPORT: "/reports/operation-reports", 
    OPERATION_REPORT_V2: "/reports/operation-reports-v2",
    SERVICES_REPORTS: "/reports/services-reports"
  }
};

export default API_ROUTES;