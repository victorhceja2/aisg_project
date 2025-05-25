import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Componente de menú lateral para navegación principal del sistema AISG.
 * Incluye navegación protegida por sesión, responsive para móvil y desktop, y cierre de sesión.
 * Ahora con fondo corporativo e iconos adaptados.
 */
interface MenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActiveExact = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    const isAuthenticated = sessionStorage.getItem("user") !== null;
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    navigate(path);
    if (isMobileView) setIsOpen(false);
  };

  const confirmLogout = () => setShowLogoutConfirm(true);

  const handleLogout = () => {
    sessionStorage.clear();
    window.dispatchEvent(new Event("logout"));
    navigate("/", { replace: true });
    setShowLogoutConfirm(false);
  };

  const MenuToggleButton = () => (
    <button
      className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[#002057] text-white shadow-lg"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );

  const LogoutConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#16213E] rounded-lg p-6 w-80 shadow-lg border border-[#0033A0]/30">
        <h3 className="text-lg font-medium text-white mb-4">Confirm logout</h3>
        <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const MenuContent = () => (
    <div
      className={`fixed top-0 left-0 h-full
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"}
        transition-all duration-300 bg-cover bg-center text-white shadow-lg 
        flex flex-col font-['Montserrat'] z-40 overflow-hidden`}
      style={{
        backgroundImage: `linear-gradient(rgba(0,32,87,0.92),rgba(0,32,87,0.96)), url('/bg-aisg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div className="flex-none bg-transparent p-6 flex flex-col items-center border-b border-[#1e3462]/60">
        <img
          src="/logo_aisg.jpeg"
          alt="AISG Logo"
          className="w-20 h-20 object-contain rounded-full border-2 border-white shadow-md"
        />
      </div>

      {/* Main menu */}
      <div className="flex-grow overflow-y-auto h-0">
        <nav className="p-4 flex flex-col">
          {/* Se elimina la sección Dashboard */}
          <div className="space-y-1 mb-6 border-b border-[#1e3462]/60 pb-4">
            <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 px-3">
              Modules
            </h2>
            {/* Maintenance eliminado */}
            <button
              onClick={() => handleNavigation("/reports")}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                isActiveExact("/reports") ? "bg-[#0033A0] text-white" : "text-gray-200 hover:bg-[#1e3462]/70"
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </button>
            <button
              onClick={() => handleNavigation("/catalogs")}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                isActiveExact("/catalogs") ? "bg-[#0033A0] text-white" : "text-gray-200 hover:bg-[#1e3462]/70"
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              Catalogs
            </button>
            <button
              onClick={() => handleNavigation("/configuration")}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                isActiveExact("/configuration") ? "bg-[#0033A0] text-white" : "text-gray-200 hover:bg-[#1e3462]/70"
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Complements
            </button>
          </div>
        </nav>
      </div>

      {/* Footer fijo con botón de cerrar sesión */}
      <div className="p-4 border-t border-[#1e3462]/60 bg-[#002057]/90">
        <button
          onClick={confirmLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 rounded-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <MenuToggleButton />
      <MenuContent />
      {isMobileView && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsOpen(false)} />
      )}
      {showLogoutConfirm && <LogoutConfirmModal />}
    </>
  );
};

export default Menu;