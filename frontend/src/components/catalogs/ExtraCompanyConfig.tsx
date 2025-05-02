import React, { useEffect, useState } from "react";
import axios from "axios";

interface ExtraCompanyConfig {
  id_xtra_company: number;
  id_company: number;
  applies_detail: boolean;
  status: boolean;
}

const ExtraCompanyConfiguration: React.FC = () => {
  const [configs, setConfigs] = useState<ExtraCompanyConfig[]>([]);
  const [newConfig, setNewConfig] = useState({
    id_company: 0,
    applies_detail: false,
    status: true,
  });

  useEffect(() => {
    axios.get("http://localhost:8000/extra_company_configuration/")
      .then(res => setConfigs(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAdd = () => {
    axios.post("http://localhost:8000/extra_company_configuration/", newConfig)
      .then(res => {
        setConfigs([...configs, res.data]);
        setNewConfig({ id_company: 0, applies_detail: false, status: true });
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Extra Company Configuration</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <input
          type="number"
          className="text-black px-2 py-1 mr-2 rounded"
          placeholder="ID Compañía"
          value={newConfig.id_company}
          onChange={(e) => setNewConfig({ ...newConfig, id_company: Number(e.target.value) })}
        />
        <label className="mr-2">
          <input
            type="checkbox"
            className="mr-1"
            checked={newConfig.applies_detail}
            onChange={(e) => setNewConfig({ ...newConfig, applies_detail: e.target.checked })}
          />
          Aplica Detalle
        </label>
        <label className="mr-2">
          <input
            type="checkbox"
            className="mr-1"
            checked={newConfig.status}
            onChange={(e) => setNewConfig({ ...newConfig, status: e.target.checked })}
          />
          Activo
        </label>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
          onClick={handleAdd}
        >
          Agregar
        </button>
      </div>

      <table className="w-full table-auto bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">ID Compañía</th>
            <th className="p-2">Aplica Detalle</th>
            <th className="p-2">Activo</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((c) => (
            <tr key={c.id_xtra_company} className="text-center border-t border-gray-700">
              <td className="p-2">{c.id_xtra_company}</td>
              <td className="p-2">{c.id_company}</td>
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
