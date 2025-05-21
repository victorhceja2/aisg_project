import React from "react";
import { useNavigate } from "react-router-dom";
import AISGBackground from "./fondo";

/**
 * Visual selector for AISG system catalogs.
 * Cada card representa un catálogo y navega a la sección correspondiente.
 * Diseño consistente con el resto del sistema.
 */
const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  // Catálogos disponibles
  const catalogs = [
    { 
      label: "Clasifications Catalog", 
      path: "/catalogs/classif",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      ),
      color: "from-[#00B140] to-[#4DC970]"
    },
    { 
      label: "Service Type Catalog", 
      path: "/catalogs/servicetype",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      ),
      color: "from-[#4DC970] to-[#0033A0]"
    },
    { 
      label: "Service Include Catalog", 
      path: "/catalogs/serviceinclude",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 11h14M10 16h4m-7 5h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-[#00B140] to-[#0033A0]"
    },
    { 
      label: "Categories Catalog", 
      path: "/catalogs/servicecategory",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      ),
      color: "from-[#00B140] to-[#4D70B8]"
    },
    { 
      label: "Status Catalog", 
      path: "/catalogs/status",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: "from-[#4D70B8] to-[#3A5A9F]"
    }
  ];

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        {/* Cabecera principal con título y descripción */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Catalogs</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            System configuration management
          </p>
        </div>
        {/* Cards de selección de catálogo */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {catalogs.map(({ label, path, icon }) => (
              <div 
                key={path}
                onClick={() => navigate(path)}
                className="bg-[#16213E] rounded-xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow border border-[#0033A0] flex flex-col items-center hover:border-[#00B140]"
                style={{ minHeight: "220px" }}
              >
                {/* Encabezado blanco y texto color de fondo */}
                <div className="w-full bg-white p-4 flex items-center justify-center">
                  <span className="text-[#16213E]">{icon}</span>
                </div>
                <div className="p-6 text-center flex-1 flex flex-col justify-center">
                  <h2 className="text-lg font-semibold text-white">{label}</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Click to manage this configuration
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default CatalogSelector;