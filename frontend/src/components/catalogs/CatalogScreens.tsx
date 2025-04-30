// React-based placeholder UI for AISG catalog modules
// Professional layout, dummy data, no backend connection yet

import React from 'react';

const dummyData = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `Descripción del elemento ${i + 1}`,
  status: i % 2 === 0 ? 'Activo' : 'Inactivo'
}));

const CatalogScreens: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Catálogos AISG</h1>

      <div className="space-y-8">
        {/* Catálogo de Servicios */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Catálogo de Servicios</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-700">
                  <td className="py-2">{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clasificación de Servicios */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Clasificación de Servicios</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>ID</th>
                <th>Nombre</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-700">
                  <td className="py-2">{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estatus de Servicios */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Estatus de Servicios</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>ID</th>
                <th>Nombre</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-700">
                  <td className="py-2">{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CatalogScreens;