import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link } from "react-router-dom";
import AISGBackground from "./fondo"; // Import from fondo.tsx

const CatalogClassif: React.FC = () => {
  const [classifications, setClassifications] = useState<any[]>([]);
  const [allClassifications, setAllClassifications] = useState<any[]>([]);
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
  const [dependentRecords, setDependentRecords] = useState<any[]>([]); // Aunque no se usa activamente en UI, se mantiene por si es necesario a futuro.

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

  // Obtener todas las clasificaciones solo una vez
  const fetchClassifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/service-classification`);
      setAllClassifications(res.data);
      setClassifications(res.data);
      setError(null);
    } catch (err: any) {
      setError("Could not load classifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtro en frontend desde la primera letra
  useEffect(() => {
    if (search.trim() === "") {
      setClassifications(allClassifications);
    } else {
      setClassifications(
        allClassifications.filter(c =>
          (c.service_classification_name || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search, allClassifications]);

  const checkClassificationUsage = useCallback(async (classificationId: number): Promise<{ inUse: boolean; records: any[] }> => {
    const allDependentRecords: any[] = [];

    const fetchAndProcess = async (
      path: string,
      filterFn: (item: any, id: number) => boolean,
      mapperFn: (item: any) => any,
      warnMsg: string
    ) => {
      try {
        const response = await axiosInstance.get(path);
        return response.data.filter((item: any) => filterFn(item, classificationId)).map(mapperFn);
      } catch (err) {
        console.warn(`${warnMsg}:`, err);
        return []; // Retornar array vacío en caso de error para este endpoint específico
      }
    };

    const promises = [
      fetchAndProcess('/catalog/services', (item, id) => item.id_service_classification === id, item => ({ type: 'Service', name: `${item.service_code} - ${item.service_name}`, id: item.id_service }), "Error checking services"),
      fetchAndProcess('/components', (item, id) => item.id_service_classification === id || item.classification_id === id, item => ({ type: 'Component', name: `Component: ${item.component_name || item.component_number || item.id}`, id: item.id }), "Error checking components"),
      fetchAndProcess('/catalog/service-per-customer', (item, id) => item.service_classification_id === id, item => ({ type: 'Customer Service', name: `Customer ID: ${item.id_customer} - Service: ${item.service_name || item.id_service}`, id: item.id_service_per_customer }), "Error checking customer services"),
      fetchAndProcess('/work-orders', (item, id) => item.service_classification_id === id, item => ({ type: 'Work Order', name: `Work Order: ${item.work_order_number || item.id}`, id: item.id }), "Error checking work orders"),
      fetchAndProcess('/quotes', (item, id) => item.service_classification_id === id, item => ({ type: 'Quote', name: `Quote: ${item.quote_number || item.id}`, id: item.id }), "Error checking quotes"),
      fetchAndProcess('/reports/operation-report', (item, id) => item.classification_id === id, item => ({ type: 'Operation Report', name: `Report: ${item.cliente} - ${item.servicio_principal}`, id: item.id }), "Error checking operation reports"),
      fetchAndProcess('/reports/service-executions', (item, id) => item.classification_id === id, item => ({ type: 'Service Execution', name: `Execution: Work Order ${item.work_order}`, id: item.id }), "Error checking service executions"),
      fetchAndProcess('/billing/invoices', (item, id) => item.classification_id === id, item => ({ type: 'Invoice', name: `Invoice: ${item.invoice_number || item.id}`, id: item.id }), "Error checking invoices"),
    ];

    try {
      const results = await Promise.all(promises);
      results.forEach(recordsSegment => allDependentRecords.push(...recordsSegment));
      return {
        inUse: allDependentRecords.length > 0,
        records: allDependentRecords // `records` se devuelve aunque no se use explícitamente en UI de error actual
      };
    } catch (err) {
      // Este catch es un fallback, ya que fetchAndProcess maneja errores individuales.
      // Promise.all rechaza si alguna promesa interna rechaza *sin ser atrapada*.
      // Como fetchAndProcess atrapa sus propios errores y devuelve [], Promise.all no debería rechazar aquí.
      console.error("Error aggregating classification usage checks:", err);
      return { inUse: false, records: [] };
    }
  }, []); // axiosInstance es estable, classificationId es un argumento.

  const closeDeleteSuccessPopup = useCallback(() => {
    setShowDeleteSuccessPopup(false);
    setDeletedItemName("");
  }, []);

  const closeDeleteErrorPopup = useCallback(() => {
    setShowDeleteErrorPopup(false);
    setDeleteErrorMessage("");
    setDependentRecords([]);
  }, []);

  const cancelDelete = useCallback(() => {
    setShowDeletePopup(false);
    setDeleteItemId(null);
    setDeleteItemName("");
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteItemId === null) return;

    setIsDeleting(true);
    try {
      const { inUse } = await checkClassificationUsage(deleteItemId);

      if (inUse) {
        setDeleteErrorMessage(
          `Cannot delete classification "${deleteItemName}" because it is currently being used in the system.`
        );
        setShowDeletePopup(false);
        setShowDeleteErrorPopup(true);
        setDeleteItemId(null);
        setDeleteItemName("");
        setIsDeleting(false);
        return;
      }

      await axiosInstance.delete(`/catalog/service-classification/${deleteItemId}`);
      setDeletedItemName(deleteItemName);
      setShowDeletePopup(false);
      setDeleteItemId(null);
      setDeleteItemName("");
      setShowDeleteSuccessPopup(true);
      fetchClassifications();
      setError(null);

    } catch (err: any) {
      console.error("Error deleting classification:", err);
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete classification "${deleteItemName}" because it is currently being used in the system.`
        );
        setShowDeleteErrorPopup(true);
      } else {
        setError("Could not delete the classification. Please try again.");
      }
      setShowDeletePopup(false);
      setDeleteItemId(null);
      setDeleteItemName("");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItemId, deleteItemName, checkClassificationUsage, fetchClassifications /* setters y axiosInstance son estables */]);

  const handleDelete = useCallback(async (id: number, name: string) => {
    setIsDeleting(true);
    // `records` no se usa directamente en el popup de error actual, pero se obtiene.
    const { inUse /*, records */ } = await checkClassificationUsage(id);
    

    if (inUse) {
      setDeleteErrorMessage(
        `Cannot delete classification "${name}" because it is currently being used in the system.`
      );
      // setDependentRecords(records); // Si se quisiera mostrar detalles en el popup de error
      setShowDeleteErrorPopup(true);
      setIsDeleting(false); // Asegurarse de resetear isDeleting aquí también
      return;
    }
    setDeleteItemId(id);
    setDeleteItemName(name);
    setShowDeletePopup(true);
    // setIsDeleting(false) se maneja en el flujo del popup o si el usuario cancela.
    // O, si la verificación es rápida y no queremos mantener el spinner del botón de la fila activo hasta que el popup aparezca:
    setIsDeleting(false); 
  }, [checkClassificationUsage /* setters son estables */]);

  // Efecto para manejar Enter/Escape en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== 'Escape') return;

      let actionTaken = false;

      if (showDeleteSuccessPopup) {
        closeDeleteSuccessPopup();
        actionTaken = true;
      } else if (showDeletePopup && !isDeleting) {
        if (e.key === 'Enter') {
          confirmDelete();
        } else if (e.key === 'Escape') {
          cancelDelete();
        }
        actionTaken = true;
      } else if (showDeleteErrorPopup) {
        closeDeleteErrorPopup();
        actionTaken = true;
      }

      if (actionTaken) {
        e.preventDefault();
      }
    };

    if (showDeletePopup || showDeleteSuccessPopup || showDeleteErrorPopup) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [
    showDeletePopup,
    showDeleteSuccessPopup,
    showDeleteErrorPopup,
    isDeleting,
    confirmDelete,
    cancelDelete,
    closeDeleteSuccessPopup,
    closeDeleteErrorPopup
  ]);

  useEffect(() => {
    fetchClassifications();
  }, [fetchClassifications]); // fetchClassifications ahora es memoizada y depende de 'search'

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
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center py-12 bg-transparent">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {classifications.length === 0 ? (
                <div className="px-4 py-4 text-center text-white bg-transparent">
                  No records found
                </div>
              ) : (
                <>
                  {/* Vista de Tabla para md y superior */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                            Created/Modified By
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                            Created At
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                            Updated At
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-[#002057] border border-[#cccccc]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {classifications.map((c) => (
                          <tr key={c.id_service_classification} className="bg-transparent">
                            <td className="px-4 py-3 border border-[#1e3462] font-medium text-white">{c.service_classification_name}</td>
                            <td className="px-4 py-3 border border-[#1e3462] text-white">{c.whonew ? c.whonew : "-"}</td>
                            <td className="px-4 py-3 border border-[#1e3462] text-white">
                              {c.create_at ? new Date(c.create_at).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 border border-[#1e3462] text-white">
                              {c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 border border-[#1e3462]">
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
                                  {isDeleting && deleteItemId === c.id_service_classification ? ( 
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista de Tarjetas para sm e inferior */}
                  <div className="block md:hidden">
                    {classifications.map((c) => (
                      <div key={c.id_service_classification} className="bg-transparent border border-[#1e3462] rounded-lg p-4 mb-4 text-white shadow-md">
                        <div className="mb-2">
                          <strong className="text-gray-300 block text-sm">Name:</strong>
                          <span className="text-lg font-medium">{c.service_classification_name}</span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-gray-300 block text-sm">Created/Modified By:</strong>
                          <span>{c.whonew ? c.whonew : "-"}</span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-gray-300 block text-sm">Created At:</strong>
                          <span>{c.create_at ? new Date(c.create_at).toLocaleString() : "-"}</span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-gray-300 block text-sm">Updated At:</strong>
                          <span>{c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#1e3462] flex items-center justify-end space-x-2">
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
                            {isDeleting && deleteItemId === c.id_service_classification ? (
                              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Popup de confirmación de eliminación */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Confirm Deletion
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
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
                      onKeyDown={(e) => { // Mantener por si el foco está aquí y no en document
                        if (e.key === 'Enter') { e.preventDefault(); cancelDelete(); }
                      }}
                      className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      ref={deleteConfirmButtonRef}
                      onClick={confirmDelete}
                      onKeyDown={(e) => { // Mantener por si el foco está aquí y no en document
                        if (e.key === 'Enter') { e.preventDefault(); confirmDelete(); }
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
                <p className="text-white text-lg">
                  Classification "{deletedItemName}" has been successfully deleted!
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={deleteSuccessOkButtonRef}
                  onClick={closeDeleteSuccessPopup}
                   onKeyDown={(e) => { // Mantener por si el foco está aquí y no en document
                        if (e.key === 'Enter') { e.preventDefault(); closeDeleteSuccessPopup(); }
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
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Cannot Delete Classification
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
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
                  onKeyDown={(e) => { // Mantener por si el foco está aquí y no en document
                        if (e.key === 'Enter') { e.preventDefault(); closeDeleteErrorPopup(); }
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