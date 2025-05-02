import React, { useState, useEffect } from "react";
import axios from "axios";

const ExtraCompanyConfiguration: React.FC = () => {
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [newConfig, setNewConfig] = useState({
    company_id: "",
    applies_detail: "0", // 0 = No aplica, 1 = Aplica
    status: "1",         // 1 = Activo, 0 = Inactivo
  });

  const fetchConfigurations = async () => {
    try {
      const res = await axios.get("http://localhost:8000/catalog/extra-company-configuration/");
      setConfigurations(res.data);
    } catch (err) {
      console.error("Error al obtener configuraciones", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8000/catalog/extra-company-configuration/", {
        company_id: parseInt(newConfig.company_id),
        applies_detail: parseInt(newConfig.applies_detail),
        status: parseInt(newConfig.status),
      });
      setNewConfig({ company_id: "", applies_detail: "0", status: "1" });
      fetchConfigurations();
    } catch (err) {
      console.error("Error al agregar configuración", err);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Configuraciones Extras por Compañía</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Configuración</h2>
        <input
          placeholder="ID Compañía"
          className="text-black px-2 py-1 mr-2 rounded"
          value={newConfig.company_id}
          onChange={(e) => setNewConfig({ ...newConfig, company_id: e.target.value })}
        />
        <select
          className="text-black px-2 py-1 mr-2 rounded"
          value={newConfig.applies_detail}
          onChange={(e) => setNewConfig({ ...newConfig, applies_detail: e.target.value })}
        >
          <option value="0">No aplica detalle</option>
          <option value="1">Aplica detalle</option>
        </select>
        <select
          className="text-black px-2 py-1 mr-2 rounded"
          value={newConfig.status}
          onChange={(e) => setNewConfig({ ...newConfig, status: e.target.value })}
        >
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded" onClick={handleAdd}>
          Agregar
        </button>
      </div>

      <table className="w-full table-auto bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">ID Compañía</th>
            <th className="p-2">Detalle</th>
            <th className="p-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {configurations.map((c) => (
            <tr key={c.id} className="text-center border-t border-gray-700">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.company_id}</td>
              <td className="p-2">{c.applies_detail ? "Sí" : "No"}</td>
              <td className="p-2">{c.status ? "Activo" : "Inactivo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtraCompanyConfiguration;