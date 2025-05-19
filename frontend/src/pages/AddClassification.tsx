import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

/**
 * Componente para agregar una nueva clasificación de servicio.
 * Permite ingresar el nombre de la clasificación y guardarla en el backend.
 * Incluye validación, manejo de errores y navegación tras guardar o cancelar.
 */
const AddClassification: React.FC = () => {
  // Estado para el nombre de la clasificación
  const [name, setName] = useState("");
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);
  // URL base de la API (usa variable de entorno o localhost por defecto)
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario.
   * Valida el campo y realiza la petición POST al backend.
   */
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
      // Redirige al listado de clasificaciones tras guardar
      navigate("/catalogs/classif");
    } catch (err) {
      console.error("Error al agregar clasificación", err);
      setError("No se pudo agregar la clasificación.");
    }
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Add New Classification
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Classification name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/classif")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default AddClassification;