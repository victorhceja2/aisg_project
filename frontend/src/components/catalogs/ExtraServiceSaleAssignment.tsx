import React, { useEffect, useState } from "react";
import axios from "axios";

const ExtraServiceSaleAssignment: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id_service_per_customer: "",
    id_sale_flight: "",
    id_sale_employee: "",
    work_order: "",
    status: true
  });

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/catalog/extra-service-sale-assignment${search ? `?work_order=${encodeURIComponent(search)}` : ""}`
      );
      setAssignments(res.data);
    } catch (err) {
      console.error("Error al obtener asignaciones", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8000/catalog/extra-service-sale-assignment", {
        id_service_per_customer: parseInt(form.id_service_per_customer),
        id_sale_flight: parseInt(form.id_sale_flight),
        id_sale_employee: parseInt(form.id_sale_employee),
        work_order: form.work_order,
        status: form.status
      });
      fetchAssignments();
      setForm({
        id_service_per_customer: "",
        id_sale_flight: "",
        id_sale_employee: "",
        work_order: "",
        status: true
      });
    } catch (err) {
      console.error("Error al guardar asignación", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [search]);

  return (
    <div className="text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Asignación Extra de Servicios</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Asignación</h2>
        <input
          placeholder="ID Servicio Cliente"
          className="text-black px-2 py-1 mr-2 rounded"
          value={form.id_service_per_customer}
          onChange={(e) => setForm({ ...form, id_service_per_customer: e.target.value })}
        />
        <input
          placeholder="ID Vuelo"
          className="text-black px-2 py-1 mr-2 rounded"
          value={form.id_sale_flight}
          onChange={(e) => setForm({ ...form, id_sale_flight: e.target.value })}
        />
        <input
          placeholder="ID Empleado"
          className="text-black px-2 py-1 mr-2 rounded"
          value={form.id_sale_employee}
          onChange={(e) => setForm({ ...form, id_sale_employee: e.target.value })}
        />
        <input
          placeholder="Orden de Trabajo"
          className="text-black px-2 py-1 mr-2 rounded"
          value={form.work_order}
          onChange={(e) => setForm({ ...form, work_order: e.target.value })}
        />
        <label className="mr-4">
          <input
            type="checkbox"
            checked={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.checked })}
            className="mr-2"
          />
          Activo
        </label>
        <button className="bg-blue-600 px-4 py-1 rounded ml-4" onClick={handleAdd}>
          Agregar
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="text-black px-2 py-1 rounded w-full"
          placeholder="Buscar por Orden de Trabajo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full table-auto bg-gray-900 rounded text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Servicio Cliente</th>
            <th className="p-2">Vuelo</th>
            <th className="p-2">Empleado</th>
            <th className="p-2">Orden Trabajo</th>
            <th className="p-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id_xtra_sale_employee} className="text-center border-t border-gray-700">
              <td className="p-2">{a.id_xtra_sale_employee}</td>
              <td className="p-2">{a.id_service_per_customer}</td>
              <td className="p-2">{a.id_sale_flight}</td>
              <td className="p-2">{a.id_sale_employee}</td>
              <td className="p-2">{a.work_order}</td>
              <td className="p-2">{a.status ? "Activo" : "Inactivo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtraServiceSaleAssignment;