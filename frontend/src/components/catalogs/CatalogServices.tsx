import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';
import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para los catálogos
  const [serviceStatuses, setServiceStatuses] = useState<any[]>([]);
  const [serviceClassifications, setServiceClassifications] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [serviceIncludes, setServiceIncludes] = useState<any[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);
  
  // Estados para modales de eliminación
  const [serviceToDelete, setServiceToDelete] = useState<{id: number, name: string} | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedServiceName, setDeletedServiceName] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);
  
  const navigate = useNavigate();

  // Referencias para manejar el foco
  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Función para obtener todos los catálogos
  const fetchCatalogs = async () => {
    setCatalogsLoading(true);
    try {
      const [statusRes, categoryRes, typeRes, includeRes, classificationRes] = await Promise.all([
        axiosInstance.get('/catalog/service-status'),
        axiosInstance.get('/catalog/service-categories'),
        axiosInstance.get('/catalog/service-types'),
        axiosInstance.get('/catalog/service-includes'),
        axiosInstance.get('/catalog/service-classification')
      ]);

      setServiceStatuses(statusRes.data);
      setServiceCategories(categoryRes.data);
      setServiceTypes(typeRes.data);
      setServiceIncludes(includeRes.data);
      setServiceClassifications(classificationRes.data);
      
    } catch (err) {
      // setError("Error loading catalog data. Some information may not be displayed correctly.");
      // Consider setting empty arrays or default values for catalogs if loading fails
      setServiceStatuses([]);
      setServiceClassifications([]);
      setServiceCategories([]);
      setServiceTypes([]);
      setServiceIncludes([]);
    } finally {
      setCatalogsLoading(false);
    }
  };

  // Funciones helper para mapear IDs a nombres
  const getStatusName = (id: number | string) => {
    if (!id) return "N/A"; // O algún valor por defecto
    const status = serviceStatuses.find(s => s.id_service_status === Number(id));
    return status?.status_name || `Status ID: ${id}`;
  };

  const getClassificationName = (id: number | string) => {
    if (!id) return "N/A";
    const classification = serviceClassifications.find(c => c.id_service_classification === Number(id));
    return classification?.service_classification_name || `Classification ID: ${id}`;
  };

  const getCategoryName = (id: number | string) => {
    if (!id) return "N/A";
    const category = serviceCategories.find(c => c.id_service_category === Number(id));
    return category?.service_category_name || `Category ID: ${id}`;
  };

  const getTypeName = (id: number | string) => {
    if (!id) return "N/A";
    const type = serviceTypes.find(t => t.id_service_type === Number(id));
    return type?.service_type_name || `Type ID: ${id}`;
  };

  const getIncludeName = (id: number | string) => {
    if (!id) return "N/A";
    const include = serviceIncludes.find(i => i.id_service_include === Number(id));
    return include?.service_include || `Include ID: ${id}`;
  };

  // Función helper para convertir valores bit a boolean
  const getBooleanValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
    return false;
  };

  // Cargar catálogos al montar el componente
  useEffect(() => {
    fetchCatalogs();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [search]); // Recargar servicios cuando cambie el término de búsqueda

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/services${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      setServices(res.data);
      setError(null);
    } catch (err) {
      setError("Error loading services.");
      // console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un servicio está siendo utilizado en otros módulos
  const checkServiceUsage = async (serviceId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      const allDependentRecords: any[] = [];
      // Lista de posibles nombres de campo para el ID del servicio en diferentes tablas
      const serviceIdFields = [
        'id_service', 
        'service_id', 
        'id_servicio', // Ejemplo en español
        'servicio_id', // Ejemplo en español
        'service'      // A veces se usa 'service' como campo de ID
      ];

      // Función helper para verificar si un item usa el serviceId
      const usesService = (item: any): boolean => {
        for (const field of serviceIdFields) {
          if (item[field] !== undefined && 
              (Number(item[field]) === serviceId || String(item[field]) === String(serviceId))) {
            return true;
          }
        }
        return false;
      };

      // Verificar en Customer Services (service-per-customer)
      try {
        const customerServicesRes = await axiosInstance.get('/catalog/service-per-customer');
        const customerServicesUsingService = customerServicesRes.data.filter(usesService);
        allDependentRecords.push(
          ...customerServicesUsingService.map((cs: any) => ({
            type: 'Customer Service',
            name: `Customer ID: ${cs.id_customer || cs.customer_id} - Service: ${cs.service_name || cs.id_service}`, // Ajustar según los campos reales
            id: cs.id_service_per_customer || cs.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking customer services:", err);
        // Si una verificación falla, podríamos considerarlo como "en uso" para ser cautelosos
        // o registrar el error y continuar. Por ahora, si falla una, asumimos que podría estar en uso.
        return { inUse: true, records: [{ type: 'Unknown', name: 'Error checking dependencies', id: 0 }] };
      }

      // Verificar en Service Customers (customer-services) - si es una entidad diferente
      try {
        const serviceCustomersRes = await axiosInstance.get('/catalog/customer-services'); // Asumiendo este endpoint
        const serviceCustomersUsingService = serviceCustomersRes.data?.filter(usesService); // Usar optional chaining
        if (serviceCustomersUsingService?.length > 0) {
          allDependentRecords.push(
            ...serviceCustomersUsingService.map((sc: any) => ({
              type: 'Service Customer',
              name: `Customer: ${sc.customer_name || sc.id_customer} - Service: ${sc.service_name || sc.id_service}`,
              id: sc.id || sc.id_customer_service
            }))
          );
        }
      } catch (err) {
        // console.warn("Error checking service customers:", err);
        // No es crítico si este endpoint no existe o falla, continuar
      }

      // Verificar en Work Orders
      try {
        const workOrdersRes = await axiosInstance.get('/work-orders');
        const workOrdersUsingService = workOrdersRes.data.filter(usesService);
        allDependentRecords.push(
          ...workOrdersUsingService.map((wo: any) => ({
            type: 'Work Order',
            name: `Work Order: ${wo.work_order_number || wo.id}`,
            id: wo.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking work orders:", err);
        return { inUse: true, records: [{ type: 'Unknown', name: 'Error checking Work Orders', id: 0 }] };
      }

      // Verificar en Quotes
      try {
        const quotesRes = await axiosInstance.get('/quotes');
        const quotesUsingService = quotesRes.data.filter(usesService);
        allDependentRecords.push(
          ...quotesUsingService.map((quote: any) => ({
            type: 'Quote',
            name: `Quote: ${quote.quote_number || quote.id}`,
            id: quote.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking quotes:", err);
        return { inUse: true, records: [{ type: 'Unknown', name: 'Error checking Quotes', id: 0 }] };
      }
      
      // Verificar en Operation Reports
      try {
        const operationReportsRes = await axiosInstance.get('/reports/operation-report');
        const reportsUsingService = operationReportsRes.data.filter(usesService);
        allDependentRecords.push(
          ...reportsUsingService.map((report: any) => ({
            type: 'Operation Report',
            name: `Report: ${report.cliente} - ${report.servicio_principal || report.id_service}`, // Ajustar campos
            id: report.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking operation reports:", err);
      }

      // Verificar en Service Executions
      try {
        const serviceExecutionsRes = await axiosInstance.get('/reports/service-executions');
        const executionsUsingService = serviceExecutionsRes.data.filter(usesService);
        allDependentRecords.push(
          ...executionsUsingService.map((exec: any) => ({
            type: 'Service Execution',
            name: `Execution: Work Order ${exec.work_order || exec.id}`, // Ajustar campos
            id: exec.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking service executions:", err);
      }

      // Verificar en Invoices
      try {
        const invoicesRes = await axiosInstance.get('/billing/invoices');
        const invoicesUsingService = invoicesRes.data.filter(usesService);
        allDependentRecords.push(
          ...invoicesUsingService.map((invoice: any) => ({
            type: 'Invoice',
            name: `Invoice: ${invoice.invoice_number || invoice.id}`,
            id: invoice.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking invoices:", err);
      }
      
      // Verificar en Maintenance Plans
      try {
        const maintenancePlansRes = await axiosInstance.get('/maintenance/plans');
        const plansUsingService = maintenancePlansRes.data.filter(usesService);
        allDependentRecords.push(
          ...plansUsingService.map((plan: any) => ({
            type: 'Maintenance Plan',
            name: `Plan: ${plan.plan_name || plan.id}`,
            id: plan.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking maintenance plans:", err);
      }
      
      // Verificar en Components (si los componentes pueden estar ligados directamente a servicios)
      try {
        const componentsRes = await axiosInstance.get('/components');
        const componentsUsingService = componentsRes.data.filter(usesService);
        allDependentRecords.push(
          ...componentsUsingService.map((comp: any) => ({
            type: 'Component',
            name: `Component: ${comp.component_name || comp.id}`,
            id: comp.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking components:", err);
      }
      
      // Verificar en Contracts
      try {
        const contractsRes = await axiosInstance.get('/contracts');
        const contractsUsingService = contractsRes.data.filter(usesService);
        allDependentRecords.push(
          ...contractsUsingService.map((contract: any) => ({
            type: 'Contract',
            name: `Contract: ${contract.contract_number || contract.id}`,
            id: contract.id
          }))
        );
      } catch (err) {
        // console.warn("Error checking contracts:", err);
      }

      return {
        inUse: allDependentRecords.length > 0,
        records: allDependentRecords
      };
    } catch (err) {
      // console.error("General error checking service usage:", err);
      // Si hay un error general, es más seguro asumir que está en uso.
      return { inUse: true, records: [{ type: 'Unknown', name: 'Error checking dependencies', id: 0 }] };
    }
  };

  const handleDeleteClick = async (id: number, name: string) => {
    setIsDeleting(true); // Iniciar el estado de carga/borrado
    const { inUse } = await checkServiceUsage(id);
    setIsDeleting(false); // Finalizar el estado de carga/borrado

    if (inUse) {
      setDeleteErrorMessage("Cannot delete service because it is currently being used in the system.");
      setDependentRecords([]); // Limpiar registros dependientes si no se van a mostrar
      setShowDeleteError(true);
      setServiceToDelete(null); // Asegurarse de que no quede ningún servicio seleccionado para borrar
      return;
    }
    setServiceToDelete({id, name});
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    // Volver a verificar dependencias justo antes de borrar
    const { inUse } = await checkServiceUsage(serviceToDelete.id);

    if (inUse) {
      setDeleteErrorMessage("Cannot delete service because it is currently being used in the system.");
      setDependentRecords([]);
      setShowConfirmation(false); // Cerrar el modal de confirmación
      setShowDeleteError(true);   // Mostrar el modal de error
      setIsDeleting(false);
      setServiceToDelete(null);
      return;
    }

    try {
      const deleteResponse = await axiosInstance.delete(`/catalog/services/${serviceToDelete.id}`);
      // console.log("Delete response:", deleteResponse); // Para depuración
      setDeletedServiceName(serviceToDelete.name);
      setShowConfirmation(false);
      await fetchServices(); // Recargar la lista de servicios
      setError(null); // Limpiar errores previos
      setShowDeleteSuccess(true); // Mostrar modal de éxito
    } catch (err: any) {
      // console.error("Error deleting service:", err);
      // Manejo de errores específico basado en la respuesta del backend
      if (err.response?.status === 409 || 
          err.response?.status === 400 || // A veces se usa 400 para errores de validación/dependencia
          (err.response?.data?.detail && 
           (err.response.data.detail.includes("constraint") || 
            err.response.data.detail.includes("used") || 
            err.response.data.detail.includes("dependency")))) {
        setDeleteErrorMessage("Cannot delete service because it is currently being used in the system.");
      } else {
        setDeleteErrorMessage(
          `Error deleting service "${serviceToDelete.name}". Please try again later.`
        );
      }
      setDependentRecords([]);
      setShowConfirmation(false);
      setShowDeleteError(true);
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null); // Limpiar el servicio a borrar en cualquier caso
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setServiceToDelete(null);
  };

  const closeSuccessModal = () => {
    setShowDeleteSuccess(false);
    setDeletedServiceName("");
  };

  const closeDeleteErrorModal = () => {
    setShowDeleteError(false);
    setDeleteErrorMessage("");
    setDependentRecords([]);
  };

  // Efectos para manejar el foco en los modales
  useEffect(() => {
    if (showDeleteSuccess && deleteSuccessOkButtonRef.current) {
      setTimeout(() => deleteSuccessOkButtonRef.current?.focus(), 100);
    }
  }, [showDeleteSuccess]);

  useEffect(() => {
    if (showConfirmation && deleteConfirmButtonRef.current) {
      setTimeout(() => deleteConfirmButtonRef.current?.focus(), 100);
    }
  }, [showConfirmation]);

  useEffect(() => {
    if (showDeleteError && deleteErrorOkButtonRef.current) {
      setTimeout(() => deleteErrorOkButtonRef.current?.focus(), 100);
    }
  }, [showDeleteError]);
  
  // Efecto para manejar Enter/Escape en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showDeleteSuccess) {
          e.preventDefault();
          closeSuccessModal();
        } else if (showConfirmation && !isDeleting) {
          e.preventDefault();
          confirmDelete();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      } else if (e.key === 'Escape') {
        if (showConfirmation && !isDeleting) {
          e.preventDefault();
          cancelDelete();
        } else if (showDeleteSuccess) {
          e.preventDefault();
          closeSuccessModal();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      }
    };

    if (showConfirmation || showDeleteSuccess || showDeleteError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showConfirmation, showDeleteSuccess, showDeleteError, isDeleting, serviceToDelete]);


  return (
    <AISGBackground>
      <div className="flex flex-col h-screen w-full font-['Montserrat']">
        {/* Encabezado y controles */}
        <div className="flex-shrink-0 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Services Catalog</h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
            <p className="text-gray-200 mt-2 font-light">
              Manage available services
            </p>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-2/3 relative">
              <input
                type="text"
                placeholder="Search by code, name or description..."
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Link
              to="/services/add"
              className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Service
            </Link>
          </div>
        </div>
        
        {/* Contenedor de la tabla con scroll */}
        <div className="flex-1 overflow-hidden px-6 pb-6"> {/* Permite que este div crezca y maneje el overflow */}
          <div className="h-full w-full overflow-auto"> {/* Contenedor interno para el scroll de la tabla */}
            {loading || catalogsLoading ? (
              <div className="flex justify-center items-center h-full"> {/* Centrar el spinner */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
              </div>
            ) : (
              <table className="border-collapse" style={{ minWidth: 'max-content' }}> {/* Asegura que la tabla no se comprima demasiado */}
                <thead className="sticky top-0 z-10"> {/* Cabecera pegajosa */}
                  <tr className="bg-white text-[#002057]">
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Status</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Classification</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Category</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Type</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Include</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Code</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Name</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Description</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Aircraft Type</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">By Time</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Min Time Configured</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Technicians Included</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Created/Modified By</th>
                    <th className="px-3 py-4 text-center font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center text-white bg-transparent">
                        No services found.
                      </td>
                    </tr>
                  ) : (
                    services.map((s) => (
                      <tr key={s.id_service} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getStatusName(s.id_service_status)}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getClassificationName(s.id_service_classification)}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getCategoryName(s.id_service_category)}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getTypeName(s.id_service_type)}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getIncludeName(s.id_service_include)}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{s.service_code}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white font-medium text-sm whitespace-nowrap">{s.service_name}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{s.service_description}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getBooleanValue(s.service_aircraft_type) ? "Yes" : "No"}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getBooleanValue(s.service_by_time) ? "By Hour" : "By Event"}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getBooleanValue(s.min_time_configured) ? "Yes" : "No"}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{getBooleanValue(s.service_technicians_included) ? "Yes" : "No"}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{s.whonew || "-"}</td>
                        <td className="px-3 py-4 border border-[#1e3462] whitespace-nowrap">
                          <div className="flex justify-center space-x-1">
                            <Link
                              to={`/services/edit/${s.id_service}`}
                              className="p-1 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(s.id_service, s.service_name)}
                              disabled={isDeleting && serviceToDelete?.id === s.id_service} // Deshabilitar solo el botón del servicio que se está procesando
                              className="p-1 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {isDeleting && serviceToDelete?.id === s.id_service ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showConfirmation && serviceToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#16213E] rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4 border border-[#0033A0]">
              <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-4">
                <h3 className="text-xl font-bold text-white text-center">Confirm Delete</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-[#e6001f] rounded-full p-2 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-white">
                    Are you sure you want to delete the service "{serviceToDelete.name}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  {isDeleting ? (
                    <div className="w-full flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2 bg-[#4D70B8] text-white rounded-lg hover:bg-[#3A5A9F] transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        ref={deleteConfirmButtonRef}
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de éxito */}
        {showDeleteSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
              {/* Encabezado blanco con texto azul */}
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Success
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
              {/* Cuerpo con fondo azul oscuro */}
              <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                <div className="flex items-center mb-4 justify-center">
                  <div className="bg-[#00B140] rounded-full p-2 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white text-lg">Service "{deletedServiceName}" has been successfully deleted!</p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    ref={deleteSuccessOkButtonRef}
                    onClick={closeSuccessModal}
                    className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de error (en inglés y estilo similar a CatalogServiceType) */}
        {showDeleteError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
              {/* Encabezado blanco con texto azul */}
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Cannot Delete Service
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
              {/* Cuerpo con fondo azul oscuro */}
              <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                <div className="flex items-start mb-4"> {/* items-start para alinear el icono con la primera línea de texto */}
                  <div className="bg-[#f59e0b] rounded-full p-2 mr-4 flex-shrink-0 mt-1"> {/* mt-1 para alinear mejor el icono */}
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1"> {/* Permite que el texto ocupe el espacio restante */}
                    <p className="text-white text-lg mb-4">
                      {deleteErrorMessage}
                    </p>
                    {/* Aquí podrías mostrar dependentRecords si fuera necesario */}
                  </div>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    ref={deleteErrorOkButtonRef}
                    onClick={closeDeleteErrorModal}
                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AISGBackground>
  );
};

export default CatalogServices;