import React from "react";
import { useNavigate } from "react-router-dom";

const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  const catalogs = [
    { label: "Catálogo de Servicios", path: "/catalogs/services" },
    { label: "Clasificación de Servicios", path: "/catalogs/classif" },
    { label: "Estatus de Servicios", path: "/catalogs/status" },
    { label: "Configuración de Compañía", path: "/catalogs/company" },
    { label: "Servicios por Cliente", path: "/catalogs/customer" },
    { label: "Asignación Extra de Servicios", path: "/catalogs/assignment" }
  ];

  return (
    <div className="text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Selecciona un Catálogo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {catalogs.map(({ label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg text-white text-lg font-semibold"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CatalogSelector;