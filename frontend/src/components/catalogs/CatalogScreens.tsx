import React, { useState } from 'react';
import CatalogServices from './CatalogServices';
import ServicePerCustomer from './ServicePerCustomer';
import AISGBackground from './fondo';

const CatalogScreens: React.FC = () => {
  const [selected, setSelected] = useState<string>('services');

  const renderCatalog = () => {
    switch (selected) {
      case 'services': return <CatalogServices />;
      case 'customer': return <ServicePerCustomer />;
      default: return <CatalogServices />;
    }
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Main Catalogs</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the main catalogs of the system
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
            <button
              onClick={() => setSelected('services')}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center ${
                selected === 'services'
                  ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white'
                  : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
              }`}
            >
              Services Catalog
            </button>
            <button
              onClick={() => setSelected('customer')}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center ${
                selected === 'customer'
                  ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white'
                  : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
              }`}
            >
              Services per Customer
            </button>
          </div>
          <div className="mt-6">
            {renderCatalog()}
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default CatalogScreens;