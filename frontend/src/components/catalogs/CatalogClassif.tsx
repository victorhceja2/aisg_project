import React, { useState } from "react";

const CatalogClassif: React.FC = () => {
  const [classifications, setClassifications] = useState([
    { id: 1, nombre: "Mantenimiento", estatus: "Activo" },
    { id: 2, nombre: "Inspección", estatus: "Inactivo" },
  ]);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("Activo");

  const handleAdd = () => {
    if (!newName) return;

    const id = classifications.length + 1;
    setClassifications([
      ...classifications,
      { id, nombre: newName, estatus: newStatus },
    ]);

    setNewName("");
    setNewStatus("Activo");
  };

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
            <th className="p-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {classifications.map((c) => (
            <tr key={c.id} className="text-center border-t border-gray-700">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.estatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogClassif;