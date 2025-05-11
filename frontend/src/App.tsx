import React from "react";
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

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Menu />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<CatalogServices />} />
            <Route path="/services/add" element={<AddService />} />
            <Route path="/services/edit/:id" element={<EditService />} />
            <Route path="/catalogs" element={<CatalogSelector />} />
            <Route path="/catalogs/services" element={<CatalogServices />} />
            <Route path="/catalogs/classification" element={<CatalogClassification />} />

            {/* Rutas para configuración extra de compañía */}
            <Route path="/catalogs/company" element={<ExtraCompanyConfiguration />} />
            <Route path="/catalogs/company/add" element={<AddCompany />} />
            <Route path="/catalogs/company/edit/:id" element={<EditCompany />} />

            <Route path="/catalogs/customer/add" element={<AddSPConsumer />} />
            <Route path="/catalogs/customer/edit/:id" element={<EditSPConsumer />} />

            <Route path="/catalog/extra-service/add" element={<AddExtraService />} />
            <Route path="/catalog/extra-service/edit/:id" element={<EditExtraService />} />

            <Route path="/classifications/add" element={<AddClassification />} />
            <Route path="/classifications/edit/:id" element={<EditClassification />} />
            <Route path="/catalogs/status" element={<CatalogStatus />} />
            <Route path="/catalogs/classif" element={<CatalogClassif />} />
            <Route path="/catalogs/customer" element={<ServicePerCustomer />} />
            <Route path="/catalogs/assignment" element={<ExtraServiceSaleAssignment />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;