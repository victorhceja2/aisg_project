import React from 'react';

const Menu = () => {
  return (
    <aside className="w-64 bg-gray-100 p-4 shadow-md">
      <h1 className="text-2xl font-bold mb-6">AISG</h1>
      <nav className="space-y-4">
        <a href="#" className="block text-blue-600 hover:underline">Dashboard</a>
        <a href="#" className="block text-gray-700 hover:underline">Mantenimiento</a>
        <a href="#" className="block text-gray-700 hover:underline">Reportes</a>
      </nav>
    </aside>
  );
};

export default Menu;