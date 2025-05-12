import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Componente para mostrar y administrar el catálogo de servicios.
 * Aquí se puede buscar, agregar, editar y eliminar servicios.
 */
const CatalogServices: React.FC = () => {
  // Guardamos la lista de servicios que obtenemos del backend
  const [services, setServices] = useState<any[]>([]);
  // Controlamos el valor del campo de búsqueda
  const [search, setSearch] = useState("");
  // Manejamos el estado de error para mostrar mensajes al usuario
  const [error, setError] = useState<string | null>(null);
  // Indicamos si la tabla está cargando datos
  const [loading, setLoading] = useState(true);
  // Guardamos el id del servicio que se quiere eliminar
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  // Controlamos si se muestra el modal de confirmación de eliminación
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Obtenemos la URL base del API desde variables de entorno o usamos una por defecto
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  // Colores AISG según el manual de identidad corporativa
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    lightBg: "#F5F5F7",
    textDark: "#222222",
    textLight: "#FFFFFF",
  };

  /**
   * Se obtiene la lista de servicios desde el backend.
   * Si hay un término de búsqueda, se filtran los resultados.
   */
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiURL}/catalog/services${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setServices(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching services", err);
      setError("Error al cargar los servicios.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cuando el usuario hace clic en eliminar, guardamos el id y mostramos el modal de confirmación.
   */
  const handleDeleteClick = (id: number) => {
    setServiceToDelete(id);
    setShowConfirmation(true);
  };

  /**
   * Si el usuario confirma la eliminación, se hace la petición al backend y se actualiza la lista.
   */
  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await axios.delete(`${apiURL}/catalog/services/${serviceToDelete}`);
      fetchServices();
      setError(null);
    } catch (err) {
      console.error("Error eliminando servicio", err);
      setError("No se pudo eliminar el servicio.");
    } finally {
      setShowConfirmation(false);
      setServiceToDelete(null);
    }
  };

  /**
   * Si el usuario cancela la eliminación, simplemente cerramos el modal y limpiamos el id.
   */
  const cancelDelete = () => {
    setShowConfirmation(false);
    setServiceToDelete(null);
  };

  // Cada vez que cambia el término de búsqueda, se vuelve a cargar la lista de servicios
  useEffect(() => {
    fetchServices();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-6 font-['Montserrat']">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con los colores corporativos AISG */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white text-center">Catálogo de Servicios</h1>
          <p className="text-gray-200 mt-2 font-light text-center">Administra los servicios disponibles en el sistema</p>
        </div>

        {/* Contenido principal */}
        <div className="bg-[#16213E] rounded-b-lg shadow-lg p-6">
          {/* Si hay un error, mostramos el mensaje destacado */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Barra de búsqueda y botón para agregar nuevo servicio */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-2/3 relative">
              <input
                type="text"
                placeholder="Buscar por código, nombre o descripción..."
                className="w-full px-4 py-3 pl-10 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {/* Botón para agregar un nuevo servicio */}
            <Link
              to="/services/add"
              className="w-full md:w-auto bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Servicio
            </Link>
          </div>

          {/* Tabla de resultados */}
          {loading ? (
            // Mostramos un spinner mientras se cargan los datos
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
            </div>
          ) : (
            <div className="bg-[#0D1B2A] rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-[#0033A0] text-white">
                      <th className="px-6 py-4 text-left font-semibold">ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Código</th>
                      <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                      <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                      <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2A45]">
                    {services.length === 0 ? (
                      // Si no hay resultados, mostramos un mensaje
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No se encontraron servicios. Intenta con otra búsqueda o agrega un nuevo servicio.
                        </td>
                      </tr>
                    ) : (
                      // Recorremos la lista de servicios y mostramos cada uno en una fila
                      services.map((s) => (
                        <tr key={s.id_service} className="hover:bg-[#1E2A45] transition-colors">
                          <td className="px-6 py-4 text-gray-300">{s.id_service}</td>
                          <td className="px-6 py-4 text-gray-300">{s.service_code}</td>
                          <td className="px-6 py-4 text-white font-medium">{s.service_name}</td>
                          <td className="px-6 py-4 text-gray-300">{s.service_description}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              {/* Botón para editar el servicio */}
                              <Link
                                to={`/services/edit/${s.id_service}`}
                                className="p-1.5 bg-[#4D70B8] text-white rounded hover:bg-[#0033A0] transition-colors"
                                title="Editar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              {/* Botón para eliminar el servicio */}
                              <button
                                onClick={() => handleDeleteClick(s.id_service)}
                                className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              </div>
            </div>
          )}

          {/* Modal de confirmación para eliminar un servicio */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#16213E] rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4 border border-[#0033A0]">
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-4">
                  <h3 className="text-xl font-bold text-white text-center">Confirmar Eliminación</h3>
                </div>
                <div className="p-6">
                  <p className="text-white mb-6 text-center">
                    ¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-[#4D70B8] text-white rounded-lg hover:bg-[#3A5A9F] transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogServices;