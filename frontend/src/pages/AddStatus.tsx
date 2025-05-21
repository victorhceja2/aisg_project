import React, { useState, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const AddStatus: React.FC = () => {
  const navigate = useNavigate();
  const [statusName, setStatusName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Verificar el usuario almacenado al cargar el componente
  useEffect(() => {
    const storedUser = sessionStorage.getItem("userName");
    console.log("Usuario en sessionStorage:", storedUser);
    
    // Si no hay usuario en sessionStorage, intentar establecer uno por defecto
    if (!storedUser) {
      console.log("No se encontró usuario en sessionStorage, estableciendo valor predeterminado");
      sessionStorage.setItem("userName", "admin");
      setCurrentUser("admin");
    } else {
      setCurrentUser(storedUser);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) {
      setError("Status name is required");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      
      // Asegurar que siempre haya un usuario, incluso si sessionStorage falla
      const whonew = sessionStorage.getItem("userName") || "admin";
      console.log("Usuario obtenido para el registro:", whonew);
      
      // Asegurarnos de que el nombre del campo coincida EXACTAMENTE con lo que espera el backend
      const data = {
        status_name: statusName.trim(),
        whonew: whonew  // Asegúrate de que este campo se llame exactamente igual que en el backend
      };
      
      console.log("Datos que se enviarán al backend:", JSON.stringify(data));
      
      const response = await axiosInstance.post(`/catalog/service-status/`, data, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta del servidor completa:", response);
      console.log("Estructura de la respuesta:", Object.keys(response.data || {}));
      console.log("Contenido completo de response.data:", response.data);
      
      // Verificar si la respuesta incluye el usuario (para depuración)
      if (response.data && response.data.whonew) {
        console.log("Usuario guardado:", response.data.whonew);
      } else {
        console.warn("La respuesta no incluye el campo whonew");
        console.warn("Campos disponibles en response.data:", Object.keys(response.data || {}));
      }
      
      navigate("/catalogs/status");
    } catch (err: any) {
      console.error("Error creating status:", err);
      
      let errorMessage = "Could not create status. Try again.";
      
      if (err.response) {
        console.error("Respuesta de error:", err.response.status, err.response.data);
        errorMessage = err.response.data?.detail || `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        console.error("No se recibió respuesta del servidor");
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Add Service Status
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}
            {currentUser && (
              <div className="mb-4 text-gray-300 text-sm">
                <p>Logged in as: {currentUser}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Status Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  value={statusName}
                  onChange={e => setStatusName(e.target.value)}
                  placeholder="e.g. In Progress, Completed"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/status")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-1/2 ${
                    isLoading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default AddStatus;