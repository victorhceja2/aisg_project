import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditStatus: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [statusName, setStatusName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Estados para popups
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);
  const [duplicateStatusName, setDuplicateStatusName] = useState("");

  // Referencias para manejar el foco
  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

  // Referencia para el primer campo del formulario
  const statusNameInputRef = useRef<HTMLInputElement>(null);

  // Efecto para enfocar el primer campo DESPUÉS de que se carguen los datos
  useEffect(() => {
    if (!isFetching && statusNameInputRef.current) {
      setTimeout(() => {
        statusNameInputRef.current?.focus();
      }, 100);
    }
  }, [isFetching]);

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
          handleCloseSuccessPopup();
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

  // Cargar el usuario actual
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    sessionStorage.setItem("userName", user);
  }, []);

  // Obtener usuario actual con función mejorada
  const getCurrentUser = (): string => {
    const storageUser = localStorage.getItem("userName") ||
      sessionStorage.getItem("userName") ||
      localStorage.getItem("username") ||
      sessionStorage.getItem("username") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (storageUser) {
      return storageUser;
    }

    const token = localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const fromToken = payload.username || payload.userName || payload.name ||
            payload.sub || payload.email || payload.userId;

          if (fromToken) {
            sessionStorage.setItem("userName", fromToken);
            return fromToken;
          }
        }
      } catch (e) {
        // Error al procesar token
      }
    }

    const defaultUser = "admin";
    sessionStorage.setItem("userName", defaultUser);
    return defaultUser;
  };

  // Cargar datos del status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsFetching(true);
        const res = await axiosInstance.get(`/catalog/service-status/${id}`);
        setStatusName(res.data.status_name);
        setOriginalName(res.data.status_name);
      } catch (err) {
        setError("Could not load status data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, [id]);

  // Verificar si existe otro status con el mismo nombre
  const checkDuplicateStatus = async (name: string): Promise<boolean> => {
    try {
      const res = await axiosInstance.get(`/catalog/service-status`);
      return res.data.some((status: any) =>
        status.status_name.toLowerCase() === name.toLowerCase() &&
        status.id_service_status !== parseInt(id || "0")
      );
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusName.trim()) {
      setError("Status name is required");
      return;
    }

    if (isLoading) return; // Prevenir múltiples envíos

    // Si no se ha cambiado el nombre, no es necesario validar duplicados
    if (statusName.trim() !== originalName) {
      try {
        const isDuplicate = await checkDuplicateStatus(statusName);
        if (isDuplicate) {
          setDuplicateStatusName(statusName);
          setShowDuplicateWarningPopup(true);
          return;
        }
      } catch (error) {
        setError("Error checking for duplicate status");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");

      // Obtener el usuario actual para incluirlo en la actualización
      const whonew = currentUser || "admin";

      await axiosInstance.put(`/catalog/service-status/${id}`, {
        status_name: statusName.trim(),
        whonew: whonew
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Username': whonew
        }
      });

      setShowSuccessPopup(true);
    } catch (err: any) {
      let errorMessage = "Could not update status. Try again.";

      if (err.response) {
        errorMessage = err.response.data?.detail || `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate("/catalogs/status");
  };

  const closeDuplicateWarningPopup = () => {
    setShowDuplicateWarningPopup(false);
  };

  if (isFetching) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading status data...</p>
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
              Edit Service Status
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
                  Status Name
                </label>
                <input
                  ref={statusNameInputRef} // Asignamos la referencia al input
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  value={statusName}
                  onChange={e => setStatusName(e.target.value)}
                  placeholder="e.g. In Progress, Completed"
                  required
                  disabled={isLoading}
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
                  className={`w-1/2 ${isLoading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                >
                  {isLoading ? (
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
                <p className="text-white text-lg">Status has been successfully updated!</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={successOkButtonRef}
                  onClick={handleCloseSuccessPopup}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCloseSuccessPopup();
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

      {/* Popup de advertencia de estado duplicado */}
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
                <p className="text-white text-lg">A status with the name "{duplicateStatusName}" already exists!</p>
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

export default EditStatus;