import React from "react";
import { useNavigate } from "react-router-dom";
import AISGBackground from "./fondo";

const CatalogSelector: React.FC = () => {
  const navigate = useNavigate();

  const catalogs = [
    {
      label: "Services Catalog",
      path: "/catalogs/services",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      ),
      color: "from-[#00B140] to-[#0033A0]",
      disabled: false
    },
    {
      label: "Services per Customer Catalog",
      path: "/catalogs/customer",
      icon: (
        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-8 0 4 4 0 008 0z" />
        </svg>
      ),
      color: "from-[#0033A0] to-[#00B140]",
      disabled: false
    }
  ];

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Catalogs</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the main catalogs of the system
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {catalogs.map(({ label, path, icon, color, disabled }) => (
            <div
              key={path}
              onClick={() => !disabled && navigate(path)}
              className={`
                bg-[#16213E] rounded-xl shadow-xl overflow-hidden cursor-pointer
                hover:shadow-2xl transition-shadow border border-[#0033A0]
                flex flex-col items-center
                ${disabled
                  ? "opacity-60 cursor-not-allowed hover:border-[#0033A0]"
                  : "hover:border-[#00B140]"}
              `}
              style={{ minHeight: "220px" }}
            >
              <div className={`w-full bg-gradient-to-r ${color} p-4 flex items-center justify-center`}>
                {icon}
              </div>
              <div className="p-6 text-center flex-1 flex flex-col justify-center">
                <h2 className="text-lg font-semibold text-white">{label}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Click to manage this catalog
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AISGBackground>
  );
};

export default CatalogSelector;