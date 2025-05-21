import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

/**
 * Main Dashboard component.
 * Displays personalized welcome, KPIs, and quick access to modules.
 * Redirects to login if there's no active session.
 */
const Dashboard: React.FC = () => {
  // Get username and profile from sessionStorage
  const userName = sessionStorage.getItem("userName") || "User";
  const perfil = sessionStorage.getItem("perfil") || "Unknown Profile";
  const navigate = useNavigate();

  // Redirect to login if no authenticated user
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen">
        {/* Cabecera principal */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome, {userName}!</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">Profile: {perfil}</p>
        </div>

        {/* KPIs estilo CatalogClassif */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Clientes */}
          <div className="bg-white rounded-lg shadow-md border border-[#cccccc] flex flex-col items-center justify-center py-6 px-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#0033A0] to-[#4D70B8] mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#002057]">12</div>
            <div className="text-[#002057] font-medium mt-1">Clients</div>
          </div>
          {/* Servicios */}
          <div className="bg-white rounded-lg shadow-md border border-[#cccccc] flex flex-col items-center justify-center py-6 px-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#00B140] to-[#4DC970] mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#002057]">28</div>
            <div className="text-[#002057] font-medium mt-1">Services</div>
          </div>
          {/* Clasificaciones */}
          <div className="bg-white rounded-lg shadow-md border border-[#cccccc] flex flex-col items-center justify-center py-6 px-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#002057]">5</div>
            <div className="text-[#002057] font-medium mt-1">Classifications</div>
          </div>
          {/* Estatus */}
          <div className="bg-white rounded-lg shadow-md border border-[#cccccc] flex flex-col items-center justify-center py-6 px-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#4D70B8] to-[#3A5A9F] mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#002057]">3</div>
            <div className="text-[#002057] font-medium mt-1">Status</div>
          </div>
        </div>

        {/* Tarjetas de acceso rápido, separadas de los KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Servicios */}
          <div className="bg-[#1E2A45] rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-[#00B140] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-white">Services</h2>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                View and manage the offered aeronautical services.
              </p>
              <button
                onClick={() => navigate("/catalogs/services")}
                className="w-full bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go to Services
              </button>
            </div>
          </div>
          {/* Clientes */}
          <div className="bg-[#1E2A45] rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-[#00B140] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <h2 className="text-xl font-semibold text-white">Clients</h2>
              </div>
              <p className="text-sm text-gray-300 mb-4">Full client and assignment management.</p>
              <button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md cursor-not-allowed opacity-75"
                disabled
              >
                In development
              </button>
            </div>
          </div>
          {/* Configuraciones */}
          <div className="bg-[#1E2A45] rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-[#00B140] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-white">Settings</h2>
              </div>
              <p className="text-sm text-gray-300 mb-4">Extra parameters and company-specific settings.</p>
              <button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md cursor-not-allowed opacity-75"
                disabled
              >
                In development
              </button>
            </div>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default Dashboard;