import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    id_service_status: 1,
    id_service_classification: 1,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL || "http://82.165.213.124:8000";
  const navigate = useNavigate();

  // Colores AISG según el manual de identidad corporativa
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    lightBg: "#F5F5F7",
    textDark: "#222222",
    textLight: "#FFFFFF",
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`${apiURL}/catalog/services/${id}`);
        if (res.data) {
          setForm(res.data);
        } else {
          setError("No se encontraron datos para este servicio.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching service", err);
        setError("Error al cargar el servicio.");
        setLoading(false);
      }
    };
    fetchService();
  }, [id, apiURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${apiURL}/catalog/services/${id}`, form);
      navigate("/services");
    } catch (err) {
      console.error("Error updating service", err);
      setError("No se pudo actualizar el servicio.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1A2E] text-white font-['Montserrat']">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
          <p className="text-lg">Cargando datos del servicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-12 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6">
            <h1 className="text-2xl font-bold text-center text-white">
              Editar Servicio
            </h1>
            <p className="text-gray-200 mt-2 font-light text-center">
              Modifica los datos del servicio seleccionado
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Código:
                </label>
                <input
                  type="text"
                  value={form.service_code}
                  onChange={(e) =>
                    setForm({ ...form, service_code: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nombre:
                </label>
                <input
                  type="text"
                  value={form.service_name}
                  onChange={(e) =>
                    setForm({ ...form, service_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Descripción:
                </label>
                <textarea
                  value={form.service_description}
                  onChange={(e) =>
                    setForm({ ...form, service_description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditService;