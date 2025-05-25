import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    id_service_status: 1,
    id_service_classification: 1,
    id_service_category: 1,
    id_service_type: 1,
    id_service_include: 1,
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
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para los popups
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  
  const navigate = useNavigate();

  // Estados para los catálogos
  const [statuses, setStatuses] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [includes, setIncludes] = useState<any[]>([]);

  // Referencias para manejar el foco
  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const errorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Referencia para el primer campo del formulario
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  // Efecto para enfocar el primer campo DESPUÉS de que se carguen los datos
  useEffect(() => {
    if (!loading && firstFieldRef.current) {
      setTimeout(() => {
        firstFieldRef.current?.focus();
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

  // Efecto para enfocar el botón OK del popup de error
  useEffect(() => {
    if (showErrorPopup && errorOkButtonRef.current) {
      setTimeout(() => {
        errorOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showErrorPopup]);

  // Efecto para manejar Enter en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showSuccessPopup) {
          e.preventDefault();
          handleCloseSuccessPopup();
        } else if (showErrorPopup) {
          e.preventDefault();
          closeErrorPopup();
        }
      }
    };

    if (showSuccessPopup || showErrorPopup) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showSuccessPopup, showErrorPopup]);

  // Función para cargar los catálogos
  const fetchCatalogs = async () => {
    try {
      const [statusesRes, classificationsRes, categoriesRes, typesRes, includesRes] = await Promise.all([
        axiosInstance.get('/catalog/service-status'),
        axiosInstance.get('/catalog/service-classification'),
        axiosInstance.get('/catalog/service-categories'),
        axiosInstance.get('/catalog/service-types'),
        axiosInstance.get('/catalog/service-includes')
      ]);

      setStatuses(statusesRes.data);
      setClassifications(classificationsRes.data);
      setCategories(categoriesRes.data);
      setTypes(typesRes.data);
      setIncludes(includesRes.data);
      
    } catch (err) {
      console.error("Error loading catalogs:", err);
      setError("Error loading catalog data. Please refresh the page.");
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axiosInstance.get(`/catalog/services/${id}`);
        if (res.data) {
          // Convertir los valores enteros a booleanos
          const formattedData = {
            ...res.data,
            service_aircraft_type: res.data.service_aircraft_type === 2,
            service_by_time: res.data.service_by_time === 2,
            min_time_configured: res.data.min_time_configured === 2,
            service_technicians_included: res.data.service_technicians_included === 2
          };
          setForm(formattedData);
        } else {
          setError("No data found for this service.");
        }
      } catch (err) {
        console.error("Error loading service:", err);
        setError("Error loading the service.");
      } finally {
        setLoading(false);
      }
    };
    
    // Cargar el servicio y los catálogos
    Promise.all([fetchService(), fetchCatalogs()]);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return; // Prevenir múltiples envíos
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Convertir los valores booleanos a enteros antes de enviar
      const dataToSend = {
        ...form,
        service_aircraft_type: form.service_aircraft_type ? 2 : 1,
        service_by_time: form.service_by_time ? 2 : 1,
        min_time_configured: form.min_time_configured ? 2 : 1,
        service_technicians_included: form.service_technicians_included ? 2 : 1,
        whonew: sessionStorage.getItem("userName") || "system"
      };
      
      await axiosInstance.put(`/catalog/services/${id}`, dataToSend);
      
      // Mostrar popup de éxito en lugar de navegar inmediatamente
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error("Error updating service:", err);
      const errorMessage = err.response?.data?.detail || "Could not update the service.";
      setError(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Cierra el popup de éxito y navega al listado
   */
  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate("/services");
  };

  /**
   * Cierra el popup de error
   */
  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setError(null);
  };

  if (loading) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading service data...</p>
          </div>
        </div>
      </AISGBackground>
    );
  }

  return (
    <AISGBackground>
      <div className="max-w-3xl mx-auto p-6 font-['Montserrat']">
        <div className="w-full">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Edit Service
            </h1>
            <div className="mt-2 w-32 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && !showErrorPopup && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Status ID
                  </label>
                  <div className="relative">
                    <select
                      ref={firstFieldRef} // Asignamos la referencia al primer campo
                      value={form.id_service_status}
                      onChange={(e) =>
                        setForm({ ...form, id_service_status: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                      disabled={submitting}
                    >
                      {statuses.map(status => (
                        <option key={status.id_service_status} value={status.id_service_status}>
                          {status.status_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Classification ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Classification ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_classification}
                      onChange={(e) =>
                        setForm({ ...form, id_service_classification: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                      disabled={submitting}
                    >
                      {classifications.map(classification => (
                        <option key={classification.id_service_classification} value={classification.id_service_classification}>
                          {classification.service_classification_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Category ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Category ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_category}
                      onChange={(e) =>
                        setForm({ ...form, id_service_category: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                      disabled={submitting}
                    >
                      {categories.map(category => (
                        <option key={category.id_service_category} value={category.id_service_category}>
                          {category.service_category_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Type ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Type ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_type}
                      onChange={(e) =>
                        setForm({ ...form, id_service_type: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                      disabled={submitting}
                    >
                      {types.map(type => (
                        <option key={type.id_service_type} value={type.id_service_type}>
                          {type.service_type_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Include ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Include ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_include}
                      onChange={(e) =>
                        setForm({ ...form, id_service_include: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                      disabled={submitting}
                    >
                      {includes.map(include => (
                        <option key={include.id_service_include} value={include.id_service_include}>
                          {include.service_include}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={form.service_code}
                    onChange={(e) =>
                      setForm({ ...form, service_code: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.service_name}
                    onChange={(e) =>
                      setForm({ ...form, service_name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={form.service_description}
                  onChange={(e) =>
                    setForm({ ...form, service_description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  rows={4}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aircraft_type"
                    checked={form.service_aircraft_type}
                    onChange={(e) =>
                      setForm({ ...form, service_aircraft_type: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                    disabled={submitting}
                  />
                  <label htmlFor="aircraft_type" className="ml-2 text-white">
                    Aircraft Type
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="by_time"
                    checked={form.service_by_time}
                    onChange={(e) =>
                      setForm({ ...form, service_by_time: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                    disabled={submitting}
                  />
                  <label htmlFor="by_time" className="ml-2 text-white">
                    By Time
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="min_time"
                    checked={form.min_time_configured}
                    onChange={(e) =>
                      setForm({ ...form, min_time_configured: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                    disabled={submitting}
                  />
                  <label htmlFor="min_time" className="ml-2 text-white">
                    Min Time Configured
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="technicians"
                    checked={form.service_technicians_included}
                    onChange={(e) =>
                      setForm({ ...form, service_technicians_included: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                    disabled={submitting}
                  />
                  <label htmlFor="technicians" className="ml-2 text-white">
                    Technicians Included
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 ${submitting ? "bg-gray-500" : "bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935]"} text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                  disabled={submitting}
                >
                  {submitting ? (
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
                <p className="text-white text-lg">Service has been successfully updated!</p>
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

      {/* Popup de error */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Error
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-center mb-4 justify-center">
                <div className="bg-[#dc2626] rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-white text-lg">{error}</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={errorOkButtonRef}
                  onClick={closeErrorPopup}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeErrorPopup();
                    }
                  }}
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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

export default EditService;