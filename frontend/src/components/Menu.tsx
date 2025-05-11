import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  // Detector de cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Botón de menú hamburguesa para móviles
  const MobileMenuButton = () => (
    <button 
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#0D1B2A] text-white"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      )}
    </button>
  );

  // Contenido del menú (se muestra siempre en desktop, y condicionalmente en móvil)
  const MenuContent = () => (
    <div className={`${isMobileView ? (isMobileMenuOpen ? 'fixed inset-0 z-40' : 'hidden') : 'relative'} w-64 bg-[#0D1B2A] text-white h-screen shadow-lg flex flex-col font-['Montserrat']`}>
      {/* Header con logo */}
      <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 flex flex-col items-center">
        <div className="mb-4">
          <img
            src="/logo_aisg.jpeg"
            alt="AISG Logo"
            className="w-20 h-20 object-contain rounded-full border-2 border-white shadow-md"
          />
        </div>
        <h1 className="text-xl font-bold text-white">AISG</h1>
      </div>

      {/* Menú de navegación */}
      <nav className="flex flex-col p-4 flex-1">
        <div className="space-y-1 mb-6 border-b border-[#16213E] pb-4">
          <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 px-3">
            Principal
          </h2>
          
          <button 
            onClick={() => {
              navigate("/dashboard");
              if (isMobileView) setIsMobileMenuOpen(false);
            }} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
              isActive("/dashboard") 
                ? "bg-[#0033A0] text-white" 
                : "text-gray-300 hover:bg-[#16213E]"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Dashboard
          </button>
        </div>
        
        <div className="space-y-1 mb-6 border-b border-[#16213E] pb-4">
          <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 px-3">
            Módulos
          </h2>
          
          <button 
            onClick={() => {
              navigate("/services");
              if (isMobileView) setIsMobileMenuOpen(false);
            }} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
              isActive("/services") 
                ? "bg-[#0033A0] text-white" 
                : "text-gray-300 hover:bg-[#16213E]"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Mantenimiento
          </button>
          
          <button 
            onClick={() => {
              navigate("/configurations");
              if (isMobileView) setIsMobileMenuOpen(false);
            }} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
              isActive("/configurations") 
                ? "bg-[#0033A0] text-white" 
                : "text-gray-300 hover:bg-[#16213E]"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Reportes
          </button>
          
          <button 
            onClick={() => {
              navigate("/catalogs");
              if (isMobileView) setIsMobileMenuOpen(false);
            }} 
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
              isActive("/catalogs") 
                ? "bg-[#0033A0] text-white" 
                : "text-gray-300 hover:bg-[#16213E]"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
            Catálogos
          </button>
        </div>
      </nav>

      {/* Botón de cerrar sesión */}
      <div className="p-4 border-t border-[#16213E]">
        <button
          onClick={() => {
            sessionStorage.clear();
            navigate("/");
          }}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <MobileMenuButton />
      <MenuContent />
      
      {/* Overlay para cerrar el menú móvil al hacer clic fuera */}
      {isMobileView && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Menu;