import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
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
    if (showConfirmation && deleteConfirmButtonRef.current) {
      setTimeout(() => {
        deleteConfirmButtonRef.current?.focus();
      }, 100);
    }
  }, [showConfirmation]);

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
  }, [showConfirmation, showDeleteSuccess, showDeleteError, isDeleting]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/services${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setServices(res.data);
      setError(null);
    } catch (err) {
      setError("Error loading services.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un servicio está siendo utilizado por diferentes módulos
  const checkServiceUsage = async (serviceId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      const allDependentRecords: any[] = [];

      // Verificar en customer services
      try {
        const customerServicesRes = await axiosInstance.get('/catalog/service-per-customer');
        const customerServicesUsingService = customerServicesRes.data.filter((cs: any) => 
          cs.id_service === serviceId
        );
        allDependentRecords.push(
          ...customerServicesUsingService.map((cs: any) => ({
            type: 'Customer Service',
            name: `Customer ID: ${cs.id_customer} - Service: ${cs.service_name || serviceId}`,
            id: cs.id_service_per_customer
          }))
        );
      } catch (err) {
        console.warn("Error checking customer services:", err);
      }

      // Verificar en work orders / órdenes de trabajo
      try {
        const workOrdersRes = await axiosInstance.get('/work-orders');
        const workOrdersUsingService = workOrdersRes.data.filter((wo: any) => 
          wo.id_service === serviceId
        );
        allDependentRecords.push(
          ...workOrdersUsingService.map((wo: any) => ({
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
        const quotesUsingService = quotesRes.data.filter((quote: any) => 
          quote.id_service === serviceId
        );
        allDependentRecords.push(
          ...quotesUsingService.map((quote: any) => ({
            type: 'Quote',
            name: `Quote: ${quote.quote_number || quote.id}`,
            id: quote.id
          }))
        );
      } catch (err) {
        console.warn("Error checking quotes:", err);
      }

      // Verificar en componentes (módulo principal que utiliza servicios)
      try {
        const componentsRes = await axiosInstance.get('/components');
        const componentsUsingService = componentsRes.data.filter((comp: any) => 
          comp.id_service === serviceId
        );
        allDependentRecords.push(
          ...componentsUsingService.map((comp: any) => ({
            type: 'Component',
            name: `Component: ${comp.component_name || comp.component_number || comp.id}`,
            id: comp.id
          }))
        );
      } catch (err) {
        console.warn("Error checking components:", err);
      }

      // Verificar en reportes operacionales
      try {
        const operationReportsRes = await axiosInstance.get('/reports/operation-report');
        const reportsUsingService = operationReportsRes.data.filter((report: any) => 
          report.servicio_principal && report.servicio_principal.includes(serviceId.toString())
        );
        allDependentRecords.push(
          ...reportsUsingService.map((report: any) => ({
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
        const executionsUsingService = serviceExecutionsRes.data.filter((exec: any) => 
          exec.id_service === serviceId
        );
        allDependentRecords.push(
          ...executionsUsingService.map((exec: any) => ({
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
        const invoicesUsingService = invoicesRes.data.filter((invoice: any) => 
          invoice.id_service === serviceId
        );
        allDependentRecords.push(
          ...invoicesUsingService.map((invoice: any) => ({
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
      console.error("Error checking service usage:", err);
      return { inUse: false, records: [] };
    }
  };

  const handleDeleteClick = async (id: number, name: string) => {
    setIsDeleting(true);
    
    // Verificar si el servicio está siendo utilizado
    const { inUse, records } = await checkServiceUsage(id);
    
    setIsDeleting(false);
    
    if (inUse) {
      // Mostrar popup de error con la lista de registros que lo utilizan
      setDependentRecords(records);
      setDeleteErrorMessage(
        `Cannot delete service "${name}" because it is being used by ${records.length} record(s) in the system.`
      );
      setShowDeleteError(true);
      return;
    }

    // Si no está en uso, proceder con la confirmación de eliminación
    setServiceToDelete({id, name});
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    setIsDeleting(true);
    try {
      // Verificar una vez más antes de eliminar
      const { inUse, records } = await checkServiceUsage(serviceToDelete.id);
      
      if (inUse) {
        // Si ahora está en uso, mostrar error
        setDependentRecords(records);
        setDeleteErrorMessage(
          `Cannot delete service "${serviceToDelete.name}" because it is being used by ${records.length} record(s) in the system.`
        );
        setShowConfirmation(false);
        setShowDeleteError(true);
        setServiceToDelete(null);
        return;
      }

      await axiosInstance.delete(`/catalog/services/${serviceToDelete.id}`);
      setDeletedServiceName(serviceToDelete.name);
      setShowConfirmation(false);
      await fetchServices();
      setError(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      console.error("Error deleting service:", err);
      
      // Verificar si el error es por dependencias
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete service "${serviceToDelete.name}" because it is being used by other records in the system.`
        );
        setShowConfirmation(false);
        setShowDeleteError(true);
      } else {
        setError("Could not delete the service. Please try again.");
        setShowConfirmation(false);
      }
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null);
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

  useEffect(() => {
    fetchServices();
  }, [search]);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
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
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12 bg-transparent">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white text-[#002057]">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Include</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Aircraft Type</th>
                  <th className="px-4 py-3">By Time</th>
                  <th className="px-4 py-3">Min Time Configured</th>
                  <th className="px-4 py-3">Technicians Included</th>
                  <th className="px-4 py-3">Created/Modified By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#1E2A45]">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-8 text-center text-white">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id_service} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                      <td className="px-4 py-3 text-white">{s.id_service_status}</td>
                      <td className="px-4 py-3 text-white">{s.id_service_classification || s.id_service_clasification}</td>
                      <td className="px-4 py-3 text-white">{s.id_service_category}</td>
                      <td className="px-4 py-3 text-white">{s.id_service_type}</td>
                      <td className="px-4 py-3 text-white">{s.id_service_include}</td>
                      <td className="px-4 py-3 text-white">{s.service_code}</td>
                      <td className="px-4 py-3 text-white font-medium">{s.service_name}</td>
                      <td className="px-4 py-3 text-white">{s.service_description}</td>
                      <td className="px-4 py-3 text-white">{s.service_aircraft_type === 2 ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-white">{s.service_by_time === 2 ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-white">{s.min_time_configured === 2 ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-white">{s.service_technicians_included === 2 ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-white">{s.whonew || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/services/edit/${s.id_service}`}
                            className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(s.id_service, s.service_name)}
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

        {/* Popup de confirmación de eliminación */}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            cancelDelete();
                          }
                        }}
                        className="px-4 py-2 bg-[#4D70B8] text-white rounded-lg hover:bg-[#3A5A9F] transition-colors font-medium"
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

        {/* Popup de éxito después de eliminar */}
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

        {/* Popup de error de eliminación (registro en uso) */}
        {showDeleteError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-lg w-full mx-4 rounded-lg shadow-xl">
              {/* Encabezado blanco con texto azul */}
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Cannot Delete Service
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
              
              {/* Cuerpo con fondo azul oscuro */}
              <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                <div className="flex items-start mb-4">
                  <div className="bg-[#f59e0b] rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg mb-4">
                      {deleteErrorMessage}
                    </p>
                    {dependentRecords.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white text-sm font-medium mb-2">
                          Records using this service ({dependentRecords.length} found):
                        </p>
                        <div className="bg-[#0D1423] rounded-lg p-3 max-h-40 overflow-y-auto border border-gray-700">
                          {dependentRecords.map((record, index) => (
                            <div key={index} className="text-gray-300 text-sm py-1 border-b border-gray-700 last:border-b-0">
                              <span className="text-yellow-400 font-medium">{record.type}:</span> {record.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-blue-900 rounded-lg border border-blue-700">
                      <p className="text-blue-200 text-sm">
                        <strong>Tip:</strong> To delete this service, you must first remove or update all records that reference it.
                      </p>
                    </div>
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