import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente que permite seleccionar visualmente entre los diferentes catálogos del sistema AISG.
 * Cada tarjeta representa un catálogo y al hacer clic se navega a la sección correspondiente.
 */
const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  // Definimos los colores corporativos de AISG para usarlos en los gradientes y fondos
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    darkBgSecondary: "#16213E",
    darkBgTertiary: "#0D1B2A",
  };

  // Creamos un arreglo con la información de cada catálogo: nombre, ruta, ícono y gradiente
  // Se ha eliminado la opción "Asignación Extra de Servicios"
  const catalogs = [
    { 
      label: "Catálogo de Servicios", 
      path: "/catalogs/services",
      icon: (
        // Ícono representativo para servicios
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      color: "from-[#0033A0] to-[#4D70B8]"
    },
    { 
      label: "Clasificación de Servicios", 
      path: "/catalogs/classif",
      icon: (
        // Ícono representativo para clasificación
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      ),
      color: "from-[#00B140] to-[#4DC970]"
    },
    { 
      label: "Estatus de Servicios", 
      path: "/catalogs/status",
      icon: (
        // Ícono representativo para estatus
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: "from-[#4D70B8] to-[#3A5A9F]"
    },
    { 
      label: "Configuración de Compañía", 
      path: "/catalogs/company",
      icon: (
        // Ícono representativo para configuración de compañía
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      ),
      color: "from-amber-500 to-amber-600"
    },
    { 
      label: "Servicios por Cliente", 
      path: "/catalogs/customer",
      icon: (
        // Ícono representativo para servicios por cliente
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      color: "from-[#0033A0] to-[#002D8A]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera principal con título y descripción */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-2xl font-bold text-center text-white">
            Selecciona un Catálogo
          </h1>
          <p className="text-gray-200 mt-2 font-light text-center">
            Gestión de catálogos del sistema
          </p>
        </div>

        {/* Sección de tarjetas, cada una representa un catálogo diferente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map(({ label, path, icon, color }) => (
            <div 
              key={path}
              onClick={() => navigate(path)} // Al hacer clic se navega a la ruta del catálogo
              className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
            >
              {/* Cabecera de la tarjeta con gradiente e ícono */}
              <div className={`bg-gradient-to-r ${color} p-4 flex items-center justify-center`}>
                {icon}
              </div>
              
              {/* Cuerpo de la tarjeta con el nombre y una breve instrucción */}
              <div className="p-6 text-center">
                <h2 className="text-lg font-medium text-white">{label}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Haz clic para gestionar este catálogo
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogSelector;