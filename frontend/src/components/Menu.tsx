// src/components/Menu.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

const Menu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-gray-900 text-white p-6 flex flex-col space-y-6">
      <div className="flex flex-col items-center">
        <img
          src="/logo_aisg.jpeg"
          alt="AISG Logo"
          className="w-28 h-auto mb-4"
        />
        <h1 className="text-xl font-bold text-center">AISG</h1>
      </div>

      <nav className="flex flex-col space-y-3 text-left">
        <button onClick={() => navigate("/dashboard")} className="hover:text-blue-400">
          Dashboard
        </button>
        <button onClick={() => navigate("/services")} className="hover:text-blue-400">
          Mantenimiento
        </button>
        <button onClick={() => navigate("/configurations")} className="hover:text-blue-400">
          Reportes
        </button>
        <button onClick={() => navigate("/catalogs")} className="hover:text-blue-400">
          Catálogos
        </button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={() => {
            sessionStorage.clear();
            navigate("/");
          }}
          className="text-red-400 hover:text-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Menu;