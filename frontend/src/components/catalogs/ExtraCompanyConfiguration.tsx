import React, { useEffect, useState } from "react";
import axios from "axios";

const ExtraCompanyConfiguration: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id_company: "",
    applies_detail: false,
    status: true,
  });

  const fetchConfigs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/catalog/extra-company-configuration${search ? `?id_company=${encodeURIComponent(search)}` : ""}`
      );
      setConfigs(res.data);
    } catch (err) {
      console.error("Error al obtener configuraciones", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8000/catalog/extra-company-configuration", {
        id_company: parseInt(form.id_company),
        applies_detail: form.applies_detail,
        status: form.status,
      });
      fetchConfigs();
      setForm({
        id_company: "",
        applies_detail: false,
        status: true,
      });
    } catch (err) {
      console.error("Error al agregar configuración", err);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [search]);

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Configuración Extra por Compañía</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Configuración</h2>
        <input
          className="text-black px-2 py-1 mr-2 rounded"
          placeholder="ID Compañía"
          value={form.id_company}
          onChange={(e) => setForm({ ...form, id_company: e.target.value })}
        />
        <label className="mr-4">
          <input
            type="checkbox"
            checked={form.applies_detail}
            onChange={(e) => setForm({ ...form, applies_detail: e.target.checked })}
            className="mr-2"
          />
          Aplica Detalle
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.checked })}
            className="mr-2"
          />
          Activo
        </label>
        <button
          className="ml-4 bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
          onClick={handleAdd}
        >
          Agregar
        </button>
      </div>

      <div className="mb-4">
        <input
          type="number"
          className="text-black px-2 py-1 rounded w-full"
          placeholder="Buscar por ID de Compañía..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full table-auto bg-gray-900 rounded text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Compañía</th>
            <th className="p-2">Detalle</th>
            <th className="p-2">Estatus</th>
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