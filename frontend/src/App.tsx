import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Menu from "./components/Menu";
import Reports from "./components/catalogs/Reports";
import CatalogSelector from "./components/catalogs/CatalogSelector";
import ConfigSelector from "./components/catalogs/ConfigSelector";
import CatalogServices from "./components/catalogs/CatalogServices";
import CatalogClassification from "./components/catalogs/CatalogClassifications";
import CatalogStatus from "./components/catalogs/CatalogStatus";
import CatalogClassif from "./components/catalogs/CatalogClassif";
import CatalogServiceType from "./components/catalogs/CatalogServiceType";
import CatalogServiceInclude from "./components/catalogs/CatalogServiceinclude";
import CatalogServiceCategory from "./components/catalogs/CatalogServiceCategory";
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
import OperationReport from "./components/catalogs/OperationReport";
import OperationService from "./components/catalogs/OperationService";
import AddServiceType from "./pages/AddSPC";
import EditServiceType from "./pages/EditSPC";
import AddCSI from "./pages/AddCSI";
import EditCSI from "./pages/EditCSI";
import AddCSC from "./pages/AddCSC";
import EditCSC from "./pages/EditCSC";

const App: React.FC = () => {
  const isMobileInitial = window.innerWidth < 1024;
  const [menuIsOpen, setMenuIsOpen] = useState(!isMobileInitial);
  const [isMobile, setIsMobile] = useState(isMobileInitial);
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('user') !== null);

  useEffect(() => {
    const updateAuthStatus = () => {
      const authStatus = sessionStorage.getItem('user') !== null;
      setIsAuthenticated(authStatus);
      if (!authStatus) {
        setMenuIsOpen(false);
      } else if (authStatus && !isMobile) {
        setMenuIsOpen(true);
      }
    };

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setMenuIsOpen(false);
      } else if (!mobile && isAuthenticated) {
        setMenuIsOpen(true);
      }
    };

    const handleStorageChange = () => {
      updateAuthStatus();
    };

    window.addEventListener('storageChange', handleStorageChange);
    window.addEventListener('logout', () => {
      setIsAuthenticated(false);
      setMenuIsOpen(false);
    });
    window.addEventListener('resize', handleResize);

    updateAuthStatus();

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
        {isAuthenticated && <Menu isOpen={menuIsOpen} setIsOpen={setMenuIsOpen} />}
        <div 
          className="flex-1 transition-all duration-300 overflow-y-auto"
          style={(isAuthenticated && menuIsOpen && !isMobile) ? { marginLeft: '256px' } : { marginLeft: '0' }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/reports/operations"
              element={
                <ProtectedRoute>
                  <OperationReport />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/reports/services"
              element={
                <ProtectedRoute>
                  <OperationService />
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
              path="/configuration" 
              element={
                <ProtectedRoute>
                  <ConfigSelector />
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
              path="/catalogs/classif" 
              element={
                <ProtectedRoute>
                  <CatalogClassif />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/servicetype" 
              element={
                <ProtectedRoute>
                  <CatalogServiceType />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/servicetype/add"
              element={
                <ProtectedRoute>
                  <AddServiceType />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/servicetype/edit/:id"
              element={
                <ProtectedRoute>
                  <EditServiceType />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/serviceinclude" 
              element={
                <ProtectedRoute>
                  <CatalogServiceInclude />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/serviceinclude/add"
              element={
                <ProtectedRoute>
                  <AddCSI />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/serviceinclude/edit/:id"
              element={
                <ProtectedRoute>
                  <EditCSI />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/servicecategory" 
              element={
                <ProtectedRoute>
                  <CatalogServiceCategory />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/servicecategory/add"
              element={
                <ProtectedRoute>
                  <AddCSC />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogs/servicecategory/edit/:id"
              element={
                <ProtectedRoute>
                  <EditCSC />
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
              path="/reports/assignment" 
              element={
                <ProtectedRoute>
                  <ExtraServiceSaleAssignment />
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
            <Route 
              path="/catalogs/status" 
              element={
                <ProtectedRoute>
                  <CatalogStatus />
                </ProtectedRoute>
              }
            />
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