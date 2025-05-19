import React, { useState } from 'react';
import CatalogServices from './CatalogServices';
import CatalogClassif from './CatalogClassif';
import CatalogStatus from './CatalogStatus';
import ExtraCompanyConfiguration from './ExtraCompanyConfiguration';
import ServicePerCustomer from './ServicePerCustomer';
import ExtraServiceSaleAssignment from './ExtraServiceSaleAssignment';
import AISGBackground from './fondo';

/**
 * Main component to navigate between AISG configuration catalogs.
 * Visual, in English, only.
 */
const ConfigsScreens: React.FC = () => {
  const [selected, setSelected] = useState<string>('services');

  const renderCatalog = () => {
    switch (selected) {
      case 'services': return <CatalogServices />;
      case 'classification': return <CatalogClassif />;
      case 'status': return <CatalogStatus />;
      case 'company': return <ExtraCompanyConfiguration />;
      case 'customer': return <ServicePerCustomer />;
      case 'assignment': return <ExtraServiceSaleAssignment />;
      default: return <CatalogServices />;
    }
  };

  return (
    <AISGBackground>
      <div className="min-h-screen p-6 space-y-6 text-white font-['Montserrat']">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
            <h1 className="text-3xl font-bold text-white text-center">AISG Configuration Catalogs</h1>
            <p className="text-gray-200 mt-2 font-light text-center">Manage and configure system catalogs</p>
          </div>
          
          <div className="bg-transparent rounded-b-lg shadow-lg p-6">
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              <button
                onClick={() => setSelected('services')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                  selected === 'services' 
                    ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white' 
                    : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setSelected('classification')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                  selected === 'classification' 
                    ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white' 
                    : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
                }`}
              >
                Classification
              </button>
              <button
                onClick={() => setSelected('status')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                  selected === 'status' 
                    ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white' 
                    : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setSelected('company')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                  selected === 'company' 
                    ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white' 
                    : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
                }`}
              >
                Company Configuration
              </button>
              <button
                onClick={() => setSelected('customer')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                  selected === 'customer' 
                    ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white' 
                    : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
                }`}
              >
                Services by Customer
              </button>
              <button
                onClick={() => setSelected('assignment')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                  selected === 'assignment' 
                    ? 'bg-gradient-to-r from-[#0033A0] to-[#00B140] text-white' 
                    : 'bg-[#1E2A45] text-white hover:bg-[#2A395A]'
                }`}
              >
                Extra Assignment
              </button>
            </div>
            <div className="mt-6">
              {renderCatalog()}
            </div>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default ConfigsScreens;