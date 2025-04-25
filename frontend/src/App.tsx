import React from 'react';
import Menu from './components/Menu';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Menu />
      <div className="flex-1 p-6">
        <Dashboard />
      </div>
    </div>
  );
}