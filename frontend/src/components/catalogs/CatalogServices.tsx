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
      console.log("Fetching catalogs...");
      
      // Usar los endpoints correctos del backend, incluyendo clasificaciones
      const [statusRes, categoryRes, typeRes, includeRes, classificationRes] = await Promise.all([
        axiosInstance.get('/catalog/service-status'),
        axiosInstance.get('/catalog/service-categories'),
        axiosInstance.get('/catalog/service-types'),
        axiosInstance.get('/catalog/service-includes'),
        axiosInstance.get('/catalog/service-classification') // Agregado endpoint de clasificaciones
      ]);

      console.log("Service Statuses:", statusRes.data);
      console.log("Service Categories:", categoryRes.data);
      console.log("Service Types:", typeRes.data);
      console.log("Service Includes:", includeRes.data);
      console.log("Service Classifications:", classificationRes.data); // Log para verificar datos

      setServiceStatuses(statusRes.data);
      setServiceCategories(categoryRes.data);
      setServiceTypes(typeRes.data);
      setServiceIncludes(includeRes.data);
      setServiceClassifications(classificationRes.data); // Guardar datos de clasificaciones
      
    } catch (err) {
      console.error("Error loading catalogs:", err);
      // Si fallan los catálogos, usar valores por defecto
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
    if (!id) return "N/A";
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
  }, [search]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/services${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      console.log("Services data received:", res.data); // Debug para ver los datos exactos
      setServices(res.data);
      setError(null);
    } catch (err) {
      setError("Error loading services.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: number, name: string) => {
    // Implementación de la función de eliminación
    setServiceToDelete({id, name});
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/catalog/services/${serviceToDelete.id}`);
      setDeletedServiceName(serviceToDelete.name);
      setShowConfirmation(false);
      await fetchServices();
      setError(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      console.error("Error deleting service:", err);
      // Simplificar el mensaje de error para el usuario final
      setDeleteErrorMessage(
        `Cannot delete service "${serviceToDelete.name}" because it is currently being used in the system.`
      );
      setShowConfirmation(false);
      setShowDeleteError(true);
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

  return (
    <AISGBackground>
      <div className="flex flex-col h-screen w-full font-['Montserrat']">
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
                              disabled={isDeleting}
                              className="p-1 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {isDeleting ? (
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
            <div className="overflow-hidden max-w-lg w-full mx-4 rounded-lg shadow-xl">
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Error
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
                    OK
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