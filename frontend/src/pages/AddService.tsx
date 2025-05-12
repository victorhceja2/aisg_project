import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Componente para agregar un nuevo servicio al catálogo.
 * Permite ingresar código, nombre, descripción y banderas de configuración.
 * Realiza validación, muestra errores y navega tras guardar o cancelar.
 */
const AddService: React.FC = () => {
  // Estado del formulario con campos y banderas
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

  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);

  // URL base de la API (usa variable de entorno)
  const apiURL = import.meta.env.VITE_API_URL;

  // Hook para navegación programática
  const navigate = useNavigate();

  // Paleta de colores corporativos AISG
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

  /**
   * Maneja el envío del formulario.
   * Realiza la petición POST al backend y navega tras guardar.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${apiURL}/catalog/services/`, form);
      navigate("/services");
    } catch (err) {
      console.error("Error adding service", err);
      setError("No se pudo agregar el servicio.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-12 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6">
            <h1 className="text-2xl font-bold text-center text-white">
              Agregar Nuevo Servicio
            </h1>
            <p className="text-gray-200 mt-2 font-light text-center">
              Ingresa los datos para registrar un nuevo servicio en el catálogo
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
              {/* Campo: Código */}
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

              {/* Campo: Nombre */}
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

              {/* Campo: Descripción */}
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

              {/* Botones de acción */}
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
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddService;