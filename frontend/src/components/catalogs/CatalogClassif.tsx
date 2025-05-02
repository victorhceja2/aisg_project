import React, { useState, useEffect } from "react";
import axios from "axios";

const CatalogClassif: React.FC = () => {
  const [classifications, setClassifications] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("Activo"); // Este campo no se usa en BD, lo podemos omitir más adelante si no lo requiere.

  const fetchClassifications = async () => {
    try {
      const res = await axios.get("http://localhost:8000/catalog/service-classification/");
      setClassifications(res.data);
    } catch (err) {
      console.error("Error al obtener clasificaciones", err);
    }
  };

  const handleAdd = async () => {
    if (!newName) return;
    try {
      await axios.post("http://localhost:8000/catalog/service-classification/", {
        service_classification_name: newName,
      });
      setNewName("");
      setNewStatus("Activo");
      fetchClassifications();
    } catch (err) {
      console.error("Error al agregar clasificación", err);
    }
  };

  useEffect(() => {
    fetchClassifications();
  }, []);

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Clasificación de Servicios</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Clasificación</h2>
        <input
          className="text-black px-2 py-1 mr-2 rounded"
          placeholder="Nombre"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <select
          className="text-black px-2 py-1 mr-2 rounded"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          disabled
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
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
            <th className="p-2">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {classifications.map((c) => (
            <tr key={c.id_service_classification} className="text-center border-t border-gray-700">
              <td className="p-2">{c.id_service_classification}</td>
              <td className="p-2">{c.service_classification_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogClassif;