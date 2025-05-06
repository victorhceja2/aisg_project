import React, { useState, useEffect } from "react";
import axios from "axios";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id_service_status: 1,
    id_service_classification: 1,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false,
  });

  const fetchServices = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/catalog/services/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8000/catalog/services/", form);
      fetchServices();
      setForm({
        id_service_status: 1,
        id_service_classification: 1,
        service_code: "",
        service_name: "",
        service_description: "",
        service_aircraft_type: false,
        service_by_time: false,
        min_time_configured: false,
        service_technicians_included: false,
      });
    } catch (err) {
      console.error("Error adding service", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Servicios</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Servicio</h2>
        {/* ... (los inputs ya estaban bien) */}
        {/* omito aquí para que no se repita todo, ya lo tienes completo */}
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
          onClick={handleAdd}
        >
          Agregar
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código, nombre o descripción..."
          className="text-black px-2 py-1 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full table-auto bg-gray-900 rounded text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Código</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Descripción</th>
            <th className="p-2">Estatus</th>
            <th className="p-2">Clasificación</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id_service} className="text-center border-t border-gray-700">
              <td className="p-2">{s.id_service}</td>
              <td className="p-2">{s.service_code}</td>
              <td className="p-2">{s.service_name}</td>
              <td className="p-2">{s.service_description}</td>
              <td className="p-2">{s.id_service_status}</td>
              <td className="p-2">{s.id_service_classification}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogServices;
