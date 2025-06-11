import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditClassification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState(""); // Guardamos el nombre original
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // Estado separado para el envío
  const [error, setError] = useState<string | null>(null);
  
  // Estado para mostrar el popup de éxito
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // Estado para mostrar el popup de advertencia de duplicado
  const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);
  
  const navigate = useNavigate();

  // Referencias para manejar el foco
  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

  // Referencia para el primer campo del formulario (Classification Name input)
  const classificationNameInputRef = useRef<HTMLInputElement>(null);

  // Efecto para enfocar el primer campo DESPUÉS de que se carguen los datos
  useEffect(() => {
    if (!loading && classificationNameInputRef.current) {
      setTimeout(() => {
        classificationNameInputRef.current?.focus();
      }, 100);
    }
  }, [loading]);

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

  // Efecto para manejar Enter en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showSuccessPopup) {
          e.preventDefault();
          handleClosePopup();
        } else if (showDuplicateWarningPopup) {
          e.preventDefault();
          closeDuplicateWarningPopup();
        }
      }
    };

    if (showSuccessPopup || showDuplicateWarningPopup) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showSuccessPopup, showDuplicateWarningPopup]);

  useEffect(() => {
    const fetchClassification = async () => {
      try {
        const res = await axiosInstance.get(`/catalog/service-classification/${id}`);
        if (res.data && res.data.service_classification_name) {
          setName(res.data.service_classification_name);
          setOriginalName(res.data.service_classification_name); // Guardamos el nombre original
          setError(null);
        } else {
          setError("No data found for this classification.");
        }
      } catch (err) {
        setError("Error loading classification.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchClassification();
    } else {
      setError("No classification ID provided.");
      setLoading(false);
    }
  }, [id]);

  /**
   * Verifica si una clasificación con el mismo nombre ya existe
   */
  const checkDuplicateClassification = async (name: string) => {
    try {
      const res = await axiosInstance.get(`/catalog/service-classification/?search=${encodeURIComponent(name)}`);
      // Si hay resultados, verificamos si alguno coincide exactamente con el nombre
      // pero ignoramos el elemento actual que estamos editando
      return res.data.some((item: any) => 
        item.service_classification_name.toLowerCase() === name.toLowerCase() && 
        item.id_service_classification.toString() !== id
      );
    } catch (err) {
      console.error("Error checking for duplicate classification", err);
      return false; // En caso de error, asumimos que no es duplicado
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Classification name is required.");
      setSubmitLoading(false);
      return;
    }

    try {
      // Solo realizar la verificación de duplicados si el nombre ha cambiado
      if (name.toLowerCase() !== originalName.toLowerCase()) {
        // Verificar si el nombre ya existe
        const isDuplicate = await checkDuplicateClassification(name);
        if (isDuplicate) {
          // Mostrar el popup de advertencia
          setShowDuplicateWarningPopup(true);
          setSubmitLoading(false);
          return;
        }
      }

      // Obtener el usuario que está actualizando
      let currentUser = sessionStorage.getItem("userName");
      if (!currentUser || currentUser === "undefined") {
        currentUser = "admin";
      }

      console.log("Current user updating record:", currentUser);

      // SIEMPRE enviar la actualización para registrar quién modificó
      const payload = {
        service_classification_name: name,
        whonew: currentUser  // Usuario actual que realiza la actualización
      };

      console.log("Sending update payload:", payload);

      const response = await axiosInstance.put(`/catalog/service-classification/${id}`, payload);

      console.log("Update response:", response.data);

      // Mostrar popup de éxito en lugar de redirigir inmediatamente
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Error updating classification:", err);
      setError("Could not update the classification. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Cierra el popup y navega al listado de clasificaciones
   */
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate("/catalogs/classif");
  };

  /**
   * Cierra el popup de advertencia
   */
  const closeDuplicateWarningPopup = () => {
    setShowDuplicateWarningPopup(false);
  };

  if (loading) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading classification data...</p>
          </div>
        </div>
      </AISGBackground>
    );
  }

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Edit Classification
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
                  Classification Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                  ref={classificationNameInputRef} // Asignamos la referencia al input
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/classif")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`w-1/2 ${submitLoading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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
                <p className="text-white text-lg">Classification has been successfully updated!</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={successOkButtonRef}
                  onClick={handleClosePopup}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleClosePopup();
                    }
                  }}
                  className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup de advertencia de clasificación duplicada */}
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
                <p className="text-white text-lg">A classification with the name "{name}" already exists!</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={duplicateOkButtonRef}
                  onClick={closeDuplicateWarningPopup}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeDuplicateWarningPopup();
                    }
                  }}
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

export default EditClassification;