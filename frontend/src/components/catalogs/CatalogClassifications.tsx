import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

/**
 * Componente para mostrar y administrar el catálogo de clasificaciones de servicios.
 * Aquí se puede buscar, agregar y editar clasificaciones.
 */
const CatalogClassifications: React.FC = () => {
  // Aquí guardamos la lista de clasificaciones que obtenemos del backend
  const [classifications, setClassifications] = useState<any[]>([]);
  // Se controla el valor del campo de búsqueda
  const [search, setSearch] = useState("");
  // Se maneja el estado de error para mostrar mensajes al usuario
  const [error, setError] = useState<string | null>(null);
  // Se indica si la tabla está cargando datos
  const [loading, setLoading] = useState(true);
  // Se obtiene la URL base del API desde variables de entorno o se usa una por defecto
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
        `${apiURL}/catalog/service-classification/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setClassifications(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching classifications", err);
      setError("No se pudieron cargar las clasificaciones. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cada vez que cambia el término de búsqueda, se vuelve a cargar la lista de clasificaciones
  useEffect(() => {
    fetchClassifications();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-6 font-['Montserrat']">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con los colores corporativos AISG */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white">Catálogo de Clasificaciones de Servicios</h1>
          <p className="text-gray-200 mt-2 font-light">Administra las diferentes clasificaciones de servicios</p>
        </div>

        {/* Contenido principal */}
        <div className="bg-[#16213E] rounded-b-lg shadow-lg p-6">
          {/* Si hay un error, se muestra un mensaje destacado */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Botón para agregar nueva clasificación */}
          <div className="mb-6 flex justify-end">
            <Link 
              to="/catalogs/classif/add"
              className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Clasificación
            </Link>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                placeholder="Buscar clasificación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tabla de resultados */}
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
                    <th className="px-6 py-4 text-left font-semibold">Estatus</th>
                    <th className="px-6 py-4 text-left font-semibold">Acciones</th>
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
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status ? 'bg-[#4DC970] text-white' : 'bg-red-500 text-white'}`}>
                            {c.status ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
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
                            {/* Aquí se podría agregar un botón para cambiar el estatus */}
                            <button
                              onClick={() => {
                                /* Aquí se puede implementar la funcionalidad para cambiar estatus */
                              }}
                              className="p-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                              title="Cambiar estatus"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

export default CatalogClassifications;