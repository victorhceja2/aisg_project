// src/pages/Dashboard.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const userName = sessionStorage.getItem("userName") || "Usuario";
  const perfil = sessionStorage.getItem("perfil") || "Perfil desconocido";
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Bienvenido, {userName}!</h1>
      <p className="text-gray-400 mb-8">Perfil: {perfil}</p>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
          <p className="text-4xl font-bold">12</p>
          <p className="text-gray-300">Clientes</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
          <p className="text-4xl font-bold">28</p>
          <p className="text-gray-300">Servicios</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
          <p className="text-4xl font-bold">5</p>
          <p className="text-gray-300">Clasificaciones</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
          <p className="text-4xl font-bold">3</p>
          <p className="text-gray-300">Estatus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Servicios</h2>
          <p className="text-sm text-gray-300">
            Consulta y administra los servicios aeronáuticos ofrecidos.
          </p>
          <button
            onClick={() => navigate("/catalogs/services")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Ir a Servicios
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Clientes</h2>
          <p className="text-sm text-gray-300">
            Gestión completa de clientes y asignaciones.
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled
          >
            En desarrollo
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Configuraciones</h2>
          <p className="text-sm text-gray-300">
            Parámetros extras y ajustes por compañía.
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled
          >
            En desarrollo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
