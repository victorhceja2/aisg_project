import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Definición de la URL base para la API
const API_BASE_URL = "http://82.165.213.124:8000";

interface ExtraServiceAssignment {
  id_xtra_sale_employee: number;
  id_service_per_customer: number;
  id_sale_flight: number;
  id_sale_employee: number;
  work_order: string;
  status: boolean;
}

const ExtraServiceSaleAssignment: React.FC = () => {
  // Colores AISG según el manual de identidad corporativa
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    darkBgSecondary: "#16213E",
    darkBgTertiary: "#0D1B2A",
    darkBgPanel: "#1E2A45",
  };

  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<ExtraServiceAssignment[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id_service_per_customer: "",
    id_sale_flight: "",
    id_sale_employee: "",
    work_order: "",
    status: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const res = await axios.get(
        `${API_BASE_URL}/catalog/extra-service-sale-assignment${
          search ? `?work_order=${encodeURIComponent(search)}` : ""
        }`
      );
      setAssignments(res.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error al obtener asignaciones", err);
      setError("No se pudieron cargar las asignaciones. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Validar los datos del formulario
      if (!form.id_service_per_customer || !form.id_sale_flight || !form.id_sale_employee || !form.work_order) {
        setError("Por favor complete todos los campos obligatorios.");
        setIsLoading(false);
        return;
      }
      
      await axios.post(`${API_BASE_URL}/catalog/extra-service-sale-assignment`, {
        id_service_per_customer: parseInt(form.id_service_per_customer),
        id_sale_flight: parseInt(form.id_sale_flight),
        id_sale_employee: parseInt(form.id_sale_employee),
        work_order: form.work_order,
        status: form.status
      });
      
      // Actualizar la lista y mostrar mensaje de éxito
      await fetchAssignments();
      setSuccess("Asignación creada correctamente");
      
      // Limpiar el formulario
      setForm({
        id_service_per_customer: "",
        id_sale_flight: "",
        id_sale_employee: "",
        work_order: "",
        status: true
      });
      
      setIsLoading(false);
      
      // Limpiar mensaje de éxito después de 2 segundos
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      console.error("Error al guardar asignación", err);
      setError("No se pudo guardar la asignación. Verifique los datos e intente nuevamente.");
      setIsLoading(false);
    }
  };

  const handleEditClick = (id: number) => {
    navigate(`/catalog/extra-service/edit/${id}`);
  };

  const handleAddNewClick = () => {
    navigate("/catalog/extra-service/add");
  };

  const handleDeleteConfirm = (id: number) => {
    setDeleteConfirm(id);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      setError("");
      
      await axios.delete(`${API_BASE_URL}/catalog/extra-service-sale-assignment/${id}`);
      
      // Actualizar la lista después de eliminar
      await fetchAssignments();
      
      // Actualizar el estado de la interfaz
      setDeleteConfirm(null);
      setSuccess("Asignación eliminada correctamente");
      setIsLoading(false);
      
      // Limpiar mensaje de éxito después de 2 segundos
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      console.error("Error al eliminar asignación", err);
      
      // Mostrar mensaje de error más detallado
      if (err.response) {
        setError(`Error (${err.response.status}): ${err.response.data.detail || "No se pudo eliminar la asignación"}`);
      } else {
        setError("No se pudo eliminar la asignación. Intente nuevamente.");
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  useEffect(() => {
    fetchAssignments();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera con logo y título */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg mb-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Asignación Extra de Servicios
              </h1>
              <p className="text-gray-200 mt-1 font-light">
                Gestión de asignaciones de servicios adicionales a vuelos y empleados
              </p>
            </div>
            
            {/* Logo de AISG */}
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-md">
                <svg className="w-10 h-10 text-[#0033A0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de error o éxito */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-400 text-red-100 px-4 py-3 rounded my-4 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-400 text-green-100 px-4 py-3 rounded my-4 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p>{success}</p>
          </div>
        )}

        {/* Barra de búsqueda y botón para agregar nuevo */}
        <div className="bg-[#16213E] p-6 rounded-t-lg shadow-lg border-l border-r border-t border-[#0033A0]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Listado de Asignaciones</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="w-full sm:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-[#1E2A45] text-white pl-10 pr-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                    placeholder="Buscar por orden de trabajo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddNewClick}
                className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nueva Asignación
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="bg-[#16213E] rounded-b-lg shadow-lg overflow-hidden border-l border-r border-b border-[#0033A0]/20">
          {isLoading && !deleteConfirm && (
            <div className="flex justify-center items-center p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-t-[#00B140] border-r-transparent border-b-[#0033A0] border-l-transparent"></div>
                <span className="text-gray-300">Cargando datos...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-[#0D1B2A] text-gray-300">
                  <th className="p-3 text-left font-semibold border-b border-[#0033A0]/20">ID</th>
                  <th className="p-3 text-left font-semibold border-b border-[#0033A0]/20">Servicio Cliente</th>
                  <th className="p-3 text-left font-semibold border-b border-[#0033A0]/20">Vuelo</th>
                  <th className="p-3 text-left font-semibold border-b border-[#0033A0]/20">Empleado</th>
                  <th className="p-3 text-left font-semibold border-b border-[#0033A0]/20">Orden de Trabajo</th>
                  <th className="p-3 text-center font-semibold border-b border-[#0033A0]/20">Estado</th>
                  <th className="p-3 text-center font-semibold border-b border-[#0033A0]/20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((a) => (
                    <tr key={a.id_xtra_sale_employee} className="border-b border-[#0D1B2A] hover:bg-[#1E2A45] transition-colors duration-150">
                      <td className="p-3 text-gray-200">{a.id_xtra_sale_employee}</td>
                      <td className="p-3 text-gray-200">{a.id_service_per_customer}</td>
                      <td className="p-3 text-gray-200">{a.id_sale_flight}</td>
                      <td className="p-3 text-gray-200">{a.id_sale_employee}</td>
                      <td className="p-3 text-gray-200">{a.work_order}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.status ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {a.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(a.id_xtra_sale_employee)}
                            className="text-[#4D70B8] hover:text-[#00B140] transition-colors duration-200"
                            title="Editar"
                            disabled={isLoading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(a.id_xtra_sale_employee)}
                            className="text-red-500 hover:text-red-400 transition-colors duration-200"
                            title="Eliminar"
                            disabled={isLoading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-400">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-10 w-10 border-3 border-t-[#00B140] border-r-transparent border-b-[#0033A0] border-l-transparent mb-4"></div>
                          <p>Cargando datos...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z"></path>
                          </svg>
                          <p>No se encontraron asignaciones</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pie de tabla con conteo */}
          {assignments.length > 0 && (
            <div className="p-4 bg-[#0D1B2A] border-t border-[#0033A0]/20 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Mostrando {assignments.length} {assignments.length === 1 ? "asignación" : "asignaciones"}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación de eliminación (Popup) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#16213E] rounded-lg shadow-lg max-w-md w-full p-6 border-2 border-red-500 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-white">Confirmar Eliminación</h2>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar la asignación #{deleteConfirm}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isLoading}
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraServiceSaleAssignment;