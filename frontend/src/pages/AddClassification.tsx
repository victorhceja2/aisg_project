import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddClassification: React.FC = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("El nombre de la clasificación es obligatorio.");
      return;
    }
    
    try {
      await axios.post(`${apiURL}/catalog/service-classification/`, {
        service_classification_name: name
      });
      navigate("/catalogs/classif");
    } catch (err) {
      console.error("Error al agregar clasificación", err);
      setError("No se pudo agregar la clasificación.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-12 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
      <div className="max-w-md mx-auto">
        <div className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6">
            <h1 className="text-2xl font-bold text-center text-white">
              Agregar Nueva Clasificación
            </h1>
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
                  Nombre:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/classif")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClassification;