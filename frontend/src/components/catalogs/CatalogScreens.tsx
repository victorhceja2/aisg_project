import React, { useState } from 'react';
import CatalogServices from './CatalogServices';
import ServicePerCustomer from './ServicePerCustomer';
import AISGBackground from './fondo';

const CatalogScreens: React.FC = () => {
  const [selected, setSelected] = useState<string>('services');

  const renderCatalog = () => {
    switch (selected) {
      case 'services': 
        return <CatalogServices />;
      case 'customer': 
        return <ServicePerCustomer />;
      default: 
        return <CatalogServices />;
    }
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Main Catalogs</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the main catalogs of the system
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
            <button
              onClick={() => setSelected('services')}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center ${
                selected === 'services'
                  ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white'
                  : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
              }`}
              type="button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Services Catalog
            </button>
            
            <button
              onClick={() => setSelected('customer')}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center ${
                selected === 'customer'
                  ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white'
                  : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
              }`}
              type="button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
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