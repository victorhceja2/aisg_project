import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

// Interface para los clientes
interface Client {
  llave: number;
  nombre: string;
  razonSocial: string;
}

// Interface para los servicios
interface Service {
  id_service: number;
  service_name: string;
  service_code: string;
}

// Interface para las compañías
interface Company {
  companyCode: string;
  companyName: string;
}

const AddSPConsumer: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado para almacenar la lista de clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  
  // Estado para almacenar la lista de servicios
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Estado para almacenar la lista de compañías
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Estados para errores de validación específicos
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    company: "",
    minutes_included: 0,
    minutes_minimum: 0,
    fuselage_type: "",
    technicians_included: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estados para los popups
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);

  // Referencias para manejar el foco
  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

  // Referencia para el primer campo del formulario (Service select)
  const serviceSelectRef = useRef<HTMLSelectElement>(null);

  // Validación para habilitar el botón de envío
  const isFormValid = () => {
    return form.id_service !== "" &&
      form.id_client !== "" &&
      form.company !== "" &&
      form.minutes_included >= 0 &&
      form.minutes_minimum >= 0 &&
      form.technicians_included >= 0;
  };

  // Función para validar campos individuales
  const validateField = (fieldName: string, value: any) => {
    const errors = { ...validationErrors };

    switch (fieldName) {
      case 'id_service':
        if (!value || value === "") {
          errors[fieldName] = 'Service is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_client':
        if (!value || value === "") {
          errors[fieldName] = 'Client is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'company':
        if (!value || value === "") {
          errors[fieldName] = 'Company is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'minutes_included':
        if (value < 0) {
          errors[fieldName] = 'Minutes included must be 0 or greater';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'minutes_minimum':
        if (value < 0) {
          errors[fieldName] = 'Minimum minutes must be 0 or greater';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'technicians_included':
        if (value < 0) {
          errors[fieldName] = 'Technicians included must be 0 or greater';
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

    if (!form.id_service || form.id_service === "") {
      errors.id_service = 'Service is required';
    }
    if (!form.id_client || form.id_client === "") {
      errors.id_client = 'Client is required';
    }
    if (!form.company || form.company === "") {
      errors.company = 'Company is required';
    }
    if (form.minutes_included < 0) {
      errors.minutes_included = 'Minutes included must be 0 or greater';
    }
    if (form.minutes_minimum < 0) {
      errors.minutes_minimum = 'Minimum minutes must be 0 or greater';
    }
    if (form.technicians_included < 0) {
      errors.technicians_included = 'Technicians included must be 0 or greater';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Efecto para enfocar el primer campo al cargar el formulario
  useEffect(() => {
    if (!servicesLoading && serviceSelectRef.current) {
      setTimeout(() => {
        serviceSelectRef.current?.focus();
      }, 100);
    }
  }, [servicesLoading]);

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

  // Función para manejar cambios en campos numéricos
  const handleNumericChange = (field: string, value: string) => {
    const numericValue = parseFloat(value);
    // Solo actualizar si el valor es mayor o igual a 0, o si está vacío
    if (value === "" || numericValue >= 0) {
      const finalValue = value === "" ? 0 : numericValue;
      setForm({ ...form, [field]: finalValue });
      validateField(field, finalValue);
    }
  };

  // Obtener la lista de clientes, servicios y compañías cuando el componente se monta
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar clientes
        const clientsResponse = await axiosInstance.get('/catalog/clients');
        console.log("Clientes recibidos:", clientsResponse.data);
        setClients(clientsResponse.data);
        setClientsLoading(false);
        
        // Cargar servicios
        const servicesResponse = await axiosInstance.get('/catalog/services');
        console.log("Servicios recibidos:", servicesResponse.data);
        setServices(servicesResponse.data);
        setServicesLoading(false);

        // Cargar compañías
        const companiesResponse = await axiosInstance.get('/companies/');
        console.log("Compañías recibidas:", companiesResponse.data);
        setCompanies(companiesResponse.data);
        setCompaniesLoading(false);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error loading data. Please refresh the page.");
        setClientsLoading(false);
        setServicesLoading(false);
        setCompaniesLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Verifica si un service per customer duplicado ya existe
   */
  const checkDuplicateServicePerCustomer = async () => {
    try {
      const res = await axiosInstance.get(`/catalog/service-per-customer`);
      return res.data.some((item: any) => 
        item.id_service.toString() === form.id_service &&
        item.id_client.toString() === form.id_client &&
        item.company === form.company
      );
    } catch (err) {
      console.error("Error checking for duplicate service per customer", err);
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

    setLoading(true);
    setError("");

    try {
      // Verificar si la combinación ya existe
      const isDuplicate = await checkDuplicateServicePerCustomer();
      if (isDuplicate) {
        setShowDuplicateWarningPopup(true);
        setLoading(false);
        return;
      }

      const whonew = sessionStorage.getItem("userName") || "admin";
      
      // Intentemos con diferentes formatos para ver cuál funciona
      const data = {
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        company: form.company,
        minutes_included: Math.floor(form.minutes_included), // Asegurar que sea entero
        minutes_minimum: Math.floor(form.minutes_minimum),   // Asegurar que sea entero
        fuselage_type: form.fuselage_type || "",
        technicians_included: Math.floor(form.technicians_included), // Asegurar que sea entero
        whonew,
      };

      console.log("Datos a enviar (formato completo):", JSON.stringify(data, null, 2));

      const response = await axiosInstance.post(`/catalog/service-per-customer`, data);
      console.log("Respuesta exitosa:", response.data);
      
      // Mostrar popup de éxito en lugar de navegar inmediatamente
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error("Error completo:", err);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Headers:", err.response?.headers);
      
      if (err.response && err.response.data) {
        console.error("Detalles específicos del error:", JSON.stringify(err.response.data, null, 2));
        
        // Mostrar detalles de validación si están disponibles
        if (err.response.data.detail) {
          // Si detail es un array, mostrar cada error
          if (Array.isArray(err.response.data.detail)) {
            console.error("Errores de validación detallados:", err.response.data.detail);
            const errorMessages = err.response.data.detail.map((error: any) => {
              const field = error.loc ? error.loc.join('.') : 'Unknown field';
              const message = error.msg || 'Validation error';
              const input = error.input ? ` (Input: ${error.input})` : '';
              return `${field}: ${message}${input}`;
            }).join('; ');
            setError(`Validation errors: ${errorMessages}`);
          } else {
            setError(`Error: ${err.response.data.detail}`);
          }
        } else {
          setError(`Backend error: ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.response) {
        setError(`HTTP Error ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        setError("Network error: No response received from server");
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/catalogs/customer");
  };

  /**
   * Cierra el popup y navega al listado de service per customer
   */
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate("/catalogs/customer");
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
              Add Service per Customer
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md">
                <p className="font-medium whitespace-pre-wrap">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Service <span className="text-red-400">*</span>
                  </label>
                  {servicesLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading services...
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_service 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                      } focus:ring-2 focus:outline-none transition-all`}
                      value={form.id_service}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm({ ...form, id_service: value });
                        validateField('id_service', value);
                      }}
                      required
                      ref={serviceSelectRef}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id_service} value={service.id_service}>
                          {service.service_code} - {service.service_name}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.id_service && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_service}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Client <span className="text-red-400">*</span>
                  </label>
                  {clientsLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading clients...
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.id_client 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                      } focus:ring-2 focus:outline-none transition-all`}
                      value={form.id_client}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm({ ...form, id_client: value });
                        validateField('id_client', value);
                      }}
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.llave} value={client.llave}>
                          {client.razonSocial || client.nombre || `Client #${client.llave}`}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.id_client && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_client}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Company <span className="text-red-400">*</span>
                  </label>
                  {companiesLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading companies...
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                        validationErrors.company 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                      } focus:ring-2 focus:outline-none transition-all`}
                      value={form.company}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm({ ...form, company: value });
                        validateField('company', value);
                      }}
                      required
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.companyCode} value={`${company.companyCode} - ${company.companyName}`}>
                          {company.companyCode} - {company.companyName}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.company && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.company}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Included Minutes <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                      validationErrors.minutes_included 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                    } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Included Minutes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.minutes_included}
                    onChange={(e) => handleNumericChange('minutes_included', e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir que se escriban números negativos con el teclado
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    required
                  />
                  {validationErrors.minutes_included && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.minutes_included}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Minimum Minutes <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                      validationErrors.minutes_minimum 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                    } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Minimum Minutes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.minutes_minimum}
                    onChange={(e) => handleNumericChange('minutes_minimum', e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir que se escriban números negativos con el teclado
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    required
                  />
                  {validationErrors.minutes_minimum && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.minutes_minimum}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Technicians Included <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${
                      validationErrors.technicians_included 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                    } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Technicians Included"
                    type="number"
                    min="0"
                    step="1"
                    value={form.technicians_included}
                    onChange={(e) => handleNumericChange('technicians_included', e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir que se escriban números negativos con el teclado
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    required
                  />
                  {validationErrors.technicians_included && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.technicians_included}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Fuselage Type</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Fuselage Type"
                    value={form.fuselage_type}
                    onChange={(e) => setForm({ ...form, fuselage_type: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 ${
                    loading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                  disabled={loading}
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
                <p className="text-white text-lg">Service per customer has been successfully added!</p>
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

      {/* Popup de advertencia de registro duplicado */}
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
                <p className="text-white text-lg">A service per customer with this combination already exists!</p>
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

export default AddSPConsumer;