import React, { useEffect, useState } from "react";
import axios from "axios";

const ExtraServiceSaleAssignment: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState({
    id_service_per_customer: "",
    id_sale_flight: "",
    id_sale_employee: "",
    work_order: "",
    status: "Activo"
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get("http://localhost:8000/catalog/extra-service-sale-assignment/");
      setRecords(res.data);
    } catch (err) {
      console.error("Error al obtener asignaciones", err);
    }
  };

  const handleAdd = async () => {
    if (!form.id_service_per_customer || !form.id_sale_flight || !form.id_sale_employee) {
      alert("Los campos ID Servicio Cliente, Vuelo y Empleado son obligatorios");
      return;
    }
    try {
      await axios.post("http://localhost:8000/catalog/extra-service-sale-assignment/", {
        ...form,
        status: form.status === "Activo" ? 1 : 0,
        sale_employee_deleted: 0
      });
      fetchRecords();
      setForm({
        id_service_per_customer: "",
        id_sale_flight: "",
        id_sale_employee: "",
        work_order: "",
        status: "Activo"
      });
    } catch (err) {
      console.error("Error al guardar asignación", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Asignaciones Extras de Venta</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Asignación</h2>
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="ID Servicio Cliente" value={form.id_service_per_customer} onChange={(e) => setForm({ ...form, id_service_per_customer: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="ID Vuelo" value={form.id_sale_flight} onChange={(e) => setForm({ ...form, id_sale_flight: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="ID Empleado" value={form.id_sale_employee} onChange={(e) => setForm({ ...form, id_sale_employee: e.target.value })} />
        <input className="text-black px-2 py-1 mr-2 rounded" placeholder="Orden de Trabajo" value={form.work_order} onChange={(e) => setForm({ ...form, work_order: e.target.value })} />
        <select className="text-black px-2 py-1 mr-2 rounded" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded" onClick={handleAdd}>Agregar</button>
      </div>

      <table className="w-full table-auto bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Servicio Cliente</th>
            <th className="p-2">Vuelo</th>
            <th className="p-2">Empleado</th>
            <th className="p-2">Orden</th>
            <th className="p-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id_xtra_sale_employee} className="text-center border-t border-gray-700">
              <td className="p-2">{r.id_xtra_sale_employee}</td>
              <td className="p-2">{r.id_service_per_customer}</td>
              <td className="p-2">{r.id_sale_flight}</td>
              <td className="p-2">{r.id_sale_employee}</td>
              <td className="p-2">{r.work_order}</td>
              <td className="p-2">{r.status === 1 ? "Activo" : "Inactivo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtraServiceSaleAssignment;
