import React, { useEffect, useState } from "react";
import axios from "axios";

interface ExtraCompanyConfig {
  id_xtra_company: number;
  id_company: number;
  applies_detail: boolean;
  status: boolean;
}

const ExtraCompanyConfiguration: React.FC = () => {
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

  const [configs, setConfigs] = useState<ExtraCompanyConfig[]>([]);
  const [newConfig, setNewConfig] = useState({
    id_company: 0,
    applies_detail: false,
    status: true,
  });
  const [search, setSearch] = useState("");

  const fetchConfigs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/catalog/extra-company-configuration/${
          search ? `?id_company=${encodeURIComponent(search)}` : ""
        }`
      );
      setConfigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [search]);

  const handleAdd = () => {
    axios
      .post("http://localhost:8000/catalog/extra-company-configuration/", newConfig)
      .then((res) => {
        setConfigs([...configs, res.data]);
        setNewConfig({ id_company: 0, applies_detail: false, status: true });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Configuración Extra de Compañía
          </h1>
          <p className="text-gray-200 mt-2 font-light text-center">
            Administra parámetros adicionales por compañía
          </p>
        </div>

        {/* Formulario de Agregar */}
        <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Agregar Nueva Configuración</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ID Compañía</label>
              <input
                type="number"
                className="bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                placeholder="ID"
                value={newConfig.id_company}
                onChange={(e) => setNewConfig({ ...newConfig, id_company: Number(e.target.value) })}
              />
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={newConfig.applies_detail}
                  onChange={(e) => setNewConfig({ ...newConfig, applies_detail: e.target.checked })}
                />
                <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Aplica Detalle</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={newConfig.status}
                  onChange={(e) => setNewConfig({ ...newConfig, status: e.target.checked })}
                />
                <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Activo</span>
              </label>
            </div>
            
            <button
              className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg ml-auto"
              onClick={handleAdd}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Buscar por ID de Compañía</label>
          <input
            type="number"
            className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
            placeholder="Ingresa el ID de compañía para filtrar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="bg-[#16213E] rounded-lg shadow-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#0D1B2A]">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">ID Compañía</th>
                <th className="p-3 text-left">Aplica Detalle</th>
                <th className="p-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {configs.length > 0 ? (
                configs.map((c) => (
                  <tr key={c.id_xtra_company} className="border-t border-[#0D1B2A] hover:bg-[#1E2A45]">
                    <td className="p-3">{c.id_xtra_company}</td>
                    <td className="p-3">{c.id_company}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.applies_detail 
                          ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]" 
                          : "bg-gray-600 bg-opacity-20 text-gray-400"
                      }`}>
                        {c.applies_detail ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.status 
                          ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]" 
                          : "bg-red-600 bg-opacity-20 text-red-400"
                      }`}>
                        {c.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400">
                    No se encontraron configuraciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExtraCompanyConfiguration;