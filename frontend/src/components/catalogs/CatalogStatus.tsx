import React, { useState, useEffect } from "react";
import axios from "axios";

const CatalogStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchStatuses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/catalog/service-status/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setStatuses(res.data);
    } catch (err) {
      console.error("Error fetching statuses", err);
    }
  };

  const handleAdd = async () => {
    if (!newStatus) return;
    try {
      await axios.post("http://localhost:8000/catalog/service-status/", {
        status_name: newStatus,
      });
      setNewStatus("");
      fetchStatuses();
    } catch (err) {
      console.error("Error adding status", err);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [search]);

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Catálogo de Estatus de Servicios</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Estatus</h2>
        <input
          className="text-black px-2 py-1 rounded mr-2"
          placeholder="Nombre del estatus"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        />
        <button className="bg-blue-600 px-4 py-1 rounded" onClick={handleAdd}>
          Agregar
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="text-black px-2 py-1 rounded w-full"
          placeholder="Buscar estatus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full table-auto bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map((s) => (
            <tr key={s.id_service_status} className="text-center border-t border-gray-700">
              <td className="p-2">{s.id_service_status}</td>
              <td className="p-2">{s.status_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogStatus;
