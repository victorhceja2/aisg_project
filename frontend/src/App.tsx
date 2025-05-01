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



const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Menu />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalogs" element={<CatalogSelector />} />
            <Route path="/catalogs/services" element={<CatalogServices />} />
            <Route path="/catalogs/classification" element={<CatalogClassification />} />
            <Route path="/catalogs/status" element={<CatalogStatus />} />
            <Route path="/catalogs/classif" element={<CatalogClassif />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;