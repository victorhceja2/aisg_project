/**
 * Componente AddSPConsumer
 * 
 * Esta página permite a los usuarios agregar una nueva configuración de Servicio por Cliente.
 * Implementa un sistema de dropdowns en cascada donde:
 * 1. El selector de Compañía tiene un valor por defecto (primera compañía)
 * 2. El selector de Aerolínea muestra solo aerolíneas (tipoCliente = 1) filtradas por la compañía seleccionada
 * 3. El selector de Servicio muestra servicios disponibles para la aerolínea seleccionada
 * 4. El selector de Fuselage Type obtiene datos de la tabla DBTableAvion
 * 
 * El formulario valida todos los campos requeridos y previene entradas duplicadas.
 * Al crear exitosamente, muestra un popup de éxito y navega de vuelta a la lista de catálogos.
 */

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

interface Client {
  llave: number;
  nombre: string;
  comercial: string;
  razonSocial: string;
}

interface Service {
  id_service: number;
  service_name: string;
  service_code: string;
}

interface Company {
  companyCode: string;
  companyName: string;
  id?: number;  // Añadimos el campo id opcional para manejar el ID numérico
}

interface FuselageType {
  fuselage_type: string;
}

const AddSPConsumer: React.FC = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fuselageTypes, setFuselageTypes] = useState<FuselageType[]>([]);

  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [fuselageTypesLoading, setFuselageTypesLoading] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    id_company: "",
    companyIdNumeric: 0,  // Nuevo campo para almacenar el ID numérico
    minutes_included: 0,
    minutes_minimum: 0,
    fuselage_type: "",
    technicians_included: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);

  const successOkButtonRef = useRef<HTMLButtonElement>(null);
  const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);
  const companySelectRef = useRef<HTMLSelectElement>(null);

  // Obtener el ID numérico de compañía mediante una llamada separada
  const fetchCompanyIdByCode = async (companyCode: string): Promise<number> => {
    try {
      if (!companyCode) return 0;
      
      // Obtener el ID numérico de la compañía
      const response = await axiosInstance.get(`/companies/by-code/${encodeURIComponent(companyCode)}`);
      
      if (response.data && response.data.id) {
        return response.data.id;
      }
      
      // Como alternativa, podemos usar un valor estático para pruebas
      // basado en el companyCode (AISG = 1)
      if (companyCode === "AISG") return 1;
      
      return 0;
    } catch (err) {
      console.error("Error fetching company ID:", err);
      // Como plan B, podemos asignar un ID de compañía basado en el código
      // Esto es solo para fines de prueba
      if (companyCode === "AISG") return 1;
      return 0;
    }
  };

  const isFormValid = () => {
    return form.id_service !== "" &&
      form.id_client !== "" &&
      form.id_company !== "" &&
      form.fuselage_type.trim() !== "" &&
      form.minutes_included >= 0 &&
      form.minutes_minimum >= 0 &&
      form.technicians_included >= 0;
  };

  const validateField = (fieldName: string, value: any) => {
    const errors = { ...validationErrors };

    switch (fieldName) {
      case 'id_company':
        if (!value || value === "" || value.trim() === "") {
          errors[fieldName] = 'Company is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_client':
        if (!value || value === "" || value.toString().trim() === "") {
          errors[fieldName] = 'Client is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'id_service':
        if (!value || value === "" || value.toString().trim() === "") {
          errors[fieldName] = 'Service is required';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'minutes_included':
        const minutesIncluded = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(minutesIncluded) || minutesIncluded < 0) {
          errors[fieldName] = 'Minutes included must be 0 or greater';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'minutes_minimum':
        const minutesMinimum = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(minutesMinimum) || minutesMinimum < 0) {
          errors[fieldName] = 'Minimum minutes must be 0 or greater';
        } else {
          delete errors[fieldName];
        }
        break;
      case 'technicians_included':
        const techniciansIncluded = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(techniciansIncluded) || techniciansIncluded < 0) {
          errors[fieldName] = 'Technicians included must be 0 or greater';
        } else {
          delete errors[fieldName];
        }
        break;
    }

    setValidationErrors(errors);
  };

  const validateAllFields = () => {
    const errors: { [key: string]: string } = {};

    if (!form.id_company || form.id_company.trim() === "") {
      errors.id_company = 'Company is required';
    }

    if (!form.id_client || form.id_client.toString().trim() === "") {
      errors.id_client = 'Client is required';
    }

    if (!form.id_service || form.id_service.toString().trim() === "") {
      errors.id_service = 'Service is required';
    }

    if (isNaN(form.minutes_included) || form.minutes_included < 0) {
      errors.minutes_included = 'Minutes included must be 0 or greater';
    }

    if (isNaN(form.minutes_minimum) || form.minutes_minimum < 0) {
      errors.minutes_minimum = 'Minimum minutes must be 0 or greater';
    }

    if (isNaN(form.technicians_included) || form.technicians_included < 0) {
      errors.technicians_included = 'Technicians included must be 0 or greater';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const extractCompanyCode = (companyValue: string) => {
    if (!companyValue) return "";
    return companyValue.split(" - ")[0];
  };

  const fetchClientsByCompany = async (companyValue: string) => {
    try {
      setClientsLoading(true);
      setClients([]);
      setServices([]);
      setSelectedClient("");
      setSelectedService("");

      setForm(prevForm => ({
        ...prevForm,
        id_client: "",
        id_service: ""
      }));

      if (!companyValue) {
        setClientsLoading(false);
        return;
      }

      const companyCode = extractCompanyCode(companyValue);
      console.log("Fetching clients for company code:", companyCode);

      // Revertir al endpoint original que funcionaba
      const res = await axiosInstance.get(`/catalog/clients?companyCode=${encodeURIComponent(companyCode)}&tipoCliente=1`);
      console.log("Clients response:", res.data);
      setClients(res.data || []);
    } catch (err: any) {
      console.error("Error loading clients:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        setError(`Error loading client data: ${err.response.status} - ${err.response.data.detail || 'Unknown error'}`);
      } else {
        setError("Error loading client data. Please check your connection.");
      }
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchServicesByClient = async (clientId: string) => {
    try {
      setServicesLoading(true);
      setServices([]);
      setSelectedService("");

      setForm(prevForm => ({
        ...prevForm,
        id_service: ""
      }));

      if (!clientId) {
        setServicesLoading(false);
        return;
      }

      console.log("Fetching services for client ID:", clientId);
      
      // Cambio principal: usar el endpoint correcto de servicios
      const res = await axiosInstance.get(`/catalog/services?client_id=${encodeURIComponent(clientId)}`);
      console.log("Services response:", res.data);
      setServices(res.data || []);
    } catch (err: any) {
      console.error("Error loading services:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        setError(`Error loading service data: ${err.response.status} - ${err.response.data.detail || 'Unknown error'}`);
      } else {
        setError("Error loading service data. Please check your connection.");
      }
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchFuselageTypes = async () => {
    try {
      setFuselageTypesLoading(true);
      // Usar el endpoint de aircraft-models y extraer fuselajes únicos
      const res = await axiosInstance.get('/aircraft-models/');

      // Extraer fuselajes únicos de la respuesta
      const uniqueFuselages = [...new Set(
        res.data
          .map((aircraft: any) => aircraft.fuselaje)
          .filter((fuselaje: string) => fuselaje && fuselaje.trim())
      )];

      // Convertir al formato esperado
      const fuselageTypes = uniqueFuselages.map(fuselaje => ({
        fuselage_type: fuselaje
      }));

      setFuselageTypes(fuselageTypes);
    } catch (err) {
      console.error("Error loading fuselage types:", err);
      setError("Error loading fuselage type data.");
    } finally {
      setFuselageTypesLoading(false);
    }
  };

  const handleCompanyChange = async (companyValue: string) => {
    setSelectedCompany(companyValue);
    const companyCode = extractCompanyCode(companyValue);

    // Buscar o recuperar el ID numérico de la compañía
    let companyId = 1; // Valor por defecto para AISG

    // Si tenemos un endpoint específico, obtener el ID real
    // Si no, usar lógica alternativa como un mapa de códigos a IDs
    try {
      const numericId = await fetchCompanyIdByCode(companyCode);
      companyId = numericId || 1; // Si no se encuentra, usar 1 como fallback para AISG
    } catch (err) {
      console.error("Error fetching company ID:", err);
      // Usar ID 1 para AISG como fallback
      companyId = companyCode === "AISG" ? 1 : 0;
    }

    setForm(prevForm => ({
      ...prevForm,
      id_company: companyCode,
      companyIdNumeric: companyId,
      id_client: "",
      id_service: ""
    }));

    validateField('id_company', companyCode);
    fetchClientsByCompany(companyValue);
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);

    setForm(prevForm => ({
      ...prevForm,
      id_client: clientId,
      id_service: ""
    }));

    validateField('id_client', clientId);
    fetchServicesByClient(clientId);
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);

    setForm(prevForm => ({
      ...prevForm,
      id_service: serviceId
    }));

    validateField('id_service', serviceId);
  };

  useEffect(() => {
    if (!companiesLoading && companySelectRef.current) {
      setTimeout(() => {
        companySelectRef.current?.focus();
      }, 100);
    }
  }, [companiesLoading]);

  useEffect(() => {
    if (showSuccessPopup && successOkButtonRef.current) {
      setTimeout(() => {
        successOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showSuccessPopup]);

  useEffect(() => {
    if (showDuplicateWarningPopup && duplicateOkButtonRef.current) {
      setTimeout(() => {
        duplicateOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDuplicateWarningPopup]);

  const handleNumericChange = (field: string, value: string) => {
    let numericValue: number;

    if (value === "" || value === "0") {
      numericValue = 0;
    } else {
      numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0) {
        return;
      }
    }

    setForm(prevForm => ({ ...prevForm, [field]: numericValue }));
    validateField(field, numericValue);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setCompaniesLoading(true);

        // Cargar compañías
        const companiesResponse = await axiosInstance.get('/companies/');
        setCompanies(companiesResponse.data);

        // Seleccionar automáticamente la primera compañía si hay alguna
        if (companiesResponse.data && companiesResponse.data.length > 0) {
          const firstCompany = companiesResponse.data[0];
          const companyValue = `${firstCompany.companyCode} - ${firstCompany.companyName}`;
          setSelectedCompany(companyValue);

          // Obtener el ID numérico para la compañía
          let companyId = 1; // Valor por defecto para AISG
          try {
            const numericId = await fetchCompanyIdByCode(firstCompany.companyCode);
            companyId = numericId || 1; // Si no se encuentra, usar 1 como fallback para AISG
          } catch (err) {
            console.error("Error fetching company ID:", err);
            companyId = firstCompany.companyCode === "AISG" ? 1 : 0;
          }

          setForm(prevForm => ({
            ...prevForm,
            id_company: firstCompany.companyCode,
            companyIdNumeric: companyId
          }));

          validateField('id_company', firstCompany.companyCode);

          // Cargar clientes para la primera compañía
          await fetchClientsByCompany(companyValue);
        }

        // Cargar tipos de fuselaje
        fetchFuselageTypes();

      } catch (err: any) {
        console.error("Error fetching companies:", err);
        setError("Error loading company data. Please refresh the page.");
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const checkDuplicateServicePerCustomer = async () => {
    try {
      const res = await axiosInstance.get(`/catalog/service-per-customer`);
      return res.data.some((item: any) =>
        item.id_service.toString() === form.id_service &&
        item.id_client.toString() === form.id_client &&
        item.id_company.toString() === form.companyIdNumeric.toString()
      );
    } catch (err) {
      console.error("Error checking for duplicate service per customer", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const isValid = validateAllFields();

    if (!isValid) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);

    try {
      // Verificar si ya existe un registro duplicado
      const isDuplicate = await checkDuplicateServicePerCustomer();
      if (isDuplicate) {
        setShowDuplicateWarningPopup(true);
        setLoading(false);
        return;
      }

      const whonew = sessionStorage.getItem("userName") || "admin";

      // Buscar la compañía por código para obtener el ID numérico
      const selectedCompanyData = companies.find(company => company.companyCode === form.id_company);
      
      if (!selectedCompanyData) {
        setError("Invalid company selection. Please select a valid company.");
        setLoading(false);
        return;
      }

      // NO enviar timestamps - dejar que el backend los maneje automáticamente
      const data = {
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        id_company: form.companyIdNumeric || 1,  // Usar el ID numérico almacenado
        minutes_included: Math.max(0, Math.floor(form.minutes_included)),
        minutes_minimum: Math.max(0, Math.floor(form.minutes_minimum)),
        fuselage_type: form.fuselage_type.trim() || "",
        technicians_included: Math.max(0, Math.floor(form.technicians_included)),
        whonew
        // NO incluir create_at ni updated_at - el backend los manejará automáticamente
      };

      console.log("Sending data:", data);
      console.log("Data types:", {
        id_service: typeof data.id_service,
        id_client: typeof data.id_client,
        id_company: typeof data.id_company,
        minutes_included: typeof data.minutes_included,
        minutes_minimum: typeof data.minutes_minimum,
        fuselage_type: typeof data.fuselage_type,
        technicians_included: typeof data.technicians_included,
        whonew: typeof data.whonew
      });

      await axiosInstance.post(`/catalog/service-per-customer`, data);
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error("Error:", err);

      // Logging detallado del error para debugging
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);

      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
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

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate("/catalogs/customer");
  };

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
              <div className="grid grid-cols-1 gap-4">
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
                      ref={companySelectRef}
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.id_company
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                        } focus:ring-2 focus:outline-none transition-all`}
                      value={selectedCompany}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      required
                    >
                      <option value="">Select a Company</option>
                      {companies.map((company) => (
                        <option key={company.companyCode} value={`${company.companyCode} - ${company.companyName}`}>
                          {company.companyCode} - {company.companyName}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.id_company && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.id_company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Client (Airline) <span className="text-red-400">*</span>
                  </label>
                  {clientsLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading clients...
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.id_client
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                        } focus:ring-2 focus:outline-none transition-all ${!selectedCompany ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={selectedClient}
                      onChange={(e) => handleClientChange(e.target.value)}
                      disabled={!selectedCompany || clientsLoading}
                      required
                    >
                      <option value="">
                        {!selectedCompany ? "Select a company first" : "Select a Client"}
                      </option>
                      {clients.map((client) => (
                        <option key={client.llave} value={client.llave}>
                          {client.comercial ? `${client.comercial}` : (client.nombre ? `${client.nombre}` : `Airline #${client.llave}`)}
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
                    Service <span className="text-red-400">*</span>
                  </label>
                  {servicesLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading services...
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.id_service
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                        } focus:ring-2 focus:outline-none transition-all ${!selectedClient ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={selectedService}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      disabled={!selectedClient || servicesLoading}
                      required
                    >
                      <option value="">
                        {!selectedClient ? "Select a client first" : "Select a service"}
                      </option>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Included Minutes <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.minutes_included
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                      } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Included Minutes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.minutes_included || 0}
                    onChange={(e) => handleNumericChange('minutes_included', e.target.value)}
                    onKeyDown={(e) => {
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
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.minutes_minimum
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                      } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Minimum Minutes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.minutes_minimum || 0}
                    onChange={(e) => handleNumericChange('minutes_minimum', e.target.value)}
                    onKeyDown={(e) => {
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
                    className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.technicians_included
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                      } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Technicians Included"
                    type="number"
                    min="0"
                    step="1"
                    value={form.technicians_included || 0}
                    onChange={(e) => handleNumericChange('technicians_included', e.target.value)}
                    onKeyDown={(e) => {
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
                  <label className="block text-white text-sm font-medium mb-2">
                    Fuselage Type <span className="text-red-400">*</span>
                  </label>
                  {fuselageTypesLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading fuselage types...
                    </div>
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.fuselage_type
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'
                        } focus:ring-2 focus:outline-none transition-all`}
                      value={form.fuselage_type}
                      onChange={(e) => {
                        setForm(prevForm => ({ ...prevForm, fuselage_type: e.target.value }));
                        validateField('fuselage_type', e.target.value);
                      }}
                      required
                    >
                      <option value="">Select a Fuselage Type</option>
                      {fuselageTypes.map((type, index) => (
                        <option key={index} value={type.fuselage_type}>
                          {type.fuselage_type}
                        </option>
                      ))}
                    </select>
                  )}
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
                  className={`w-1/2 ${loading || !isFormValid() ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                  disabled={loading || !isFormValid()}
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

      {/* Modal de éxito */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Success
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
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

      {/* Modal de advertencia de duplicado */}
      {showDuplicateWarningPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Warning
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
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