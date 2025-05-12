import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Componente para mostrar y administrar la relación de servicios por cliente.
 * Permite buscar por tipo de fuselaje, agregar, editar y eliminar registros.
 */
const API_BASE_URL = "http://82.165.213.124:8000";

// Estructura de un registro de servicio por cliente
interface ServicePerCustomerRecord {
  id_service_per_customer: number;
  id_service: number;
  id_client: number;
  id_company: number;
  minutes_included: number;
  minutes_minimum: number;
  fuselage_type: string;
  technicians_included: number;
}

const ServicePerCustomer: React.FC = () => {
  // Paleta de colores corporativos AISG
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

  // Hook para navegación programática
  const navigate = useNavigate();
  // Estado para la lista de registros obtenidos del backend
  const [records, setRecords] = useState<ServicePerCustomerRecord[]>([]);
  // Estado para el valor del campo de búsqueda (por tipo de fuselaje)
  const [search, setSearch] = useState("");
  // Estado para mensajes de error
  const [error, setError] = useState("");
  // Estado para mensajes de éxito
  const [success, setSuccess] = useState("");
  // Estado para controlar el id del registro a eliminar (para mostrar el modal)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  // Estado para mostrar spinner de carga
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Obtiene la lista de registros desde el backend.
   * Si hay un valor en el campo de búsqueda, filtra por tipo de fuselaje.
   */
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axios.get(
        `${API_BASE_URL}/catalog/service-per-customer${
          search ? `?fuselage_type=${encodeURIComponent(search)}` : ""
        }`
      );
      setRecords(res.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error al obtener datos", err);
      setError("No se pudieron cargar los datos. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  /**
   * Cuando el usuario hace clic en eliminar, se guarda el id para mostrar el modal de confirmación.
   */
  const handleDeleteConfirm = (id: number) => {
    setDeleteConfirm(id);
  };

  /**
   * Si el usuario confirma la eliminación, se hace la petición DELETE al backend y se actualiza la lista.
   */
  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      setError("");
      // Registrar la intención de eliminar para depuración
      console.log(`Intentando eliminar el registro ${id}`);
      // Hacer la solicitud DELETE
      const response = await axios.delete(`${API_BASE_URL}/catalog/service-per-customer/${id}`);
      console.log("Respuesta del servidor:", response.data);
      // Actualizar la lista después de eliminar
      await fetchRecords();
      // Actualizar el estado de la interfaz
      setDeleteConfirm(null);
      setSuccess("Registro eliminado correctamente");
      setIsLoading(false);
      // Limpiar mensaje de éxito después de 2 segundos
      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      console.error("Error al eliminar registro", err);
      // Mostrar mensaje de error más detallado
      if (err.response) {
        setError(`Error (${err.response.status}): ${err.response.data.detail || "No se pudo eliminar el registro"}`);
      } else if (err.request) {
        setError("No se recibió respuesta del servidor. Verifique su conexión.");
      } else {
        setError(`Error: ${err.message || "No se pudo eliminar el registro"}`);
      }
    }
  };

  /**
   * Si el usuario cancela la eliminación, se oculta el modal y se limpia el id.
   */
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  /**
   * Navega a la pantalla de edición de un registro de servicio por cliente.
   */
  const handleEdit = (id: number) => {
    navigate(`/catalogs/customer/edit/${id}`);
  };

  /**
   * Navega a la pantalla de creación de un nuevo registro de servicio por cliente.
   */
  const handleAdd = () => {
    navigate("/catalogs/customer/add");
  };

  // Cada vez que cambia el valor de búsqueda, se vuelve a cargar la lista de registros
  useEffect(() => {
    fetchRecords();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera principal con título y descripción */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Servicios por Cliente
          </h1>
          <p className="text-gray-200 mt-2 font-light text-center">
            Administra la relación entre servicios y clientes con sus parámetros específicos
          </p>
        </div>

        {/* Barra de acciones: búsqueda y botón para agregar nuevo registro */}
        <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6 flex flex-wrap justify-between items-center gap-4">
          {/* Campo de búsqueda por tipo de fuselaje */}
          <div className="flex-grow max-w-md">
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar por Tipo de Fuselaje</label>
            <input
              type="text"
              className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
              placeholder="Buscar por tipo de fuselaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Botón para agregar nuevo registro */}
          <div>
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Agregar Servicio por Cliente
            </button>
          </div>
        </div>

        {/* Mensajes de error o éxito */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-100 px-4 py-3 rounded mb-4">
            <p>{success}</p>
          </div>
        )}

        {/* Indicador de carga */}
        {isLoading && (
          <div className="bg-[#16213E] p-4 rounded-lg shadow-lg mb-6 flex justify-center">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B140] mr-3"></div>
              <span>Cargando...</span>
            </div>
          </div>
        )}

        {/* Tabla principal con la lista de servicios por cliente */}
        <div className="bg-[#16213E] rounded-lg shadow-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#0D1B2A]">
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Servicio</th>
                <th className="p-3 text-left font-semibold">Cliente</th>
                <th className="p-3 text-left font-semibold">Empresa</th>
                <th className="p-3 text-left font-semibold">Min. Incluidos</th>
                <th className="p-3 text-left font-semibold">Min. Mínimos</th>
                <th className="p-3 text-left font-semibold">Fuselaje</th>
                <th className="p-3 text-left font-semibold">Técnicos</th>
                <th className="p-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                // Si hay registros, se muestran en la tabla
                records.map((r) => (
                  <tr key={r.id_service_per_customer} className="border-t border-[#0D1B2A] hover:bg-[#1E2A45]">
                    <td className="p-3">{r.id_service_per_customer}</td>
                    <td className="p-3">{r.id_service}</td>
                    <td className="p-3">{r.id_client}</td>
                    <td className="p-3">{r.id_company}</td>
                    <td className="p-3">{r.minutes_included}</td>
                    <td className="p-3">{r.minutes_minimum}</td>
                    <td className="p-3">{r.fuselage_type}</td>
                    <td className="p-3">{r.technicians_included}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Botón para editar el registro */}
                        <button
                          onClick={() => handleEdit(r.id_service_per_customer)}
                          className="text-[#4D70B8] hover:text-[#00B140] transition-colors duration-200"
                          title="Editar"
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        {/* Botón para eliminar el registro */}
                        <button
                          onClick={() => handleDeleteConfirm(r.id_service_per_customer)}
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
                // Si no hay registros, se muestra un mensaje en la tabla
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-400">
                    {isLoading ? "Cargando datos..." : "No se encontraron registros"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#16213E] rounded-lg shadow-lg max-w-md w-full p-6 border-2 border-red-500 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-white">Confirmar Eliminación</h2>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar el registro #{deleteConfirm}? Esta acción no se puede deshacer.
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

export default ServicePerCustomer;