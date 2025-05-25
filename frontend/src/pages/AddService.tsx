import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const AddService: React.FC = () => {
  const [form, setForm] = useState({
    id_service_status: 0, // Cambiado a 0 para indicar que no hay selección
    id_service_classification: 0,
    id_service_category: 0,
    id_service_type: 0,
    id_service_include: 0,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false,
  });

  // Estado para errores de validación específicos
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Validación para habilitar el botón de envío
  const isFormValid = () => {
    return form.id_service_status > 0 &&
      form.id_service_classification > 0 &&
      form.id_service_category > 0 &&
      form.id_service_type > 0 &&
      form.id_service_include > 0 &&
      form.service_code.trim() !== "" &&
      form.service_name.trim() !== "" &&
      form.service_description.trim() !== "";
  };

  // Función para validar campos individuales
  const validateField = (fieldName: string, value: any) => {
    const errors = { ...validationErrors };

    switch (fieldName) {
      case 'id_service_status':
        if (value <= 0) {
          errors[fieldName] = 'Status is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_service_classification':
        if (value <= 0) {
          errors[fieldName] = 'Classification is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_service_category':
        if (value <= 0) {
          errors[fieldName] = 'Category is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_service_type':
        if (value <= 0) {
          errors[fieldName] = 'Type is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_service_include':
        if (value <= 0) {
          errors[fieldName] = 'Include option is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'service_code':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'Service code is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'service_name':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'Service name is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'service_description':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'Service description is required';
        } else {
          delete errors[fieldName];
        }
        break;
    }

    setValidationErrors(errors);
  };

  // Función para validar todos los campos
  const validateAllFields = () => {
    const errors: { [key: string]: string } = {};

    if (form.id_service_status <= 0) {
      errors.id_service_status = 'Status is required';
    }
    if (form.id_service_classification <= 0) {
      errors.id_service_classification = 'Classification is required';
    }
    if (form.id_service_category <= 0) {
      errors.id_service_category = 'Category is required';
    }
    if (form.id_service_type <= 0) {
      errors.id_service_type = 'Type is required';
    }
    if (form.id_service_include <= 0) {
      errors.id_service_include = 'Include option is required';
    }
    if (!form.service_code.trim()) {
      errors.service_code = 'Service code is required';
    }
    if (!form.service_name.trim()) {
      errors.service_name = 'Service name is required';
    }
    if (!form.service_description.trim()) {
      errors.service_description = 'Service description is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Estados para los catálogos
  const [statuses, setStatuses] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [includes, setIncludes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para los popups
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);

  // Referencias para manejar el foco
  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);
  // Referencia para el primer campo del formulario (Status ID)
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  // Efecto para enfocar el primer campo al cargar el formulario
  useEffect(() => {
    if (!loading && statusSelectRef.current) {
      setTimeout(() => {
        statusSelectRef.current?.focus();
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
      setLoading(false);
    } catch (err) {
      console.error("Error loading catalogs:", err);
      setError("Error loading catalog data. Please refresh the page.");
      setLoading(false);
    }
  };

  // Cargar los catálogos cuando se monte el componente
  useEffect(() => {
    fetchCatalogs();
  }, []);

  /**
   * Verifica si un servicio duplicado ya existe
   */
  const checkDuplicateService = async () => {
    try {
      const res = await axiosInstance.get(`/catalog/services/?search=${encodeURIComponent(form.service_code)}`);
      return res.data.some((service: any) =>
        service.service_code === form.service_code ||
        service.service_name.toLowerCase() === form.service_name.toLowerCase()
      );
    } catch (err) {
      console.error("Error checking for duplicate service", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos antes de continuar
    if (!validateAllFields()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Verificar si el servicio ya existe
      const isDuplicate = await checkDuplicateService();
      if (isDuplicate) {
        setShowDuplicateWarningPopup(true);
        setSubmitting(false);
        return;
      }

      // Obtener el usuario desde sessionStorage para enviarlo en el payload
      const whonew = sessionStorage.getItem("userName") || "admin";

      const payload = {
        ...form,
        service_aircraft_type: form.service_aircraft_type ? 2 : 1,
        service_by_time: form.service_by_time ? 2 : 1,
        min_time_configured: form.min_time_configured ? 2 : 1,
        service_technicians_included: form.service_technicians_included ? 2 : 1,
        whonew, // Se agrega aquí automáticamente
      };

      await axiosInstance.post(`/catalog/services/`, payload);

      // Mostrar popup de éxito en lugar de redirigir inmediatamente
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error("Error creating service:", err);
      if (err.response) {
        if (err.response.data && err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            const errorMessages = err.response.data.detail
              .map((detail: any) => `${detail.loc.join(" -> ")}: ${detail.msg}`)
              .join("; ");
            setError(`Validation errors: ${errorMessages}`);
          } else {
            setError(`Error: ${err.response.data.detail}`);
          }
        } else {
          setError(`Error ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError("No se recibió respuesta del servidor");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Cierra el popup y navega al listado de servicios
   */
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate("/services");
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
            <p className="text-lg">Loading catalog data...</p>
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
              Add New Service
            </h1>
            <div className="mt-2 w-32 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Status ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_status}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setForm({ ...form, id_service_status: value });
                        validateField('id_service_status', value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_service_status 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                      } focus:ring-2 focus:outline-none transition-all appearance-none`}
                      required
                      ref={statusSelectRef}
                    >
                      <option value={0} disabled>Select a status...</option>
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
                  {validationErrors.id_service_status && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_service_status}</p>
                  )}
                </div>

                {/* Classification ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Classification ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_classification}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setForm({ ...form, id_service_classification: value });
                        validateField('id_service_classification', value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_service_classification 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                      } focus:ring-2 focus:outline-none transition-all appearance-none`}
                      required
                    >
                      <option value={0} disabled>Select a classification...</option>
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
                  {validationErrors.id_service_classification && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_service_classification}</p>
                  )}
                </div>

                {/* Category ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Category ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_category}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setForm({ ...form, id_service_category: value });
                        validateField('id_service_category', value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_service_category 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                      } focus:ring-2 focus:outline-none transition-all appearance-none`}
                      required
                    >
                      <option value={0} disabled>Select a category...</option>
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
                  {validationErrors.id_service_category && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_service_category}</p>
                  )}
                </div>

                {/* Type ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Type ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_type}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setForm({ ...form, id_service_type: value });
                        validateField('id_service_type', value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_service_type 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                      } focus:ring-2 focus:outline-none transition-all appearance-none`}
                      required
                    >
                      <option value={0} disabled>Select a type...</option>
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
                  {validationErrors.id_service_type && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_service_type}</p>
                  )}
                </div>

                {/* Include ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Include ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_include}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setForm({ ...form, id_service_include: value });
                        validateField('id_service_include', value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_service_include 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                      } focus:ring-2 focus:outline-none transition-all appearance-none`}
                      required
                    >
                      <option value={0} disabled>Select an include option...</option>
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
                  {validationErrors.id_service_include && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_service_include}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.service_code}
                    onChange={e => {
                      const value = e.target.value;
                      setForm({ ...form, service_code: value });
                      validateField('service_code', value);
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                      validationErrors.service_code 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                    } focus:ring-2 focus:outline-none transition-all`}
                    required
                    placeholder="Enter service code"
                  />
                  {validationErrors.service_code && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.service_code}</p>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.service_name}
                    onChange={e => {
                      const value = e.target.value;
                      setForm({ ...form, service_name: value });
                      validateField('service_name', value);
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                      validationErrors.service_name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                    } focus:ring-2 focus:outline-none transition-all`}
                    required
                    placeholder="Enter service name"
                  />
                  {validationErrors.service_name && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.service_name}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.service_description}
                  onChange={e => {
                    const value = e.target.value;
                    setForm({ ...form, service_description: value });
                    validateField('service_description', value);
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                    validationErrors.service_description 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-[#cccccc] focus:border-[#0033A0] focus:ring-[#0033A0]'
                  } focus:ring-2 focus:outline-none transition-all`}
                  rows={4}
                  required
                  placeholder="Enter service description"
                />
                {validationErrors.service_description && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.service_description}</p>
                )}
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
                  className={`w-1/2 ${submitting ? "bg-gray-500" : "bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935]"
                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                  disabled={submitting}
                >
                  {submitting ? (
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
                <p className="text-white text-lg">Service has been successfully created!</p>
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

      {/* Popup de advertencia de servicio duplicado */}
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
                <p className="text-white text-lg">A service with the code "{form.service_code}" or name "{form.service_name}" already exists!</p>
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

export default AddService;