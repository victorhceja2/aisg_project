import React from "react";
import { useNavigate } from "react-router-dom";

const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Selecciona un Catálogo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/catalogs/services")}
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg text-white text-lg font-semibold"
        >
          Catálogo de Servicios
        </button>
{/*         <button
          onClick={() => navigate("/catalogs/classifications")}
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg text-white text-lg font-semibold"
        >
          Clasificación de Servicios
        </button> */}
        <button
          onClick={() => navigate("/catalogs/status")}
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg text-white text-lg font-semibold"
        >
          Estatus de Servicios
        </button>
        <button
          onClick={() => navigate("/catalogs/classif")}
          className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg text-white text-lg font-semibold"
        >
          Clasificación de Servicios
        </button>
      </div>
    </div>
  );
};

export default CatalogSelector;