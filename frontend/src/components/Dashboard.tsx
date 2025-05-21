import React from 'react';
import AISGBackground from "./catalogs/fondo";

/**
 * Componente principal del Dashboard AISG.
 * Muestra tarjetas de resumen, próximos mantenimientos, estadísticas y recursos del sistema.
 * Aplica el diseño consistente con el resto del sistema.
 */
const Dashboard = () => {
  // Paleta de colores corporativos AISG
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    darkBgSecondary: "#16213E",
    darkBgTertiary: "#0D1B2A",
    darkBgPanel: "#1E2A45",
    lightBg: "#F5F5F7",
    textDark: "#222222",
    textLight: "#FFFFFF",
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen">
        {/* Cabecera principal con título y descripción */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-center text-white">
            Bienvenido al sistema AISG
          </h1>
          <p className="text-gray-200 mt-2 font-light text-center">
            Panel de control para monitoreo de operaciones
          </p>
        </div>

        {/* Tarjetas de información rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta: Servicios Activos */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0033A0] to-[#4D70B8] p-4 flex justify-between items-center">
              <div className="text-white font-bold text-xl">
                24
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium">Servicios Activos</h3>
            </div>
          </div>

          {/* Tarjeta: Completados Hoy */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#00B140] to-[#4DC970] p-4 flex justify-between items-center">
              <div className="text-white font-bold text-xl">
                18
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium">Completados Hoy</h3>
            </div>
          </div>

          {/* Tarjeta: Pendientes */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex justify-between items-center">
              <div className="text-white font-bold text-xl">
                7
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium">Pendientes</h3>
            </div>
          </div>

          {/* Tarjeta: Técnicos Activos */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#4D70B8] to-[#3A5A9F] p-4 flex justify-between items-center">
              <div className="text-white font-bold text-xl">
                12
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium">Técnicos Activos</h3>
            </div>
          </div>
        </div>

        {/* Panel principal de resumen general */}
        <div className="bg-[#16213E] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Resumen General</h2>
          <p className="text-gray-300">
            Este panel muestra información relevante sobre los mantenimientos programados y en proceso. 
            Utilice las diferentes secciones para monitorear el estado actual del sistema.
          </p>
          <div className="mt-4 bg-[#0D1B2A] p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Próximos mantenimientos</h3>
            <ul className="space-y-2">
              {[1, 2, 3].map((item) => (
                <li key={item} className="flex justify-between items-center border-b border-[#1E2A45] pb-2">
                  <div>
                    <p className="text-white">Servicio #{1000 + item}</p>
                    <p className="text-gray-400 text-sm">Cliente ABC</p>
                  </div>
                  <span className="text-gray-400 text-sm">En {item} día{item !== 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Panel inferior con estadísticas y recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel de estadísticas mensuales */}
          <div className="bg-[#16213E] rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Estadísticas Mensuales</h2>
            <div className="text-center py-8 text-gray-400">
              [Aquí irá un gráfico de estadísticas]
            </div>
          </div>
          {/* Panel de recursos del sistema */}
          <div className="bg-[#16213E] rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recursos del Sistema</h2>
            <div className="space-y-4">
              {/* Carga del servidor */}
              <div className="bg-[#0D1B2A] p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white">Carga del Servidor</span>
                  <span className="text-[#4DC970]">Normal</span>
                </div>
                <div className="w-full bg-[#1E2A45] rounded-full h-2.5">
                  <div className="bg-[#00B140] h-2.5 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              {/* Almacenamiento */}
              <div className="bg-[#0D1B2A] p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white">Almacenamiento</span>
                  <span className="text-amber-400">65%</span>
                </div>
                <div className="w-full bg-[#1E2A45] rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              {/* Ancho de banda */}
              <div className="bg-[#0D1B2A] p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white">Ancho de Banda</span>
                  <span className="text-[#4D70B8]">30%</span>
                </div>
                <div className="w-full bg-[#1E2A45] rounded-full h-2.5">
                  <div className="bg-[#0033A0] h-2.5 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default Dashboard;