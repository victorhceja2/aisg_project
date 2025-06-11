import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServiceInclude: React.FC = () => {
  const [includes, setIncludes] = useState<any[]>([]);
  const [allIncludes, setAllIncludes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, name: string} | null>(null);
  const [deletedItemName, setDeletedItemName] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();

  // Referencias para manejar el foco
  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Efecto para enfocar el botón OK del popup de éxito de eliminación
  useEffect(() => {
    if (showDeleteSuccess && deleteSuccessOkButtonRef.current) {
      setTimeout(() => {
        deleteSuccessOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteSuccess]);

  // Efecto para enfocar el botón Delete del popup de confirmación
  useEffect(() => {
    if (showDeleteConfirmation && deleteConfirmButtonRef.current) {
      setTimeout(() => {
        deleteConfirmButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteConfirmation]);

  // Efecto para enfocar el botón OK del popup de error
  useEffect(() => {
    if (showDeleteError && deleteErrorOkButtonRef.current) {
      setTimeout(() => {
        deleteErrorOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteError]);

  // Efecto para manejar Enter en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showDeleteSuccess) {
          e.preventDefault();
          closeSuccessModal();
        } else if (showDeleteConfirmation && !isDeleting) {
          e.preventDefault();
          confirmDelete();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      } else if (e.key === 'Escape') {
        if (showDeleteConfirmation && !isDeleting) {
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

    if (showDeleteConfirmation || showDeleteSuccess || showDeleteError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showDeleteConfirmation, showDeleteSuccess, showDeleteError, isDeleting]);

  // Obtener todos los includes solo una vez
  const fetchIncludes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/service-includes`);
      setAllIncludes(res.data);
      setIncludes(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching service includes:", err);
      setError("Could not load service includes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filtro en frontend desde la primera letra
  useEffect(() => {
    if (search.trim() === "") {
      setIncludes(allIncludes);
    } else {
      setIncludes(
        allIncludes.filter(inc =>
          (inc.service_include || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search, allIncludes]);

  // Verificar si un service include está siendo utilizado por diferentes módulos
  const checkServiceIncludeUsage = async (includeId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      const allDependentRecords: any[] = [];

      // Verificar en servicios
      try {
        const servicesRes = await axiosInstance.get('/catalog/services');
        const servicesUsingInclude = servicesRes.data.filter((service: any) => 
          service.id_service_include === includeId
        );
        allDependentRecords.push(
          ...servicesUsingInclude.map((service: any) => ({
            type: 'Service',
            name: `${service.service_code} - ${service.service_name}`,
            id: service.id_service
          }))
        );
      } catch (err) {
        console.warn("Error checking services:", err);
      }

      // Verificar en componentes (módulo principal que utiliza includes)
      try {
        const componentsRes = await axiosInstance.get('/components');
        const componentsUsingInclude = componentsRes.data.filter((comp: any) => 
          comp.id_service_include === includeId ||
          comp.include_id === includeId
        );
        allDependentRecords.push(
          ...componentsUsingInclude.map((comp: any) => ({
            type: 'Component',
            name: `Component: ${comp.component_name || comp.component_number || comp.id}`,
            id: comp.id
          }))
        );
      } catch (err) {
        console.warn("Error checking components:", err);
      }

      // Verificar en customer services
      try {
        const customerServicesRes = await axiosInstance.get('/catalog/service-per-customer');
        const customerServicesUsingInclude = customerServicesRes.data.filter((cs: any) => {
          // Verificar si el servicio del customer service usa este include
          return cs.service_include_id === includeId;
        });
        allDependentRecords.push(
          ...customerServicesUsingInclude.map((cs: any) => ({
            type: 'Customer Service',
            name: `Customer ID: ${cs.id_customer} - Service: ${cs.service_name || cs.id_service}`,
            id: cs.id_service_per_customer
          }))
        );
      } catch (err) {
        console.warn("Error checking customer services:", err);
      }

      // Verificar en work orders
      try {
        const workOrdersRes = await axiosInstance.get('/work-orders');
        const workOrdersUsingInclude = workOrdersRes.data.filter((wo: any) => 
          wo.service_include_id === includeId
        );
        allDependentRecords.push(
          ...workOrdersUsingInclude.map((wo: any) => ({
            type: 'Work Order',
            name: `Work Order: ${wo.work_order_number || wo.id}`,
            id: wo.id
          }))
        );
      } catch (err) {
        console.warn("Error checking work orders:", err);
      }

      // Verificar en cotizaciones/quotes
      try {
        const quotesRes = await axiosInstance.get('/quotes');
        const quotesUsingInclude = quotesRes.data.filter((quote: any) => 
          quote.service_include_id === includeId
        );
        allDependentRecords.push(
          ...quotesUsingInclude.map((quote: any) => ({
            type: 'Quote',
            name: `Quote: ${quote.quote_number || quote.id}`,
            id: quote.id
          }))
        );
      } catch (err) {
        console.warn("Error checking quotes:", err);
      }

      // Verificar en reportes operacionales
      try {
        const operationReportsRes = await axiosInstance.get('/reports/operation-report');
        const reportsUsingInclude = operationReportsRes.data.filter((report: any) => 
          report.include_id === includeId
        );
        allDependentRecords.push(
          ...reportsUsingInclude.map((report: any) => ({
            type: 'Operation Report',
            name: `Report: ${report.cliente} - ${report.servicio_principal}`,
            id: report.id
          }))
        );
      } catch (err) {
        console.warn("Error checking operation reports:", err);
      }

      // Verificar en ejecuciones de servicio
      try {
        const serviceExecutionsRes = await axiosInstance.get('/reports/service-executions');
        const executionsUsingInclude = serviceExecutionsRes.data.filter((exec: any) => 
          exec.include_id === includeId
        );
        allDependentRecords.push(
          ...executionsUsingInclude.map((exec: any) => ({
            type: 'Service Execution',
            name: `Execution: Work Order ${exec.work_order}`,
            id: exec.id
          }))
        );
      } catch (err) {
        console.warn("Error checking service executions:", err);
      }

      // Verificar en facturas/invoices
      try {
        const invoicesRes = await axiosInstance.get('/billing/invoices');
        const invoicesUsingInclude = invoicesRes.data.filter((invoice: any) => 
          invoice.include_id === includeId
        );
        allDependentRecords.push(
          ...invoicesUsingInclude.map((invoice: any) => ({
            type: 'Invoice',
            name: `Invoice: ${invoice.invoice_number || invoice.id}`,
            id: invoice.id
          }))
        );
      } catch (err) {
        console.warn("Error checking invoices:", err);
      }

      return {
        inUse: allDependentRecords.length > 0,
        records: allDependentRecords
      };
    } catch (err) {
      console.error("Error checking service include usage:", err);
      return { inUse: false, records: [] };
    }
  };

  // Preparar eliminación - verifica dependencias primero
  const prepareDelete = async (id: number, name: string) => {
    setIsDeleting(true);
    
    // Verificar si el service include está siendo utilizado
    const { inUse } = await checkServiceIncludeUsage(id);
    
    setIsDeleting(false);
    
    if (inUse) {
      // Mostrar popup de error simplificado
      setDeleteErrorMessage(
        `Cannot delete service include "${name}" because it is currently being used in the system.`
      );
      setShowDeleteError(true);
      return;
    }

    // Si no está en uso, proceder con la confirmación de eliminación
    setItemToDelete({id, name});
    setShowDeleteConfirmation(true);
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  // Confirmar y proceder con la eliminación
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      // Verificar una vez más antes de eliminar
      const { inUse } = await checkServiceIncludeUsage(itemToDelete.id);
      
      if (inUse) {
        // Si ahora está en uso, mostrar error simplificado
        setDeleteErrorMessage(
          `Cannot delete service include "${itemToDelete.name}" because it is currently being used in the system.`
        );
        setShowDeleteConfirmation(false);
        setShowDeleteError(true);
        setItemToDelete(null);
        return;
      }

      await axiosInstance.delete(`/catalog/service-includes/${itemToDelete.id}`);
      setDeletedItemName(itemToDelete.name);
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
      fetchIncludes(); // Refrescamos la lista
      setError(null);
      setShowDeleteSuccess(true); // Mostrar modal de éxito
    } catch (err: any) {
      console.error("Error deleting service include:", err);
      
      // Verificar si el error es por dependencias
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete service include "${itemToDelete.name}" because it is currently being used in the system.`
        );
        setShowDeleteConfirmation(false);
        setShowDeleteError(true);
      } else {
        setError("Could not delete the service include. Please try again.");
        setShowDeleteConfirmation(false);
      }
      
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cerrar modal de éxito
  const closeSuccessModal = () => {
    setShowDeleteSuccess(false);
    setDeletedItemName("");
  };

  // Cerrar modal de error
  const closeDeleteErrorModal = () => {
    setShowDeleteError(false);
    setDeleteErrorMessage("");
    setDependentRecords([]);
  };

  useEffect(() => {
    fetchIncludes();
  }, []);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Service Include Catalog</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the different service include types
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-2/3 relative">
            <input
              type="text"
              placeholder="Search service include..."
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
            to="/catalogs/serviceinclude/add"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Service Include
          </Link>
        </div>
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
            <p className="font-medium">{error}</p>
          </div>
        )}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12 bg-transparent">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Created/Modified By</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Created At</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Updated At</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#002057] border border-[#cccccc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {includes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-white bg-transparent">
                      No records found
                    </td>
                  </tr>
                ) : (
                  includes.map((inc) => (
                    <tr key={inc.id_service_include} className="bg-transparent">
                      <td className="px-4 py-3 border border-[#1e3462] font-medium text-white">{inc.service_include}</td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white">{inc.whonew ? inc.whonew : "-"}</td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white">
                        {inc.create_at ? new Date(inc.create_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white">
                        {inc.updated_at ? new Date(inc.updated_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 border border-[#1e3462]">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/catalogs/serviceinclude/edit/${inc.id_service_include}`}
                            className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => prepareDelete(inc.id_service_include, inc.service_include)}
                            disabled={isDeleting}
                            className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting ? (
                              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Diálogo de confirmación para eliminar */}
      {showDeleteConfirmation && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Confirm Deletion
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-center mb-4">
                <div className="bg-[#e6001f] rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-lg font-medium">Are you sure you want to delete?</p>
                  <p className="text-gray-300 mt-1">
                    The service include "{itemToDelete.name}" will be permanently deleted.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center space-x-4">
                {isDeleting ? (
                  <div className="w-full flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={cancelDelete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          cancelDelete();
                        }
                      }}
                      className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      ref={deleteConfirmButtonRef}
                      onClick={confirmDelete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          confirmDelete();
                        }
                      }}
                      className="w-1/2 bg-[#e6001f] hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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

      {/* Modal de éxito después de eliminar */}
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
                <p className="text-white text-lg">
                  Service include "{deletedItemName}" has been successfully deleted!
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={deleteSuccessOkButtonRef}
                  onClick={closeSuccessModal}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeSuccessModal();
                    }
                  }}
                  className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error - no se puede eliminar */}
      {showDeleteError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Cannot Delete Service Include
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-center mb-4">
                <div className="bg-[#f59e0b] rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white text-lg">
                  {deleteErrorMessage}
                </p>
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
    </AISGBackground>
  );
};

export default CatalogServiceInclude;