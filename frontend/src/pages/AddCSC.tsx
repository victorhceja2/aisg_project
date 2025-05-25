import React, { useState, useRef, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const AddCSC: React.FC = () => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para los popups
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);
  
  const navigate = useNavigate();

  // Referencias para manejar el foco
  const categoryNameInputRef = useRef<HTMLInputElement>(null);
  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

  // Efecto para enfocar el input al cargar el formulario
  useEffect(() => {
    if (categoryNameInputRef.current) {
      categoryNameInputRef.current.focus();
    }
  }, []);

  // Efecto para enfocar el botón OK del popup de éxito
  useEffect(() => {
    if (showSuccessPopup && successOkButtonRef.current) {
      setTimeout(() => {
        successOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showSuccessPopup]);

  // Efecto para enfocar el botón OK del popup de advertencia
  useEffect(() => {
    if (showDuplicateWarningPopup && duplicateOkButtonRef.current) {
      setTimeout(() => {
        duplicateOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDuplicateWarningPopup]);

  /**
   * Verifica si una categoría con el mismo nombre ya existe
   */
  const checkDuplicateCategory = async (name: string) => {
    try {
      const res = await axiosInstance.get(`/catalog/service-categories`);
      return res.data.some((cat: any) => 
        cat.service_category_name.toLowerCase() === name.toLowerCase()
      );
    } catch (err) {
      console.error("Error checking for duplicate category", err);
      return false; // En caso de error, asumimos que no es duplicado
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!categoryName.trim()) {
      setError("Category name is required.");
      setLoading(false);
      return;
    }

    try {
      // Verificar si la categoría ya existe
      const isDuplicate = await checkDuplicateCategory(categoryName);
      if (isDuplicate) {
        // Mostrar el popup de advertencia
        setShowDuplicateWarningPopup(true);
        setLoading(false);
        return;
      }

      // Obtenemos el nombre de usuario actual desde localStorage y luego de sessionStorage
      let currentUser = localStorage.getItem("userName");
      
      // Si no existe en localStorage, intentamos con sessionStorage
      if (!currentUser) {
        currentUser = sessionStorage.getItem("userName");
      }
      
      // Si aún no hay nombre, usamos un valor por defecto
      if (!currentUser) {
        currentUser = "system";
      }
      
      console.log("Current user creating record:", currentUser);
      
      const response = await axiosInstance.post(`/catalog/service-categories`, {
        service_category_name: categoryName,
        whonew: currentUser  // Usar el usuario actual
      });
      
      console.log("Create response:", response.data);
      
      // Mostrar popup de éxito en lugar de redirigir inmediatamente
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error("Error creating category:", err);
      setError(err.response?.data?.message || "Could not add the service category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra el popup y navega al listado de categorías
   */
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate("/catalogs/servicecategory");
  };

  /**
   * Cierra el popup de advertencia
   */
  const closeDuplicateWarningPopup = () => {
    setShowDuplicateWarningPopup(false);
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Add Service Category
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
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  placeholder="Enter service category name"
                  required
                  ref={categoryNameInputRef}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/servicecategory")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-1/2 ${
                    loading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                >
                  {loading ? (
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

      {/* Popup de éxito */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Success
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-center mb-4 justify-center">
                <div className="bg-[#00B140] rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white text-lg">Service category has been successfully created!</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={successOkButtonRef}
                  onClick={handleClosePopup}
                  className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup de advertencia de categoría duplicada */}
      {showDuplicateWarningPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Warning
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-center mb-4 justify-center">
                <div className="bg-[#f59e0b] rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white text-lg">A category with the name "{categoryName}" already exists!</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={duplicateOkButtonRef}
                  onClick={closeDuplicateWarningPopup}
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AISGBackground>
  );
};

export default AddCSC;