import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Added Link for consistency
// import AISGBackground from "./fondo"; // Assuming it might be used if this component becomes standalone

// Definición de la URL base para la API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Definición de la estructura de datos para una asignación extra de servicio a venta
interface ExtraServiceAssignment {
  id_xtra_sale_employee: number;
  id_service_per_customer: number;
  id_sale_flight: number;
  id_sale_employee: number;
  work_order: string;
  status: boolean;
}

const ExtraServiceSaleAssignment: React.FC = () => {
  // Hook para navegación programática
  const navigate = useNavigate();
  // Estado para la lista de asignaciones extra obtenidas del backend
  const [assignments, setAssignments] = useState<ExtraServiceAssignment[]>([]);
  // Estado para el valor del campo de búsqueda (por orden de trabajo)
  const [search, setSearch] = useState("");
  // Estado para mostrar spinner de carga
  const [isLoading, setIsLoading] = useState(true); // Set to true initially
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null); // Consistent type
  // Estado para mensajes de éxito
  const [success, setSuccess] = useState<string | null>(null); // Consistent type
  // Estado para controlar el id de la asignación a eliminar (para mostrar el modal)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string>("");


  /**
   * Obtiene la lista de asignaciones desde el backend.
   * Si hay un valor en el campo de búsqueda, filtra por work_order.
   */
  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/catalog/extra-service-sale-assignment${
          search ? `?work_order=${encodeURIComponent(search)}` : ""
        }`
      );
      setAssignments(res.data);
    } catch (err: any) {
      console.error("Error al obtener asignaciones", err);
      setError("No se pudieron cargar las asignaciones. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navega a la pantalla de alta de una nueva asignación extra.
   */
  const handleAddNewClick = () => {
    navigate("/catalog/extra-service/add");
  };

  /**
   * Cuando el usuario hace clic en eliminar, se guarda el id para mostrar el modal de confirmación.
   */
  const handleDeleteConfirm = (id: number, workOrder: string) => {
    setDeleteConfirm(id);
    setItemToDeleteName(workOrder);
  };

  /**
   * Si el usuario confirma la eliminación, se hace la petición DELETE al backend y se actualiza la lista.
   */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsLoading(true); // Consider a specific deleting state if needed
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/catalog/extra-service-sale-assignment/${deleteConfirm}`);
      await fetchAssignments(); // Refetch data
      setSuccess("Asignación eliminada correctamente.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error al eliminar asignación", err);
      if (err.response) {
        setError(`Error (${err.response.status}): ${err.response.data.detail || "No se pudo eliminar la asignación"}`);
      } else {
        setError("No se pudo eliminar la asignación. Intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
      setDeleteConfirm(null);
      setItemToDeleteName("");
    }
  };

  /**
   * Si el usuario cancela la eliminación, se oculta el modal y se limpia el id.
   */
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setItemToDeleteName("");
  };

  // Cada vez que cambia el valor de búsqueda, se vuelve a cargar la lista de asignaciones
  useEffect(() => {
    fetchAssignments();
  }, [search]);

  return (
    // <AISGBackground> // Assuming this component is rendered within a layout that already has AISGBackground
    <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
      {/* Cabecera principal con título y descripción */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Asignación Extra de Servicios
        </h1>
        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
        <p className="text-gray-200 mt-2 font-light">
          Gestión de asignaciones de servicios adicionales a vuelos y empleados
        </p>
      </div>

      {/* Mensajes de error o éxito */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
          <p className="font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg mb-6 shadow-md">
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* Barra de acciones: búsqueda y botón para agregar nuevo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-2/3 relative">
          <input
            type="text"
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
            placeholder="Buscar por orden de trabajo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleAddNewClick}
          className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Asignación
        </button>
      </div>

      {/* Tabla de datos con la lista de asignaciones */}
      <div className="overflow-x-auto">
        {isLoading && !deleteConfirm ? (
          <div className="flex justify-center py-12 bg-transparent">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[#002057]">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Servicio Cliente ID</th>
                <th className="px-4 py-3 text-left font-semibold">Vuelo ID</th>
                <th className="px-4 py-3 text-left font-semibold">Empleado ID</th>
                <th className="px-4 py-3 text-left font-semibold">Orden de Trabajo</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-[#1E2A45]">
              {assignments.length > 0 ? (
                assignments.map((a) => (
                  <tr key={a.id_xtra_sale_employee} className="hover:bg-[#1E2A45] transition-colors">
                    <td className="px-4 py-3 text-white">{a.id_xtra_sale_employee}</td>
                    <td className="px-4 py-3 text-white">{a.id_service_per_customer}</td>
                    <td className="px-4 py-3 text-white">{a.id_sale_flight}</td>
                    <td className="px-4 py-3 text-white">{a.id_sale_employee}</td>
                    <td className="px-4 py-3 text-white font-medium">{a.work_order}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.status
                          ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]"
                          : "bg-red-600 bg-opacity-20 text-red-400"
                      }`}>
                        {a.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/catalog/extra-service/edit/${a.id_xtra_sale_employee}`}
                          className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(a.id_xtra_sale_employee, a.work_order)}
                          className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white">
                    No se encontraron asignaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#16213E] rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4 border border-[#0033A0]">
            <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-4">
              <h3 className="text-xl font-bold text-white text-center">Confirmar Eliminación</h3>
            </div>
            <div className="p-6">
              <p className="text-white mb-6 text-center">
                ¿Estás seguro de que deseas eliminar la asignación para la orden de trabajo "{itemToDeleteName}" (ID: {deleteConfirm})? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-[#4D70B8] text-white rounded-lg hover:bg-[#3A5A9F] transition-colors font-medium"
                  disabled={isLoading && deleteConfirm !== null}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center"
                  disabled={isLoading && deleteConfirm !== null}
                >
                  {(isLoading && deleteConfirm !== null) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    // </AISGBackground>
  );
};

export default ExtraServiceSaleAssignment;