/**
 * Catálogo de "Services" para AISG.
 * Permite listar, buscar, editar y eliminar servicios.
 * Incluye validación de dependencias antes de eliminar, mostrando modales de confirmación, éxito o error.
 * Utiliza React, axiosInstance y TailwindCSS para la UI y lógica de negocio.
 * Mapea IDs de catálogos relacionados a nombres legibles.
 */

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';
import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Catálogos relacionados
  const [serviceStatuses, setServiceStatuses] = useState<any[]>([]);
  const [serviceClassifications, setServiceClassifications] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [serviceIncludes, setServiceIncludes] = useState<any[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);

  // Modales de eliminación
  const [serviceToDelete, setServiceToDelete] = useState<{id: number, name: string} | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedServiceName, setDeletedServiceName] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);

  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Cargar catálogos relacionados
  useEffect(() => {
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
      } catch {
        setServiceStatuses([]); setServiceClassifications([]);
        setServiceCategories([]); setServiceTypes([]); setServiceIncludes([]);
      } finally { setCatalogsLoading(false); }
    };
    fetchCatalogs();
  }, []);

  // Cargar servicios
  useEffect(() => { fetchServices(); }, []);
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/services`);
      setServices(res.data);
      setError(null);
    } catch {
      setError("Error loading services.");
    } finally {
      setLoading(false);
    }
  };

  // Helpers para mostrar nombres legibles
  const getName = (arr: any[], id: number | string, key: string, label: string) =>
    !id ? "N/A" : (arr.find((x: any) => x[key] === Number(id))?.[label] || `${label.replace('_name','')} ID: ${id}`);
  const getStatusName = (id: number | string) => getName(serviceStatuses, id, "id_service_status", "status_name");
  const getClassificationName = (id: number | string) => getName(serviceClassifications, id, "id_service_classification", "service_classification_name");
  const getCategoryName = (id: number | string) => getName(serviceCategories, id, "id_service_category", "service_category_name");
  const getTypeName = (id: number | string) => getName(serviceTypes, id, "id_service_type", "service_type_name");
  const getIncludeName = (id: number | string) => getName(serviceIncludes, id, "id_service_include", "service_include");
  const getBooleanValue = (v: any) => v === true || v === 1 || v === '1' || (typeof v === 'string' && v.toLowerCase() === 'true');

  // Verificar dependencias antes de eliminar
  const checkServiceUsage = async (serviceId: number) => {
    try {
      const endpoints = [
        { url: '/catalog/service-per-customer', label: 'Customer Service', name: (cs: any) => `Customer ID: ${cs.id_customer || cs.customer_id} - Service: ${cs.service_name || cs.id_service}`, id: (cs: any) => cs.id_service_per_customer || cs.id },
        { url: '/catalog/customer-services', label: 'Service Customer', name: (sc: any) => `Customer: ${sc.customer_name || sc.id_customer} - Service: ${sc.service_name || sc.id_service}`, id: (sc: any) => sc.id || sc.id_customer_service },
        { url: '/work-orders', label: 'Work Order', name: (wo: any) => `Work Order: ${wo.work_order_number || wo.id}`, id: (wo: any) => wo.id },
        { url: '/quotes', label: 'Quote', name: (q: any) => `Quote: ${q.quote_number || q.id}`, id: (q: any) => q.id },
        { url: '/reports/operation-report', label: 'Operation Report', name: (r: any) => `Report: ${r.cliente} - ${r.servicio_principal || r.id_service}`, id: (r: any) => r.id },
        { url: '/reports/service-executions', label: 'Service Execution', name: (e: any) => `Execution: Work Order ${e.work_order || e.id}`, id: (e: any) => e.id },
        { url: '/billing/invoices', label: 'Invoice', name: (i: any) => `Invoice: ${i.invoice_number || i.id}`, id: (i: any) => i.id },
        { url: '/maintenance/plans', label: 'Maintenance Plan', name: (p: any) => `Plan: ${p.plan_name || p.id}`, id: (p: any) => p.id },
        { url: '/components', label: 'Component', name: (c: any) => `Component: ${c.component_name || c.id}`, id: (c: any) => c.id },
        { url: '/contracts', label: 'Contract', name: (ct: any) => `Contract: ${ct.contract_number || ct.id}`, id: (ct: any) => ct.id }
      ];
      const serviceIdFields = ['id_service', 'service_id', 'id_servicio', 'servicio_id', 'service'];
      let allDependentRecords: any[] = [];
      for (const { url, label, name, id } of endpoints) {
        try {
          const res = await axiosInstance.get(url);
          allDependentRecords.push(
            ...res.data.filter((item: any) =>
              serviceIdFields.some(f => item[f] !== undefined && (Number(item[f]) === serviceId || String(item[f]) === String(serviceId)))
            ).map((item: any) => ({ type: label, name: name(item), id: id(item) }))
          );
        } catch {}
      }
      return { inUse: allDependentRecords.length > 0, records: allDependentRecords };
    } catch {
      return { inUse: true, records: [{ type: 'Unknown', name: 'Error checking dependencies', id: 0 }] };
    }
  };

  // Eliminar servicio
  const handleDeleteClick = async (id: number, name: string) => {
    setIsDeleting(true);
    const { inUse, records } = await checkServiceUsage(id);
    setIsDeleting(false);
    if (inUse) {
      setDeleteErrorMessage("Cannot delete service because it is currently being used in the system.");
      setDependentRecords(records);
      setShowDeleteError(true);
      setServiceToDelete(null);
      return;
    }
    setServiceToDelete({id, name});
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    const { inUse, records } = await checkServiceUsage(serviceToDelete.id);
    if (inUse) {
      setDeleteErrorMessage("Cannot delete service because it is currently being used in the system.");
      setDependentRecords(records);
      setShowConfirmation(false);
      setShowDeleteError(true);
      setIsDeleting(false);
      setServiceToDelete(null);
      return;
    }
    try {
      await axiosInstance.delete(`/catalog/services/${serviceToDelete.id}`);
      setDeletedServiceName(serviceToDelete.name);
      setShowConfirmation(false);
      await fetchServices();
      setError(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      setDeleteErrorMessage(
        err.response?.status === 409 || err.response?.status === 400 ||
        (err.response?.data?.detail && (
          err.response.data.detail.includes("constraint") ||
          err.response.data.detail.includes("used") ||
          err.response.data.detail.includes("dependency")
        ))
          ? "Cannot delete service because it is currently being used in the system."
          : `Error deleting service "${serviceToDelete.name}". Please try again later.`
      );
      setDependentRecords([]);
      setShowConfirmation(false);
      setShowDeleteError(true);
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => { setShowConfirmation(false); setServiceToDelete(null); };
  const closeSuccessModal = () => { setShowDeleteSuccess(false); setDeletedServiceName(""); };
  const closeDeleteErrorModal = () => { setShowDeleteError(false); setDeleteErrorMessage(""); setDependentRecords([]); };

  // Foco en modales
  useEffect(() => { if (showDeleteSuccess) setTimeout(() => deleteSuccessOkButtonRef.current?.focus(), 100); }, [showDeleteSuccess]);
  useEffect(() => { if (showConfirmation) setTimeout(() => deleteConfirmButtonRef.current?.focus(), 100); }, [showConfirmation]);
  useEffect(() => { if (showDeleteError) setTimeout(() => deleteErrorOkButtonRef.current?.focus(), 100); }, [showDeleteError]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showDeleteSuccess) { e.preventDefault(); closeSuccessModal(); }
        else if (showConfirmation && !isDeleting) { e.preventDefault(); confirmDelete(); }
        else if (showDeleteError) { e.preventDefault(); closeDeleteErrorModal(); }
      } else if (e.key === 'Escape') {
        if (showConfirmation && !isDeleting) { e.preventDefault(); cancelDelete(); }
        else if (showDeleteSuccess) { e.preventDefault(); closeSuccessModal(); }
        else if (showDeleteError) { e.preventDefault(); closeDeleteErrorModal(); }
      }
    };
    if (showConfirmation || showDeleteSuccess || showDeleteError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showConfirmation, showDeleteSuccess, showDeleteError, isDeleting, serviceToDelete]);

  // Filtro local
  const filteredServices = services.filter((s) => {
    if (!search.trim()) return true;
    const searchLower = search.trim().toLowerCase();
    return [
      getStatusName(s.id_service_status),
      getClassificationName(s.id_service_classification),
      getCategoryName(s.id_service_category),
      getTypeName(s.id_service_type),
      getIncludeName(s.id_service_include),
      getBooleanValue(s.service_aircraft_type) ? "yes" : "no",
      getBooleanValue(s.service_by_time) ? "by hour" : "by event",
      getBooleanValue(s.min_time_configured) ? "yes" : "no",
      getBooleanValue(s.service_technicians_included) ? "yes" : "no",
      (s.whonew || "-"),
      (s.service_code || ""),
      (s.service_name || ""),
      (s.service_description || "")
    ].some(val => val.toString().toLowerCase().includes(searchLower));
  });

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
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <div className="h-full w-full overflow-auto">
            {loading || catalogsLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
              </div>
            ) : (
              <table className="border-collapse" style={{ minWidth: 'max-content' }}>
                <thead className="sticky top-0 z-10">
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
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-8 text-center text-white bg-transparent">
                        No services found.
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((s) => (
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(s.id_service, s.service_name)}
                              disabled={isDeleting && serviceToDelete?.id === s.id_service}
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
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Success
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
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

        {/* Modal de error */}
        {showDeleteError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Cannot Delete Service
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
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