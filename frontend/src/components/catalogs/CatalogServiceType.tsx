/**
 * Catálogo de "Service Types" para AISG.
 * Permite listar, buscar, editar y eliminar tipos de servicio.
 * Valida dependencias antes de eliminar, mostrando modales de confirmación, éxito o error.
 * Utiliza React, axiosInstance y TailwindCSS para la UI y lógica de negocio.
 */

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';
import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

interface ServiceType {
  id_service_type: number;
  service_type_name: string;
  whonew?: string;
  create_at?: string;
  updated_at?: string;
}

interface DependentRecord {
  type: string;
  name: string;
  id: number | string;
}

const initialModalState = {
  showConfirmation: false,
  showSuccess: false,
  showError: false,
  itemToDelete: null as { id: number; name: string } | null,
  deletedItemName: "",
  errorMessage: "",
  isProcessing: false,
};

const CatalogServiceType: React.FC = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [allServiceTypes, setAllServiceTypes] = useState<ServiceType[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ ...initialModalState });
  const [dependentRecords, setDependentRecords] = useState<DependentRecord[]>([]);

  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Foco en botones de modales
  useEffect(() => {
    if (modalState.showSuccess) setTimeout(() => deleteSuccessOkButtonRef.current?.focus(), 100);
    else if (modalState.showConfirmation) setTimeout(() => deleteConfirmButtonRef.current?.focus(), 100);
    else if (modalState.showError) setTimeout(() => deleteErrorOkButtonRef.current?.focus(), 100);
  }, [modalState.showSuccess, modalState.showConfirmation, modalState.showError]);

  // Atajos de teclado en modales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (modalState.showSuccess) { e.preventDefault(); closeSuccessModal(); }
        else if (modalState.showConfirmation && !modalState.isProcessing) { e.preventDefault(); handleDelete(); }
        else if (modalState.showError) { e.preventDefault(); closeDeleteErrorModal(); }
      } else if (e.key === 'Escape') {
        if (modalState.showConfirmation && !modalState.isProcessing) { e.preventDefault(); cancelDelete(); }
        else if (modalState.showSuccess) { e.preventDefault(); closeSuccessModal(); }
        else if (modalState.showError) { e.preventDefault(); closeDeleteErrorModal(); }
      }
    };
    if (modalState.showConfirmation || modalState.showSuccess || modalState.showError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalState]);

  // Cargar tipos de servicio
  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/service-types`);
      setAllServiceTypes(res.data);
      setServiceTypes(res.data);
      setError(null);
    } catch {
      setError("Could not load service types. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado en frontend
  useEffect(() => {
    setServiceTypes(
      !search.trim()
        ? allServiceTypes
        : allServiceTypes.filter(t =>
            t.service_type_name.toLowerCase().includes(search.trim().toLowerCase())
          )
    );
  }, [search, allServiceTypes]);

  // Verificar dependencias antes de eliminar
  const checkServiceTypeUsage = async (typeId: number) => {
    const endpoints = [
      { endpoint: '/catalog/services', idField: 'id_service_type', name: (i: any) => `${i.service_code} - ${i.service_name}`, type: 'Service', idKey: 'id_service' },
      { endpoint: '/components', idField: 'id_service_type', name: (i: any) => `Component: ${i.component_name || i.component_number || i.id}`, type: 'Component', idKey: 'id' },
      { endpoint: '/catalog/service-per-customer', idField: 'service_type_id', name: (i: any) => `Customer ID: ${i.id_customer} - Service: ${i.service_name || i.id_service}`, type: 'Customer Service', idKey: 'id_service_per_customer' },
      { endpoint: '/work-orders', idField: 'service_type_id', name: (i: any) => `Work Order: ${i.work_order_number || i.id}`, type: 'Work Order', idKey: 'id' },
      { endpoint: '/quotes', idField: 'service_type_id', name: (i: any) => `Quote: ${i.quote_number || i.id}`, type: 'Quote', idKey: 'id' },
      { endpoint: '/reports/operation-report', idField: 'type_id', name: (i: any) => `Report: ${i.cliente} - ${i.servicio_principal}`, type: 'Operation Report', idKey: 'id' },
      { endpoint: '/reports/service-executions', idField: 'type_id', name: (i: any) => `Execution: Work Order ${i.work_order}`, type: 'Service Execution', idKey: 'id' },
      { endpoint: '/billing/invoices', idField: 'type_id', name: (i: any) => `Invoice: ${i.invoice_number || i.id}`, type: 'Invoice', idKey: 'id' },
    ];
    let allRecords: DependentRecord[] = [];
    for (const { endpoint, idField, name, type, idKey } of endpoints) {
      try {
        const res = await axiosInstance.get(endpoint);
        allRecords.push(
          ...res.data
            .filter((item: any) => item[idField] === typeId)
            .map((item: any) => ({ type, name: name(item), id: item[idKey] }))
        );
      } catch {}
    }
    return { inUse: allRecords.length > 0, records: allRecords };
  };

  // Confirmar eliminación
  const confirmDelete = async (id: number, name: string) => {
    setModalState(prev => ({ ...prev, isProcessing: true }));
    const { inUse, records } = await checkServiceTypeUsage(id);
    setModalState(prev => ({ ...prev, isProcessing: false }));
    if (inUse) {
      setDependentRecords(records);
      setModalState(prev => ({
        ...prev,
        showError: true,
        errorMessage: `Cannot delete service type "${name}" because it is currently being used in the system.`
      }));
      return;
    }
    setModalState(prev => ({ ...prev, showConfirmation: true, itemToDelete: { id, name } }));
  };

  // Eliminar tipo de servicio
  const handleDelete = async () => {
    if (!modalState.itemToDelete) return;
    setModalState(prev => ({ ...prev, isProcessing: true }));
    const { inUse, records } = await checkServiceTypeUsage(modalState.itemToDelete.id);
    if (inUse) {
      setDependentRecords(records);
      setModalState(prev => ({
        ...prev,
        showConfirmation: false,
        showError: true,
        errorMessage: `Cannot delete service type "${modalState.itemToDelete?.name}" because it is currently being used in the system.`,
        itemToDelete: null,
        isProcessing: false
      }));
      return;
    }
    try {
      await axiosInstance.delete(`/catalog/service-types/${modalState.itemToDelete.id}`);
      setModalState({
        ...initialModalState,
        showSuccess: true,
        deletedItemName: modalState.itemToDelete.name
      });
      fetchServiceTypes();
      setError(null);
    } catch (err: any) {
      let message = `Could not delete the service type "${modalState.itemToDelete?.name}".`;
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        message = `Cannot delete service type "${modalState.itemToDelete?.name}" because it is currently being used in the system.`;
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail;
      }
      setModalState(prev => ({
        ...prev,
        showConfirmation: false,
        showError: true,
        errorMessage: message,
        itemToDelete: null,
        isProcessing: false
      }));
    }
  };

  const cancelDelete = () => setModalState(prev => ({ ...prev, showConfirmation: false, itemToDelete: null }));
  const closeSuccessModal = () => setModalState(prev => ({ ...prev, showSuccess: false, deletedItemName: "" }));
  const closeDeleteErrorModal = () => {
    setModalState(prev => ({ ...prev, showError: false, errorMessage: "" }));
    setDependentRecords([]);
  };

  useEffect(() => { fetchServiceTypes(); }, []);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Service Types Catalog</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the different service types
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-2/3 relative">
            <input
              type="text"
              placeholder="Search service type..."
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
            to="/catalogs/servicetype/add"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Service Type
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
                <tr className="bg-white text-[#002057]">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Created/Modified By</th>
                  <th className="px-4 py-3 text-left font-semibold">Created At</th>
                  <th className="px-4 py-3 text-left font-semibold">Updated At</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#1E2A45]">
                {serviceTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-white">
                      No records found
                    </td>
                  </tr>
                ) : (
                  serviceTypes.map((t) => (
                    <tr key={t.id_service_type} className="hover:bg-[#1E2A45] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{t.service_type_name}</td>
                      <td className="px-4 py-3 text-white">{t.whonew || "-"}</td>
                      <td className="px-4 py-3 text-white">
                        {t.create_at ? new Date(t.create_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {t.updated_at ? new Date(t.updated_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/catalogs/servicetype/edit/${t.id_service_type}`}
                            className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => confirmDelete(t.id_service_type, t.service_type_name)}
                            disabled={modalState.isProcessing}
                            className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {modalState.isProcessing && modalState.itemToDelete?.id === t.id_service_type ? (
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
        {/* Modal de confirmación */}
        {modalState.showConfirmation && modalState.itemToDelete && (
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
                      The service type "{modalState.itemToDelete.name}" will be permanently deleted.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  {modalState.isProcessing ? (
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
                        onClick={handleDelete}
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
        {/* Modal de éxito */}
        {modalState.showSuccess && (
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
                    Service type "{modalState.deletedItemName}" has been successfully deleted!
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
        {/* Modal de error */}
        {modalState.showError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">Cannot Delete Service Type</h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
              <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                <div className="flex items-center mb-4">
                  <div className="bg-[#f59e0b] rounded-full p-2 mr-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-white text-lg">{modalState.errorMessage}</p>
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

export default CatalogServiceType;