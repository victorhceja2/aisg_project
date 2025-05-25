import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Estados para modales
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<{id: number, name: string} | null>(null);
  const [deletedStatusName, setDeletedStatusName] = useState("");
  const [deletingStatus, setDeletingStatus] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [servicesUsingStatus, setServicesUsingStatus] = useState<any[]>([]);

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
        } else if (showDeleteConfirmation && !deletingStatus) {
          e.preventDefault();
          handleDelete();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      } else if (e.key === 'Escape') {
        if (showDeleteConfirmation && !deletingStatus) {
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
  }, [showDeleteConfirmation, showDeleteSuccess, showDeleteError, deletingStatus]);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/service-status/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setStatuses(res.data);
      setError(null);
    } catch (err) {
      setError("Could not load service statuses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un status está siendo utilizado por servicios
  const checkStatusUsage = async (statusId: number): Promise<{ inUse: boolean; services: any[] }> => {
    try {
      const res = await axiosInstance.get('/catalog/services');
      const servicesUsingStatus = res.data.filter((service: any) => 
        service.id_service_status === statusId
      );
      
      return {
        inUse: servicesUsingStatus.length > 0,
        services: servicesUsingStatus
      };
    } catch (err) {
      console.error("Error checking status usage:", err);
      return { inUse: false, services: [] };
    }
  };

  const confirmDelete = async (id: number, name: string) => {
    // Verificar si el status está siendo utilizado
    const { inUse, services } = await checkStatusUsage(id);
    
    if (inUse) {
      // Mostrar popup de error con la lista de servicios que lo utilizan
      setServicesUsingStatus(services);
      setDeleteErrorMessage(
        `Cannot delete service status "${name}" because it is being used by ${services.length} service(s).`
      );
      setShowDeleteError(true);
      return;
    }

    // Si no está en uso, proceder con la confirmación de eliminación
    setStatusToDelete({ id, name });
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    if (!statusToDelete) return;
    
    try {
      setDeletingStatus(true);
      
      // Verificar una vez más antes de eliminar
      const { inUse, services } = await checkStatusUsage(statusToDelete.id);
      
      if (inUse) {
        // Si ahora está en uso, mostrar error
        setServicesUsingStatus(services);
        setDeleteErrorMessage(
          `Cannot delete service status "${statusToDelete.name}" because it is being used by ${services.length} service(s).`
        );
        setShowDeleteConfirmation(false);
        setShowDeleteError(true);
        setStatusToDelete(null);
        return;
      }

      await axiosInstance.delete(`/catalog/service-status/${statusToDelete.id}`);
      setDeletedStatusName(statusToDelete.name);
      setShowDeleteConfirmation(false);
      setStatusToDelete(null);
      fetchStatuses();
      setError(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      console.error("Error deleting status:", err);
      
      // Verificar si el error es por dependencias
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete service status "${statusToDelete.name}" because it is being used by other records in the system.`
        );
        setShowDeleteConfirmation(false);
        setShowDeleteError(true);
      } else {
        let errorMessage = "Could not delete the status. It may be used by an active service.";
        
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
        
        setError(errorMessage);
        setShowDeleteConfirmation(false);
      }
      
      setStatusToDelete(null);
    } finally {
      setDeletingStatus(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setStatusToDelete(null);
  };

  const closeSuccessModal = () => {
    setShowDeleteSuccess(false);
    setDeletedStatusName("");
  };

  const closeDeleteErrorModal = () => {
    setShowDeleteError(false);
    setDeleteErrorMessage("");
    setServicesUsingStatus([]);
  };

  useEffect(() => {
    fetchStatuses();
  }, [search]);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Service Status Catalog</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the different statuses that services can have
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
              placeholder="Search status..."
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
            to="/catalogs/status/add"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Status
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
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Created/Modified By</th>
                  <th className="px-4 py-3 text-left font-semibold">Created At</th>
                  <th className="px-4 py-3 text-left font-semibold">Updated At</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#1E2A45]">
                {statuses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-white">
                      No records found
                    </td>
                  </tr>
                ) : (
                  statuses.map((s) => (
                    <tr key={s.id_service_status} className="hover:bg-[#1E2A45] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{s.status_name}</td>
                      <td className="px-4 py-3 text-white">{s.whonew || "-"}</td>
                      <td className="px-4 py-3 text-white">
                        {s.create_at ? new Date(s.create_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {s.updated_at ? new Date(s.updated_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/catalogs/status/edit/${s.id_service_status}`}
                            className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => confirmDelete(s.id_service_status, s.status_name)}
                            className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
      {showDeleteConfirmation && statusToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Confirm Deletion
              </h2>
              <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
            </div>

            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] py-8 px-6">
              <div className="flex items-start gap-3">
                <div className="bg-red-600 rounded-full p-2 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white text-lg mt-1">
                  Are you sure you want to delete the status "{statusToDelete.name}"? This action cannot be undone.
                </p>
              </div>

              {/* Botones uno al lado del otro como en la imagen */}
              <div className="mt-8 flex gap-3">
                {deletingStatus ? (
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
                      className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      ref={deleteConfirmButtonRef}
                      onClick={handleDelete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDelete();
                        }
                      }}
                      className="w-1/2 bg-[#e6001f] hover:bg-red-700 text-white font-medium py-3 px-4 rounded transition-all"
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
          <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
            <div className="bg-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Success
              </h2>
              <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
            </div>

            <div className="bg-[#1E2A45] py-8 px-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white text-lg">
                  Status "{deletedStatusName}" has been successfully deleted!
                </p>
              </div>

              <div className="mt-8">
                <button
                  ref={deleteSuccessOkButtonRef}
                  onClick={closeSuccessModal}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeSuccessModal();
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded transition-all"
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
                Cannot Delete
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
                  {servicesUsingStatus.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white text-sm font-medium mb-2">Services using this status:</p>
                      <div className="bg-[#0D1423] rounded-lg p-3 max-h-32 overflow-y-auto">
                        {servicesUsingStatus.map((service, index) => (
                          <div key={service.id_service} className="text-gray-300 text-sm py-1">
                            • {service.service_code} - {service.service_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={deleteErrorOkButtonRef}
                  onClick={closeDeleteErrorModal}
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

export default CatalogStatus;