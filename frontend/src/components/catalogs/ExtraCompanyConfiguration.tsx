import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from "react-router-dom";

/**
 * Componente para mostrar y administrar la configuración extra por compañía.
 * Permite buscar por ID de compañía, agregar, editar y eliminar configuraciones.
 */
const API_BASE_URL = "http://localhost:8000";

// Definición de la estructura de datos para una configuración extra por compañía
interface ExtraCompanyConfig {
  id_xtra_company: number;
  id_company: number;
  applies_detail: boolean;
  status: boolean;
}

const ExtraCompanyConfiguration: React.FC = () => {
  // Paleta de colores corporativos AISG para mantener la identidad visual
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

  // Hook para navegación programática entre pantallas
  const navigate = useNavigate();
  // Estado para almacenar la lista de configuraciones extra obtenidas del backend
  const [configs, setConfigs] = useState<ExtraCompanyConfig[]>([]);
  // Estado para el valor del campo de búsqueda por ID de compañía
  const [search, setSearch] = useState("");
  // Estado para controlar si se muestra el modal de confirmación de eliminación y a qué id corresponde
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  /**
   * Obtiene la lista de configuraciones extra desde el backend.
   * Si hay un valor en el campo de búsqueda, filtra por id_company.
   */
  const fetchConfigs = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/catalog/extra-company-configuration${search ? `?id_company=${encodeURIComponent(search)}` : ""}`
      );
      setConfigs(res.data);
    } catch (err) {
      console.error("Error al obtener configuraciones", err);
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
      await axios.delete(`${API_BASE_URL}/catalog/extra-company-configuration/${id}`);
      fetchConfigs();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error al eliminar configuración", err);
    }
  };

  /**
   * Si el usuario cancela la eliminación, se oculta el modal y se limpia el id.
   */
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Cada vez que cambia el valor de búsqueda, se vuelve a cargar la lista de configuraciones
  useEffect(() => {
    fetchConfigs();
  }, [search]);

  /**
   * Navega a la pantalla de edición de configuración extra por compañía.
   */
  const handleEdit = (id: number) => {
    navigate(`/catalogs/company/edit/${id}`);
  };

  /**
   * Navega a la pantalla de creación de nueva configuración extra por compañía.
   */
  const handleAdd = () => {
    navigate("/catalogs/company/add");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
      {/* Cabecera principal con título y descripción */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Configuración Extra por Compañía
        </h1>
        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
        <p className="text-gray-200 mt-2 font-light">
          Administra parámetros adicionales por compañía
        </p>
      </div>

      {/* Barra de acciones: búsqueda por id_company y botón para agregar nueva configuración */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Campo de búsqueda por id_company */}
        <div className="w-full md:w-2/3 relative">
          <input
            type="number"
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
            placeholder="Buscar por ID de Compañía..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {/* Botón para agregar nueva configuración extra */}
        <button
          onClick={handleAdd}
          className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Configuración
        </button>
      </div>

      {/* Modal de confirmación para eliminar una configuración extra */}
      {deleteConfirm && (
        <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6 border-2 border-red-500">
          <h2 className="text-xl font-semibold mb-4 text-white">Confirmar Eliminación</h2>
          <p className="text-gray-300 mb-4">
            ¿Estás seguro de que deseas eliminar la configuración #{deleteConfirm}? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={handleCancelDelete}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => handleDelete(deleteConfirm)}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Tabla principal con la lista de configuraciones extra por compañía */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white text-[#002057]">
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Compañía</th>
              <th className="px-4 py-3 text-left font-semibold">Detalle</th>
              <th className="px-4 py-3 text-left font-semibold">Estatus</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-[#1E2A45]">
            {configs.length > 0 ? (
              // Si hay configuraciones, se muestran en la tabla
              configs.map((c) => (
                <tr key={c.id_xtra_company} className="hover:bg-[#1E2A45] transition-colors">
                  <td className="px-4 py-3 text-white">{c.id_xtra_company}</td>
                  <td className="px-4 py-3 text-white">{c.id_company}</td>
                  <td className="px-4 py-3">
                    {/* Muestra si aplica detalle con color distintivo */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.applies_detail 
                        ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]" 
                        : "bg-gray-600 bg-opacity-20 text-gray-400"
                    }`}>
                      {c.applies_detail ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Muestra el estatus con color distintivo */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.status 
                        ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]" 
                        : "bg-red-600 bg-opacity-20 text-red-400"
                    }`}>
                      {c.status ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      {/* Botón para editar la configuración extra */}
                      <button
                        onClick={() => handleEdit(c.id_xtra_company)}
                        className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Botón para eliminar la configuración extra */}
                      <button
                        onClick={() => handleDeleteConfirm(c.id_xtra_company)}
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
              // Si no hay configuraciones, se muestra un mensaje en la tabla
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white">
                  No se encontraron configuraciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtraCompanyConfiguration;