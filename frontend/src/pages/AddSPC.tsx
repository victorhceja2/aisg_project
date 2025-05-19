import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddServiceType: React.FC = () => {
  const [name, setName] = useState("");
  const [whonew, setWhonew] = useState("system");
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${apiURL}/catalog/service-types`, { name, whonew });
      navigate("/catalogs/servicetype");
    } catch (err) {
      setError("No se pudo agregar el tipo de servicio.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center font-['Montserrat']">
      <form
        onSubmit={handleSubmit}
        className="bg-[#16213E] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Agregar Tipo de Servicio</h2>
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
        )}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Nombre</label>
          <input
            className="w-full px-3 py-2 rounded bg-[#1E2A45] text-white border border-gray-700"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded transition-all"
        >
          Guardar
        </button>
      </form>
    </div>
  );
};

export default AddServiceType;