
import React, { useState } from "react";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState([
    { id: 1, nombre: "Item 1", descripcion: "Descripción 1", estatus: "Activo" },
    { id: 2, nombre: "Item 2", descripcion: "Descripción 2", estatus: "Inactivo" },
  ]);
  const [newService, setNewService] = useState({ nombre: "", descripcion: "", estatus: "Activo" });

  const handleAdd = () => {
    const id = services.length + 1;
    setServices([...services, { id, ...newService }]);
    setNewService({ nombre: "", descripcion: "", estatus: "Activo" });
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Servicios</h1>
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar Servicio</h2>
        <input
          className="text-black px-2 py-1 rounded mr-2"
          placeholder="Nombre"
          value={newService.nombre}
          onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
        />
        <input
          className="text-black px-2 py-1 rounded mr-2"
          placeholder="Descripción"
          value={newService.descripcion}
          onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
        />
        <select
          className="text-black px-2 py-1 rounded"
          value={newService.estatus}
          onChange={(e) => setNewService({ ...newService, estatus: e.target.value })}
        >
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
        <button className="ml-2 bg-blue-600 px-4 py-1 rounded" onClick={handleAdd}>Agregar</button>
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
              <td className="p-2">{s.nombre}</td>
              <td className="p-2">{s.descripcion}</td>
              <td className="p-2">{s.estatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogServices;
