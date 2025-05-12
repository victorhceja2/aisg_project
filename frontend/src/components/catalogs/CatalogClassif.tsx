import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Componente para mostrar y administrar el catálogo de clasificaciones de servicios.
 * Permite buscar, agregar, editar y eliminar clasificaciones.
 */
const CatalogClassif: React.FC = () => {
  // Se guarda la lista de clasificaciones obtenidas del backend
  const [classifications, setClassifications] = useState<any[]>([]);
  // Se controla el valor del campo de búsqueda
  const [search, setSearch] = useState("");
  // Se maneja el estado de error para mostrar mensajes al usuario
  const [error, setError] = useState<string | null>(null);
  // Se indica si la tabla está cargando datos
  const [loading, setLoading] = useState(true);
  // Se obtiene la URL base del API desde variables de entorno o se usa una por defecto
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  // Paleta de colores corporativos AISG para mantener la identidad visual
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
   * Se obtiene la lista de clasificaciones desde el backend.
   * Si hay un término de búsqueda, se filtran los resultados.
   */
  const fetchClassifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiURL}/catalog/service-classification/${
          search ? `?search=${encodeURIComponent(search)}` : ""
        }`
      );
      setClassifications(res.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener clasificaciones", err);
      setError("Error al cargar las clasificaciones.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Se elimina una clasificación seleccionada.
   * Antes de eliminar, se pide confirmación al usuario.
   * Si la eliminación es exitosa, se actualiza la lista.
   */
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la clasificación "${name}"? Esta acción no se puede deshacer.`)) {
      try {
        await axios.delete(`${apiURL}/catalog/service-classification/${id}`);
        fetchClassifications(); // Se actualiza la lista después de eliminar
        setError(null);
      } catch (err) {
        console.error("Error al eliminar clasificación", err);
        setError("No se pudo eliminar la clasificación. Puede que esté siendo utilizada por algún servicio activo.");
      }
    }
  };

  // Cada vez que cambia el término de búsqueda, se vuelve a cargar la lista de clasificaciones
  useEffect(() => {
    fetchClassifications();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-6 font-['Montserrat']">
      <div className="max-w-7xl mx-auto">
        {/* Sección de encabezado con el título y descripción */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white text-center">Clasificaciones de Servicios</h1>
          <p className="text-gray-200 mt-2 font-light text-center">Administra las clasificaciones disponibles para los servicios</p>
        </div>

        {/* Sección principal con barra de búsqueda, botón de agregar y tabla de resultados */}
        <div className="bg-[#16213E] rounded-b-lg shadow-lg p-6">
          {/* Si hay un error, se muestra un mensaje destacado */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Barra de búsqueda y botón para agregar nueva clasificación */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-2/3 relative">
              <input
                type="text"
                placeholder="Buscar clasificación..."
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
            {/* Botón para agregar una nueva clasificación */}
            <Link
              to="/catalogs/classif/add"
              className="w-full md:w-auto bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Clasificación
            </Link>
          </div>

          {/* Tabla donde se muestran los resultados de la búsqueda o todas las clasificaciones */}
          {loading ? (
            // Se muestra un spinner mientras se cargan los datos
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
            </div>
          ) : (
            <div className="bg-[#0D1B2A] rounded-lg overflow-hidden shadow-lg">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-[#0033A0] text-white">
                    <th className="px-6 py-4 text-left font-semibold">ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                    <th className="px-6 py-4 text-center font-semibold">Estado</th>
                    <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2A45]">
                  {classifications.length === 0 ? (
                    // Si no hay resultados, se muestra un mensaje
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : (
                    // Se recorre la lista de clasificaciones y se muestra cada una en una fila
                    classifications.map((c) => (
                      <tr key={c.id_service_classification} className="hover:bg-[#1E2A45] transition-colors">
                        <td className="px-6 py-4 text-gray-300">{c.id_service_classification}</td>
                        <td className="px-6 py-4 text-white font-medium">{c.service_classification_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status ? 'bg-[#4DC970] text-white' : 'bg-red-500 text-white'}`}>
                            {c.status ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            {/* Botón para editar la clasificación */}
                            <Link
                              to={`/catalogs/classif/edit/${c.id_service_classification}`}
                              className="p-1.5 bg-[#4D70B8] text-white rounded hover:bg-[#0033A0] transition-colors"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            {/* Botón para eliminar la clasificación */}
                            <button
                              onClick={() => handleDelete(c.id_service_classification, c.service_classification_name)}
                              className="p-1.5 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogClassif;