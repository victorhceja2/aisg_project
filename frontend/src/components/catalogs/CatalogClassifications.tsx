import React from "react";

const CatalogClassifications: React.FC = () => {
  const classifications = [
    { id: 1, nombre: "Mantenimiento", estatus: "Activo" },
    { id: 2, nombre: "Inspección", estatus: "Inactivo" },
  ];

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Clasificación de Servicios</h1>

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

export default CatalogClassifications;