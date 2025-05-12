import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Menu from "./components/Menu";
import Reports from "./components/catalogs/Reports";
import CatalogSelector from "./components/catalogs/CatalogSelector";
import CatalogServices from "./components/catalogs/CatalogServices";
import CatalogClassification from "./components/catalogs/CatalogClassifications";
import CatalogStatus from "./components/catalogs/CatalogStatus";

import CatalogClassif from "./components/catalogs/CatalogClassif";
import ServicePerCustomer from "./components/catalogs/ServicePerCustomer";
import ExtraServiceSaleAssignment from "./components/catalogs/ExtraServiceSaleAssignment";
import AddService from "./pages/AddService";
import EditService from "./pages/EditService";
import AddClassification from "./pages/AddClassification";
import EditClassification from "./pages/EditClassification";
import AddCompany from "./pages/AddCompany";
import EditCompany from "./pages/EditCompany";
import ExtraCompanyConfiguration from "./components/catalogs/ExtraCompanyConfiguration";
import AddSPConsumer from "./pages/AddSPConsumer";
import EditSPConsumer from "./pages/EditSPConsumer";
import AddExtraService from "./pages/AddExtraService";
import EditExtraService from "./pages/EditExtraService";
import ProtectedRoute from "./components/ProtectedRoute";
import AddStatus from "./pages/AddStatus";
import EditStatus from "./pages/EditStatus";

/**
 * Componente principal de la aplicación AISG.
 * Aquí se maneja la navegación, la autenticación y el estado del menú lateral.
 */
const App: React.FC = () => {
  // Al iniciar, se determina si el menú debe estar abierto o cerrado según el tamaño de pantalla.
  const isMobileInitial = window.innerWidth < 1024;
  const [menuIsOpen, setMenuIsOpen] = useState(!isMobileInitial);
  const [isMobile, setIsMobile] = useState(isMobileInitial);
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('user') !== null);

  /**
   * Se configura el comportamiento del menú y la autenticación.
   * Si el usuario inicia o cierra sesión, o si cambia el tamaño de la pantalla,
   * se ajusta el menú automáticamente para mejorar la experiencia.
   */
  useEffect(() => {
    // Esta función revisa si el usuario está autenticado y ajusta el menú en consecuencia.
    const updateAuthStatus = () => {
      const authStatus = sessionStorage.getItem('user') !== null;
      setIsAuthenticated(authStatus);
      // Si no hay usuario autenticado, el menú se cierra.
      if (!authStatus) {
        setMenuIsOpen(false);
      } else if (authStatus && !isMobile) {
        // Si el usuario está autenticado y no es móvil, el menú se abre.
        setMenuIsOpen(true);
      }
    };

    // Cada vez que cambia el tamaño de la pantalla, se ajusta el menú.
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // En móvil, el menú siempre se cierra.
      if (mobile) {
        setMenuIsOpen(false);
      } else if (!mobile && isAuthenticated) {
        // En escritorio, el menú se abre si el usuario está autenticado.
        setMenuIsOpen(true);
      }
    };

    // Se escucha un evento personalizado para cambios de sesión.
    const handleStorageChange = () => {
      updateAuthStatus();
    };

    // Se agregan los listeners para los eventos relevantes.
    window.addEventListener('storageChange', handleStorageChange);
    window.addEventListener('logout', () => {
      setIsAuthenticated(false);
      setMenuIsOpen(false);
    });
    window.addEventListener('resize', handleResize);

    // Se verifica el estado inicial al montar el componente.
    updateAuthStatus();

    // Al desmontar el componente, se eliminan los listeners para evitar fugas de memoria.
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storageChange', handleStorageChange);
      window.removeEventListener('logout', () => {
        setIsAuthenticated(false);
        setMenuIsOpen(false);
      });
    };
  }, [isMobile, isAuthenticated]);

  return (
    <Router>
      <div className="flex h-screen w-screen bg-[#1A1A2E] overflow-hidden">
        {/* El menú lateral solo aparece si el usuario está autenticado */}
        {isAuthenticated && <Menu isOpen={menuIsOpen} setIsOpen={setMenuIsOpen} />}
        
        <div 
          className="flex-1 transition-all duration-300 overflow-y-auto"
          style={(isAuthenticated && menuIsOpen && !isMobile) ? { marginLeft: '256px' } : { marginLeft: '0' }}
        >
          <Routes>
            {/* Página de inicio de sesión (pública) */}
            <Route path="/" element={<Login />} />
            
            {/* Todas las rutas siguientes requieren autenticación */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* Reportes */}
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            
            {/* Catálogo de servicios */}
            <Route 
              path="/services" 
              element={
                <ProtectedRoute>
                  <CatalogServices />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/services/add" 
              element={
                <ProtectedRoute>
                  <AddService />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/services/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditService />
                </ProtectedRoute>
              }
            />

            {/* Selector de catálogos */}
            <Route 
              path="/catalogs" 
              element={
                <ProtectedRoute>
                  <CatalogSelector />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de servicios desde menú de catálogos */}
            <Route 
              path="/catalogs/services" 
              element={
                <ProtectedRoute>
                  <CatalogServices />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de clasificaciones (vista principal) */}
            <Route 
              path="/catalogs/classification" 
              element={
                <ProtectedRoute>
                  <CatalogClassification />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de clasificaciones (vista alternativa) */}
            <Route 
              path="/catalogs/classif" 
              element={
                <ProtectedRoute>
                  <CatalogClassif />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de compañías */}
            <Route 
              path="/catalogs/company" 
              element={
                <ProtectedRoute>
                  <ExtraCompanyConfiguration />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/company/add" 
              element={
                <ProtectedRoute>
                  <AddCompany />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/company/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditCompany />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de clientes */}
            <Route 
              path="/catalogs/customer" 
              element={
                <ProtectedRoute>
                  <ServicePerCustomer />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/customer/add" 
              element={
                <ProtectedRoute>
                  <AddSPConsumer />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/customer/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditSPConsumer />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de servicios extra */}
            <Route 
              path="/catalog/extra-service/add" 
              element={
                <ProtectedRoute>
                  <AddExtraService />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalog/extra-service/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditExtraService />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de asignaciones de servicios extra */}
            <Route 
              path="/reports/assignment" 
              element={
                <ProtectedRoute>
                  <ExtraServiceSaleAssignment />
                </ProtectedRoute>
              }
            />

            {/* Rutas para agregar y editar clasificaciones */}
            <Route 
              path="/classifications/add" 
              element={
                <ProtectedRoute>
                  <AddClassification />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/classifications/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditClassification />
                </ProtectedRoute>
              }
            />
            {/* Rutas alternativas para agregar y editar clasificaciones desde el menú de catálogos */}
            <Route 
              path="/catalogs/classif/add" 
              element={
                <ProtectedRoute>
                  <AddClassification />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/classif/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditClassification />
                </ProtectedRoute>
              }
            />

            {/* Catálogo de estatus de servicios */}
            <Route 
              path="/catalogs/status" 
              element={
                <ProtectedRoute>
                  <CatalogStatus />
                </ProtectedRoute>
              }
            />
            {/* Rutas para agregar y editar estatus */}
            <Route 
              path="/catalogs/status/add" 
              element={
                <ProtectedRoute>
                  <AddStatus />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/status/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditStatus />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;