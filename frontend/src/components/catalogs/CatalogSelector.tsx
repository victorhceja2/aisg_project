import React from "react";
import { useNavigate } from "react-router-dom";
import AISGBackground from "./fondo";

/**
 * Visual selector for AISG system catalogs.
 * Only shows the two requested catalogs.
 */
const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  // Solo los dos catálogos solicitados
  const catalogs = [
    { 
      label: "Services Catalog", 
      path: "/catalogs/services",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      ),
      color: "from-[#00B140] to-[#0033A0]"
    },
    { 
      label: "Services per Customer Catalog", 
      path: "/catalogs/customer",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-8 0 4 4 0 008 0z" />
        </svg>
      ),
      color: "from-[#0033A0] to-[#00B140]"
    }
  ];

  return (
    <AISGBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
        <div className="max-w-3xl mx-auto">
          {/* Header with title and description */}
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center text-white">
              Select a Catalog
            </h1>
            <p className="text-gray-200 mt-2 font-light text-center">
              Manage the main catalogs of the system
            </p>
          </div>

          {/* Cards section, each represents a different catalog */}
          <div className="bg-transparent rounded-b-lg shadow-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {catalogs.map(({ label, path, icon, color }) => (
                <div 
                  key={path}
                  onClick={() => navigate(path)}
                  className="bg-[#1E2A45] rounded-lg shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow hover:bg-[#2A395A]"
                >
                  <div className={`bg-gradient-to-r ${color} p-4 flex items-center justify-center`}>
                    {icon}
                  </div>
                  <div className="p-6 text-center">
                    <h2 className="text-lg font-medium text-white">{label}</h2>
                    <p className="mt-2 text-sm text-gray-300">
                      Click to manage this catalog
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default CatalogSelector;