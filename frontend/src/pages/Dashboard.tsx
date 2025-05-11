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
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Bienvenido, {userName}!
          </h1>
          <p className="text-center text-gray-200 mt-2 font-light">Perfil: {perfil}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta 1 */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0033A0] to-[#4D70B8] p-4 flex justify-between items-center">
              <div className="text-white font-bold text-2xl">
                12
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="text-white font-medium">Clientes</p>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#00B140] to-[#4DC970] p-4 flex justify-between items-center">
              <div className="text-white font-bold text-2xl">
                28
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="text-white font-medium">Servicios</p>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex justify-between items-center">
              <div className="text-white font-bold text-2xl">
                5
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="text-white font-medium">Clasificaciones</p>
            </div>
          </div>

          {/* Tarjeta 4 */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#4D70B8] to-[#3A5A9F] p-4 flex justify-between items-center">
              <div className="text-white font-bold text-2xl">
                3
              </div>
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="text-white font-medium">Estatus</p>
            </div>
          </div>
        </div>

        {/* Módulos de Acceso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Módulo Servicios */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-[#4D70B8] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-white">Servicios</h2>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Consulta y administra los servicios aeronáuticos ofrecidos.
              </p>
              <button
                onClick={() => navigate("/catalogs/services")}
                className="w-full bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Ir a Servicios
              </button>
            </div>
          </div>

          {/* Módulo Clientes */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-[#4D70B8] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-white">Clientes</h2>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Gestión completa de clientes y asignaciones.
              </p>
              <button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md cursor-not-allowed opacity-75"
                disabled
              >
                En desarrollo
              </button>
            </div>
          </div>

          {/* Módulo Configuraciones */}
          <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-[#4D70B8] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-white">Configuraciones</h2>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Parámetros extras y ajustes por compañía.
              </p>
              <button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md cursor-not-allowed opacity-75"
                disabled
              >
                En desarrollo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;