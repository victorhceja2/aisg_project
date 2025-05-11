import React, { useState } from 'react';
import CatalogServices from './CatalogServices';
import CatalogClassif from './CatalogClassif';
import CatalogStatus from './CatalogStatus';
import ExtraCompanyConfiguration from './ExtraCompanyConfiguration';
import ServicePerCustomer from './ServicePerCustomer';
import ExtraServiceSaleAssignment from './ExtraServiceSaleAssignment';

const CatalogScreens: React.FC = () => {
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
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Catálogos AISG</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={() => setSelected('services')} className={`px-4 py-2 rounded ${selected === 'services' ? 'bg-blue-600' : 'bg-gray-700'}`}>Servicios</button>
        <button onClick={() => setSelected('classification')} className={`px-4 py-2 rounded ${selected === 'classification' ? 'bg-blue-600' : 'bg-gray-700'}`}>Clasificación</button>
        <button onClick={() => setSelected('status')} className={`px-4 py-2 rounded ${selected === 'status' ? 'bg-blue-600' : 'bg-gray-700'}`}>Estatus</button>
        <button onClick={() => setSelected('company')} className={`px-4 py-2 rounded ${selected === 'company' ? 'bg-blue-600' : 'bg-gray-700'}`}>Configuración Compañía</button>
        <button onClick={() => setSelected('customer')} className={`px-4 py-2 rounded ${selected === 'customer' ? 'bg-blue-600' : 'bg-gray-700'}`}>Servicios por Cliente</button>
        <button onClick={() => setSelected('assignment')} className={`px-4 py-2 rounded ${selected === 'assignment' ? 'bg-blue-600' : 'bg-gray-700'}`}>Asignación Extra</button>
      </div>

      {renderCatalog()}
    </div>
  );
};

export default CatalogScreens;