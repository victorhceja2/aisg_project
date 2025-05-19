import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditServiceType: React.FC = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [whonew, setWhonew] = useState("system");
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiURL}/catalog/service-types`);
        const found = res.data.find((t: any) => t.id_service_type === Number(id));
        if (found) setName(found.service_type_name);
      } catch {
        setError("No se pudo cargar el tipo de servicio.");
      }
    };
    fetchData();
  }, [id, apiURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.put(`${apiURL}/catalog/service-types/${id}`, { name, whonew });
      navigate("/catalogs/servicetype");
    } catch {
      setError("No se pudo actualizar el tipo de servicio.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center font-['Montserrat']">
      <form
        onSubmit={handleSubmit}
        className="bg-[#16213E] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Editar Tipo de Servicio</h2>
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
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditServiceType;