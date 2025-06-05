import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link } from "react-router-dom";
import AISGBackground from "./fondo"; // Import from fondo.tsx

const CatalogClassif: React.FC = () => {
  const [classifications, setClassifications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para el popup de confirmación de eliminación
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el popup de éxito de eliminación
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [deletedItemName, setDeletedItemName] = useState<string>("");

  // Estado para el popup de error de eliminación (registro en uso)
  const [showDeleteErrorPopup, setShowDeleteErrorPopup] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);

  // Referencias para manejar el foco
  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Efecto para enfocar el botón OK del popup de éxito de eliminación
  useEffect(() => {
    if (showDeleteSuccessPopup && deleteSuccessOkButtonRef.current) {
      setTimeout(() => {
        deleteSuccessOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteSuccessPopup]);

  // Efecto para enfocar el botón Delete del popup de confirmación
  useEffect(() => {
    if (showDeletePopup && deleteConfirmButtonRef.current) {
      setTimeout(() => {
        deleteConfirmButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeletePopup]);

  // Efecto para enfocar el botón OK del popup de error
  useEffect(() => {
    if (showDeleteErrorPopup && deleteErrorOkButtonRef.current) {
      setTimeout(() => {
        deleteErrorOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteErrorPopup]);

  // Efecto para manejar Enter en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showDeleteSuccessPopup) {
          e.preventDefault();
          closeDeleteSuccessPopup();
        } else if (showDeletePopup && !isDeleting) {
          e.preventDefault();
          confirmDelete();
        } else if (showDeleteErrorPopup) {
          e.preventDefault();
          closeDeleteErrorPopup();
        }
      } else if (e.key === 'Escape') {
        if (showDeletePopup && !isDeleting) {
          e.preventDefault();
          cancelDelete();
        } else if (showDeleteSuccessPopup) {
          e.preventDefault();
          closeDeleteSuccessPopup();
        } else if (showDeleteErrorPopup) {
          e.preventDefault();
          closeDeleteErrorPopup();
        }
      }
    };

    if (showDeletePopup || showDeleteSuccessPopup || showDeleteErrorPopup) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showDeletePopup, showDeleteSuccessPopup, showDeleteErrorPopup, isDeleting]);

  const fetchClassifications = async () => {
    setLoading(true);
    try {
      // CAMBIO: Corregir la URL del endpoint - eliminar la barra extra
      const url = search 
        ? `/catalog/service-classification?search=${encodeURIComponent(search)}`
        : `/catalog/service-classification`;
      
      console.log("Fetching classifications from:", url); // Para debugging
      
      const res = await axiosInstance.get(url);
      console.log("Classifications response:", res.data); // Para debugging
      
      setClassifications(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching classifications:", err);
      console.error("Error response:", err.response?.data);
      setError("Could not load classifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si una clasificación está siendo utilizada por diferentes módulos
  const checkClassificationUsage = async (classificationId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      const allDependentRecords: any[] = [];

      // Verificar en servicios
      try {
        const servicesRes = await axiosInstance.get('/catalog/services');
        const servicesUsingClassification = servicesRes.data.filter((service: any) =>
          service.id_service_classification === classificationId
        );
        allDependentRecords.push(
          ...servicesUsingClassification.map((service: any) => ({
            type: 'Service',
            name: `${service.service_code} - ${service.service_name}`,
            id: service.id_service
          }))
        );
      } catch (err) {
        console.warn("Error checking services:", err);
      }

      // Verificar en componentes (módulo principal que utiliza clasificaciones)
      try {
        const componentsRes = await axiosInstance.get('/components');
        const componentsUsingClassification = componentsRes.data.filter((comp: any) => 
          comp.id_service_classification === classificationId ||
          comp.classification_id === classificationId
        );
        allDependentRecords.push(
          ...componentsUsingClassification.map((comp: any) => ({
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
        const customerServicesUsingClassification = customerServicesRes.data.filter((cs: any) => {
          // Verificar si el servicio del customer service usa esta clasificación
          return cs.service_classification_id === classificationId;
        });
        allDependentRecords.push(
          ...customerServicesUsingClassification.map((cs: any) => ({
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
        const workOrdersUsingClassification = workOrdersRes.data.filter((wo: any) => 
          wo.service_classification_id === classificationId
        );
        allDependentRecords.push(
          ...workOrdersUsingClassification.map((wo: any) => ({
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
        const quotesUsingClassification = quotesRes.data.filter((quote: any) => 
          quote.service_classification_id === classificationId
        );
        allDependentRecords.push(
          ...quotesUsingClassification.map((quote: any) => ({
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
        const reportsUsingClassification = operationReportsRes.data.filter((report: any) => 
          report.classification_id === classificationId
        );
        allDependentRecords.push(
          ...reportsUsingClassification.map((report: any) => ({
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
        const executionsUsingClassification = serviceExecutionsRes.data.filter((exec: any) => 
          exec.classification_id === classificationId
        );
        allDependentRecords.push(
          ...executionsUsingClassification.map((exec: any) => ({
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
        const invoicesUsingClassification = invoicesRes.data.filter((invoice: any) => 
          invoice.classification_id === classificationId
        );
        allDependentRecords.push(
          ...invoicesUsingClassification.map((invoice: any) => ({
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
      console.error("Error checking classification usage:", err);
      return { inUse: false, records: [] };
    }
  };

  // Inicia el proceso de eliminación mostrando el popup
  const handleDelete = async (id: number, name: string) => {
    setIsDeleting(true);
    
    // Verificar si la clasificación está siendo utilizada
    const { inUse, records } = await checkClassificationUsage(id);
    
    setIsDeleting(false);

    if (inUse) {
      // Mostrar popup de error simplificado
      setDeleteErrorMessage(
        `Cannot delete classification "${name}" because it is currently being used in the system.`
      );
      setShowDeleteErrorPopup(true);
      return;
    }

    // Si no está en uso, proceder con la confirmación de eliminación
    setDeleteItemId(id);
    setDeleteItemName(name);
    setShowDeletePopup(true);
  };

  // Confirma la eliminación desde el popup
  const confirmDelete = async () => {
    if (deleteItemId === null) return;

    setIsDeleting(true);
    try {
      // Verificar una vez más antes de eliminar
      const { inUse, records } = await checkClassificationUsage(deleteItemId);

      if (inUse) {
        // Si ahora está en uso, mostrar error
        setDeleteErrorMessage(
          `Cannot delete classification "${deleteItemName}" because it is currently being used in the system.`
        );
        setShowDeletePopup(false);
        setShowDeleteErrorPopup(true);
        setDeleteItemId(null);
        setDeleteItemName("");
        return;
      }

      await axiosInstance.delete(`/catalog/service-classification/${deleteItemId}`);

      // Guardar el nombre del elemento eliminado para mostrarlo en el popup de éxito
      setDeletedItemName(deleteItemName);

      // Cerrar el popup de confirmación
      setShowDeletePopup(false);
      setDeleteItemId(null);
      setDeleteItemName("");

      // Mostrar el popup de éxito
      setShowDeleteSuccessPopup(true);

      // Actualizar la lista
      fetchClassifications();
      setError(null);

    } catch (err: any) {
      console.error("Error deleting classification:", err);

      // Verificar si el error es por dependencias
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete classification "${deleteItemName}" because it is currently being used in the system.`
        );
        setShowDeletePopup(false);
        setShowDeleteErrorPopup(true);
      } else {
        setError("Could not delete the classification. Please try again.");
        setShowDeletePopup(false);
      }

      setDeleteItemId(null);
      setDeleteItemName("");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cierra el popup de éxito de eliminación
  const closeDeleteSuccessPopup = () => {
    setShowDeleteSuccessPopup(false);
    setDeletedItemName("");
  };

  // Cierra el popup de error de eliminación
  const closeDeleteErrorPopup = () => {
    setShowDeleteErrorPopup(false);
    setDeleteErrorMessage("");
    setDependentRecords([]);
  };

  // Cancela la eliminación
  const cancelDelete = () => {
    setShowDeletePopup(false);
    setDeleteItemId(null);
    setDeleteItemName("");
  };

  useEffect(() => {
    fetchClassifications();
  }, [search]);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Service Classifications Catalog</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-2/3 relative">
            <input
              type="text"
              placeholder="Search classification..."
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
            to="/catalogs/classif/add"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Classification
          </Link>
        </div>
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12 bg-transparent">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc] whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc] whitespace-nowrap">
                    Created/Modified By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc] whitespace-nowrap">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc] whitespace-nowrap">
                    Updated At
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-[#002057] border border-[#cccccc] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {classifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-white bg-transparent">
                      No records found
                    </td>
                  </tr>
                ) : (
                  classifications.map((c) => (
                    <tr key={c.id_service_classification} className="bg-transparent">
                      <td className="px-4 py-3 border border-[#1e3462] font-medium text-white whitespace-nowrap">{c.service_classification_name}</td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white whitespace-nowrap">{c.whonew || "-"}</td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white whitespace-nowrap">
                        {c.create_at ? new Date(c.create_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white whitespace-nowrap">
                        {c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 border border-[#1e3462] whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/catalogs/classif/edit/${c.id_service_classification}`}
                            className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id_service_classification, c.service_classification_name)}
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

      {/* Popup de confirmación de eliminación */}
      {showDeletePopup && (
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
                <p className="text-white text-lg">
                  Are you sure you want to delete the classification "{deleteItemName}"? This action cannot be undone.
                </p>
              </div>
              <div className="mt-8 flex justify-between space-x-4">
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

      {/* Popup de éxito de eliminación */}
      {showDeleteSuccessPopup && (
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
                  Classification "{deletedItemName}" has been successfully deleted!
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={deleteSuccessOkButtonRef}
                  onClick={closeDeleteSuccessPopup}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeDeleteSuccessPopup();
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

      {/* Popup de error de eliminación (registro en uso) */}
      {showDeleteErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Cannot Delete Classification
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
                  onClick={closeDeleteErrorPopup}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeDeleteErrorPopup();
                    }
                  }}
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AISGBackground>
  );
};

export default CatalogClassif;