
import React, { useState, useEffect } from "react";
import axios from "axios";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    status: "Activo",
  });

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/catalog/services/");
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8000/catalog/services/", {
        name: newService.name,
        description: newService.description,
        status: newService.status,
      });
      setNewService({ name: "", description: "", status: "Activo" });
      fetchServices(); // Refresh
    } catch (err) {
      console.error("Error adding service", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Servicios</h1>
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Servicio</h2>
        <input
          className="text-black px-2 py-1 rounded mr-2"
          placeholder="Nombre"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
        />
        <input
          className="text-black px-2 py-1 rounded mr-2"
          placeholder="Descripción"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
        />
        <select
          className="text-black px-2 py-1 rounded"
          value={newService.status}
          onChange={(e) => setNewService({ ...newService, status: e.target.value })}
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <button className="ml-2 bg-blue-600 px-4 py-1 rounded" onClick={handleAdd}>
          Agregar
        </button>
      </div>

      <table className="w-full table-auto bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Descripción</th>
            <th className="p-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="text-center border-t border-gray-700">
              <td className="p-2">{s.id}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.description}</td>
              <td className="p-2">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogServices;
