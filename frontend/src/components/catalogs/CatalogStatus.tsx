import React, { useState, useEffect } from "react";
import axios from "axios";

const CatalogStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiURL}/catalog/service-status/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setStatuses(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching statuses", err);
      setError("No se pudieron cargar los estatus. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newStatus.trim()) {
      setError("El nombre del estatus es obligatorio.");
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${apiURL}/catalog/service-status/`, {
        status_name: newStatus,
      });
      setNewStatus("");
      setError(null);
      fetchStatuses();
    } catch (err) {
      console.error("Error adding status", err);
      setError("No se pudo agregar el estatus. Intente nuevamente.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-6 font-['Montserrat']">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con los colores corporativos AISG */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white">Catálogo de Estatus de Servicios</h1>
          <p className="text-gray-200 mt-2 font-light">Administra los diferentes estados que pueden tener los servicios</p>
        </div>

        {/* Contenido principal */}
        <div className="bg-[#16213E] rounded-b-lg shadow-lg p-6">
          {/* Mensajes de error */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Formulario para agregar */}
          <div className="bg-[#0D1B2A] p-6 rounded-lg shadow-inner mb-8 border-l-4 border-[#00B140]">
            <h2 className="text-xl font-semibold text-white mb-4">Agregar Nuevo Estatus</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                className="flex-grow px-4 py-3 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                placeholder="Nombre del estatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              />
              <button 
                className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleAdd}
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                placeholder="Buscar estatus..."
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2A45]">
                  {statuses.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : (
                    statuses.map((s) => (
                      <tr key={s.id_service_status} className="hover:bg-[#1E2A45] transition-colors">
                        <td className="px-6 py-4 text-gray-300">{s.id_service_status}</td>
                        <td className="px-6 py-4 text-white font-medium">{s.status_name}</td>
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

export default CatalogStatus;