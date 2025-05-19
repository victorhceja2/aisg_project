import React, { useState } from 'react';
import CatalogServices from './CatalogServices';
import ServicePerCustomer from './ServicePerCustomer';

/**
 * Componente principal para navegar entre los catálogos principales del sistema AISG.
 * Solo muestra los dos catálogos solicitados.
 */
const CatalogScreens: React.FC = () => {
  // Solo dos opciones: servicios y servicios por cliente
  const [selected, setSelected] = useState<string>('services');

  // Según la opción seleccionada, se muestra el componente correspondiente
  const renderCatalog = () => {
    switch (selected) {
      case 'services': return <CatalogServices />;
      case 'customer': return <ServicePerCustomer />;
      default: return <CatalogServices />;
    }
  };

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Título principal de la sección de catálogos */}
      <h1 className="text-2xl font-bold mb-4">Catálogos AISG</h1>

      {/* Botones para seleccionar el catálogo a mostrar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setSelected('services')}
          className={`px-4 py-2 rounded ${selected === 'services' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Services Catalog
        </button>
        <button
          onClick={() => setSelected('customer')}
          className={`px-4 py-2 rounded ${selected === 'customer' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Services per Customer
        </button>
      </div>

      {/* Aquí se muestra el catálogo seleccionado */}
      {renderCatalog()}
    </div>
  );
};

export default CatalogScreens;