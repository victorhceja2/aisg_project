/**
 * Catálogo de "Service Include" para AISG.
 * Permite listar, buscar, editar y eliminar tipos de "service include".
 * Incluye validación de dependencias antes de eliminar, mostrando modales de confirmación, éxito o error.
 * Utiliza React, axiosInstance y TailwindCSS para la UI y lógica de negocio.
 */

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

  // Estados para modales y eliminación
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, name: string} | null>(null);
  const [deletedItemName, setDeletedItemName] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Referencias para foco en modales
  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Efectos para foco en botones de modales
  useEffect(() => { if (showDeleteSuccess) setTimeout(() => deleteSuccessOkButtonRef.current?.focus(), 100); }, [showDeleteSuccess]);
  useEffect(() => { if (showDeleteConfirmation) setTimeout(() => deleteConfirmButtonRef.current?.focus(), 100); }, [showDeleteConfirmation]);
  useEffect(() => { if (showDeleteError) setTimeout(() => deleteErrorOkButtonRef.current?.focus(), 100); }, [showDeleteError]);

  // Efecto para manejar teclas en modales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showDeleteSuccess) { e.preventDefault(); closeSuccessModal(); }
        else if (showDeleteConfirmation && !isDeleting) { e.preventDefault(); confirmDelete(); }
        else if (showDeleteError) { e.preventDefault(); closeDeleteErrorModal(); }
      } else if (e.key === 'Escape') {
        if (showDeleteConfirmation && !isDeleting) { e.preventDefault(); cancelDelete(); }
        else if (showDeleteSuccess) { e.preventDefault(); closeSuccessModal(); }
        else if (showDeleteError) { e.preventDefault(); closeDeleteErrorModal(); }
      }
    };
    if (showDeleteConfirmation || showDeleteSuccess || showDeleteError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDeleteConfirmation, showDeleteSuccess, showDeleteError, isDeleting]);

  // Obtener todos los includes
  const fetchIncludes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/service-includes`);
      setAllIncludes(res.data);
      setIncludes(res.data);
      setError(null);
    } catch {
      setError("Could not load service includes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filtro frontend
  useEffect(() => {
    setIncludes(
      search.trim() === ""
        ? allIncludes
        : allIncludes.filter(inc =>
            (inc.service_include || "")
              .toLowerCase()
              .includes(search.trim().toLowerCase())
          )
    );
  }, [search, allIncludes]);

  // Verificar dependencias antes de eliminar
  const checkServiceIncludeUsage = async (includeId: number) => {
    try {
      const endpoints = [
        { url: '/catalog/services', key: 'id_service_include', label: 'Service', name: (s: any) => `${s.service_code} - ${s.service_name}`, id: (s: any) => s.id_service },
        { url: '/components', key: 'id_service_include', label: 'Component', name: (c: any) => `Component: ${c.component_name || c.component_number || c.id}`, id: (c: any) => c.id },
        { url: '/components', key: 'include_id', label: 'Component', name: (c: any) => `Component: ${c.component_name || c.component_number || c.id}`, id: (c: any) => c.id },
        { url: '/catalog/service-per-customer', key: 'service_include_id', label: 'Customer Service', name: (cs: any) => `Customer ID: ${cs.id_customer} - Service: ${cs.service_name || cs.id_service}`, id: (cs: any) => cs.id_service_per_customer },
        { url: '/work-orders', key: 'service_include_id', label: 'Work Order', name: (wo: any) => `Work Order: ${wo.work_order_number || wo.id}`, id: (wo: any) => wo.id },
        { url: '/quotes', key: 'service_include_id', label: 'Quote', name: (q: any) => `Quote: ${q.quote_number || q.id}`, id: (q: any) => q.id },
        { url: '/reports/operation-report', key: 'include_id', label: 'Operation Report', name: (r: any) => `Report: ${r.cliente} - ${r.servicio_principal}`, id: (r: any) => r.id },
        { url: '/reports/service-executions', key: 'include_id', label: 'Service Execution', name: (e: any) => `Execution: Work Order ${e.work_order}`, id: (e: any) => e.id },
        { url: '/billing/invoices', key: 'include_id', label: 'Invoice', name: (i: any) => `Invoice: ${i.invoice_number || i.id}`, id: (i: any) => i.id }
      ];
      let allDependentRecords: any[] = [];
      for (const { url, key, label, name, id } of endpoints) {
        try {
          const res = await axiosInstance.get(url);
          allDependentRecords.push(
            ...res.data.filter((item: any) => item[key] === includeId)
              .map((item: any) => ({ type: label, name: name(item), id: id(item) }))
          );
        } catch {}
      }
      return { inUse: allDependentRecords.length > 0, records: allDependentRecords };
    } catch {
      return { inUse: false, records: [] };
    }
  };

  // Preparar eliminación
  const prepareDelete = async (id: number, name: string) => {
    setIsDeleting(true);
    const { inUse } = await checkServiceIncludeUsage(id);
    setIsDeleting(false);
    if (inUse) {
      setDeleteErrorMessage(`Cannot delete service include "${name}" because it is currently being used in the system.`);
      setShowDeleteError(true);
      return;
    }
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
    const { inUse } = await checkServiceIncludeUsage(itemToDelete.id);
    if (inUse) {
      setDeleteErrorMessage(`Cannot delete service include "${itemToDelete.name}" because it is currently being used in the system.`);
      setShowDeleteConfirmation(false);
      setShowDeleteError(true);
      setItemToDelete(null);
      setIsDeleting(false);
      return;
    }
    try {
      await axiosInstance.delete(`/catalog/service-includes/${itemToDelete.id}`);
      setDeletedItemName(itemToDelete.name);
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
      fetchIncludes();
      setError(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(`Cannot delete service include "${itemToDelete.name}" because it is currently being used in the system.`);
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
  };

  useEffect(() => { fetchIncludes(); }, []);

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
                      <td className="px-4 py-3 border border-[#1e3462] text-white">{inc.whonew || "-"}</td>
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

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirmation && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">Confirm Deletion</h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
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
                      className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      ref={deleteConfirmButtonRef}
                      onClick={confirmDelete}
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
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">Success</h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
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
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">Cannot Delete Service Include</h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-center mb-4">
                <div className="bg-[#f59e0b] rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white text-lg">{deleteErrorMessage}</p>
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