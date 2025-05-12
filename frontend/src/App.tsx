import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Menu from "./components/Menu";
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

const App: React.FC = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Verificación de autenticación sin usar estado para evitar problemas de re-renderizado
  const checkAuthentication = () => {
    return sessionStorage.getItem('user') !== null;
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setMenuIsOpen(false);
      } else {
        setMenuIsOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Router>
      <div className="flex h-screen w-screen bg-[#1A1A2E] overflow-hidden">
        {/* Siempre renderizar el menú, pero con lógica de visibilidad interna */}
        <Menu isOpen={menuIsOpen && checkAuthentication()} setIsOpen={setMenuIsOpen} />
        
        <div 
          className={`flex-1 transition-all duration-300 overflow-y-auto`}
          style={(checkAuthentication() && menuIsOpen && !isMobile) ? { marginLeft: '256px' } : { marginLeft: '0' }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/services" 
              element={
                <ProtectedRoute>
                  <CatalogServices />
                </ProtectedRoute>
              }
            />
            
            {/* Resto de rutas... */}
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
            
            <Route 
              path="/catalogs" 
              element={
                <ProtectedRoute>
                  <CatalogSelector />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/catalogs/services" 
              element={
                <ProtectedRoute>
                  <CatalogServices />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/catalogs/classification" 
              element={
                <ProtectedRoute>
                  <CatalogClassification />
                </ProtectedRoute>
              }
            />

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
            
            <Route 
              path="/catalogs/status" 
              element={
                <ProtectedRoute>
                  <CatalogStatus />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/catalogs/classif" 
              element={
                <ProtectedRoute>
                  <CatalogClassif />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/catalogs/customer" 
              element={
                <ProtectedRoute>
                  <ServicePerCustomer />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/catalogs/assignment" 
              element={
                <ProtectedRoute>
                  <ExtraServiceSaleAssignment />
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