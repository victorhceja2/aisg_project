import React, { useState, useEffect } from "react";
import axios from "axios";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({
    id_service_status: 1,
    id_service_classification: 1,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false
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
        service_technicians_included: false
      });
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
          className="text-black px-2 py-1 mr-2 rounded"
          placeholder="Código"
          value={form.service_code}
          onChange={(e) => setForm({ ...form, service_code: e.target.value })}
        />
        <input
          className="text-black px-2 py-1 mr-2 rounded"
          placeholder="Nombre"
          value={form.service_name}
          onChange={(e) => setForm({ ...form, service_name: e.target.value })}
        />
        <input
          className="text-black px-2 py-1 mr-2 rounded"
          placeholder="Descripción"
          value={form.service_description}
          onChange={(e) => setForm({ ...form, service_description: e.target.value })}
        />
        <input
          className="text-black px-2 py-1 mr-2 rounded"
          type="number"
          placeholder="ID Estatus"
          value={form.id_service_status}
          onChange={(e) => setForm({ ...form, id_service_status: parseInt(e.target.value) })}
        />
        <input
          className="text-black px-2 py-1 mr-2 rounded"
          type="number"
          placeholder="ID Clasificación"
          value={form.id_service_classification}
          onChange={(e) => setForm({ ...form, id_service_classification: parseInt(e.target.value) })}
        />
        <label className="block mt-2">
          <input
            type="checkbox"
            checked={form.service_aircraft_type}
            onChange={(e) => setForm({ ...form, service_aircraft_type: e.target.checked })}
          /> Tipo de Aeronave
        </label>
        <label className="block">
          <input
            type="checkbox"
            checked={form.service_by_time}
            onChange={(e) => setForm({ ...form, service_by_time: e.target.checked })}
          /> Servicio por Tiempo
        </label>
        <label className="block">
          <input
            type="checkbox"
            checked={form.min_time_configured}
            onChange={(e) => setForm({ ...form, min_time_configured: e.target.checked })}
          /> Tiempo Mínimo Configurado
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={form.service_technicians_included}
            onChange={(e) => setForm({ ...form, service_technicians_included: e.target.checked })}
          /> Técnicos Incluidos
        </label>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
          onClick={handleAdd}
        >
          Agregar
        </button>
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
