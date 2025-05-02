import React, { useEffect, useState } from "react";
import axios from "axios";

const ServicePerCustomer: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    id_company: "",
    minutes_included: 0,
    minutes_minimum: 0,
    fuselage_type: "",
    technicians_included: 0,
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get("http://localhost:8000/catalog/service-per-customer/");
      setRecords(res.data);
    } catch (err) {
      console.error("Error al obtener datos", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8000/catalog/service-per-customer/", {
        ...form,
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        id_company: parseInt(form.id_company),
      });
      fetchRecords();
      setForm({
        id_service: "",
        id_client: "",
        id_company: "",
        minutes_included: 0,
        minutes_minimum: 0,
        fuselage_type: "",
        technicians_included: 0,
      });
    } catch (err) {
      console.error("Error al guardar", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Servicios por Cliente</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Servicio por Cliente</h2>
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="ID Servicio" value={form.id_service} onChange={(e) => setForm({ ...form, id_service: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="ID Cliente" value={form.id_client} onChange={(e) => setForm({ ...form, id_client: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="ID Empresa" value={form.id_company} onChange={(e) => setForm({ ...form, id_company: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="Minutos Incluidos" type="number" value={form.minutes_included} onChange={(e) => setForm({ ...form, minutes_included: +e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="Minutos Mínimos" type="number" value={form.minutes_minimum} onChange={(e) => setForm({ ...form, minutes_minimum: +e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="Tipo de Fuselaje" value={form.fuselage_type} onChange={(e) => setForm({ ...form, fuselage_type: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="Técnicos Incluidos" type="number" value={form.technicians_included} onChange={(e) => setForm({ ...form, technicians_included: +e.target.value })} />
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded" onClick={handleAdd}>Agregar</button>
      </div>

      <table className="w-full table-auto bg-gray-900 rounded text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Servicio</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Empresa</th>
            <th className="p-2">Min. Incluidos</th>
            <th className="p-2">Min. Mínimos</th>
            <th className="p-2">Fuselaje</th>
            <th className="p-2">Técnicos</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id_service_per_customer} className="text-center border-t border-gray-700">
              <td className="p-2">{r.id_service_per_customer}</td>
              <td className="p-2">{r.id_service}</td>
              <td className="p-2">{r.id_client}</td>
              <td className="p-2">{r.id_company}</td>
              <td className="p-2">{r.minutes_included}</td>
              <td className="p-2">{r.minutes_minimum}</td>
              <td className="p-2">{r.fuselage_type}</td>
              <td className="p-2">{r.technicians_included}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicePerCustomer;