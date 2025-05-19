import React from "react";
import { useNavigate } from "react-router-dom";
import AISGBackground from "./fondo";

/**
 * Visual selector for AISG system catalogs.
 * Each card represents a catalog and navigates to the corresponding section.
 */
const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  // Corporate colors for gradients and backgrounds
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    darkBgSecondary: "#16213E",
    darkBgTertiary: "#0D1B2A",
  };

  // Only the modules from the provided list
  const catalogs = [
    { 
      label: "Clasifications Catalog", 
      path: "/catalogs/classif",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      ),
      color: "from-[#00B140] to-[#4DC970]"
    },
    { 
      label: "Service Type Catalog", 
      path: "/catalogs/servicetype",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      ),
      color: "from-[#4DC970] to-[#0033A0]"
    },
    { 
      label: "Service Include Catalog", 
      path: "/catalogs/serviceinclude",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 11h14M10 16h4m-7 5h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-[#00B140] to-[#0033A0]"
    },
    { 
      label: "Categories Catalog", 
      path: "/catalogs/servicecategory",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      ),
      color: "from-[#00B140] to-[#4D70B8]"
    },
    { 
      label: "Status Catalog", 
      path: "/catalogs/status",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: "from-[#4D70B8] to-[#3A5A9F]"
    }
  ];

  return (
    <AISGBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
        <div className="max-w-6xl mx-auto">
          {/* Header with title and description */}
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center text-white">
              Select a Configuration
            </h1>
            <p className="text-gray-200 mt-2 font-light text-center">
              System configuration management
            </p>
          </div>

          {/* Cards section, each represents a different catalog */}
          <div className="bg-transparent rounded-b-lg shadow-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogs.map(({ label, path, icon, color }) => (
                <div 
                  key={path}
                  onClick={() => navigate(path)}
                  className="bg-[#1E2A45] rounded-lg shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow hover:bg-[#2A395A]"
                >
                  <div className={`bg-gradient-to-r ${color} p-4 flex items-center justify-center text-white`}>
                    {icon}
                  </div>
                  <div className="p-6 text-center">
                    <h2 className="text-lg font-medium text-white">{label}</h2>
                    <p className="mt-2 text-sm text-gray-300">
                      Click to manage this configuration
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