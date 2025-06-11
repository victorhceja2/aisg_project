/**
 * Componente AddSPConsumer
 * 
 * Esta página permite a los usuarios agregar una nueva configuración de Servicio por Cliente.
 * Implementa un sistema de dropdowns en cascada donde:
 * 1. El selector de Compañía tiene un valor por defecto (primera compañía)
 * 2. El selector de Aerolínea muestra solo aerolíneas filtradas por la compañía seleccionada y ordenadas alfabéticamente.
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

interface Company {
  company_code: string;
  company_name: string;
  company_llave?: string;
}

interface AirlineClient {
  company_code: string;
  company_name: string;
  company_llave?: string;
  airline_name: string;
  airline_code: string;
  airline_llave?: string;
}

interface Service {
  id_service: number;
  service_name: string;
  service_code: string;
}

interface FuselageType {
  fuselage_type: string;
}

const AddSPConsumer: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [clients, setClients] = useState<AirlineClient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [fuselageTypes, setFuselageTypes] = useState<FuselageType[]>([]);

  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [fuselageTypesLoading, setFuselageTypesLoading] = useState(false);

  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>("");
  const [selectedClientCode, setSelectedClientCode] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    id_company: "",
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

  // ----------- VALIDACIÓN Y LIMPIEZA DE ERRORES -----------

  // MODIFICADO: isFormValid ahora revisa los valores actuales del formulario, no los selects auxiliares
  const isFormValid = () => {
    return (
      form.id_service !== "" &&
      form.id_client !== "" &&
      form.id_company !== "" &&
      form.fuselage_type.trim() !== "" &&
      !isNaN(Number(form.minutes_included)) && Number(form.minutes_included) >= 0 &&
      !isNaN(Number(form.minutes_minimum)) && Number(form.minutes_minimum) >= 0 &&
      !isNaN(Number(form.technicians_included)) && Number(form.technicians_included) >= 0
    );
  };

  const clearFieldError = (field: string) => {
    setValidationErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const validateField = (fieldName: string, value: any) => {
    setValidationErrors((prev) => {
      const errors = { ...prev };
      switch (fieldName) {
        case 'id_company':
          if (!value || value === "") {
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
          {
            const minutesIncluded = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(minutesIncluded) || minutesIncluded < 0) {
              errors[fieldName] = 'Minutes included must be 0 or greater';
            } else {
              delete errors[fieldName];
            }
          }
          break;
        case 'minutes_minimum':
          {
            const minutesMinimum = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(minutesMinimum) || minutesMinimum < 0) {
              errors[fieldName] = 'Minimum minutes must be 0 or greater';
            } else {
              delete errors[fieldName];
            }
          }
          break;
        case 'technicians_included':
          {
            const techniciansIncluded = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(techniciansIncluded) || techniciansIncluded < 0) {
              errors[fieldName] = 'Technicians included must be 0 or greater';
            } else {
              delete errors[fieldName];
            }
          }
          break;
        case 'fuselage_type':
          if (!value || value.trim() === "") {
            errors[fieldName] = 'Fuselage type is required';
          } else {
            delete errors[fieldName];
          }
          break;
      }
      return errors;
    });
  };

  const validateAllFields = () => {
    const errors: { [key: string]: string } = {};

    if (!form.id_company || form.id_company === "") {
      errors.id_company = 'Company is required';
    }
    if (!form.id_client || form.id_client.toString().trim() === "") {
      errors.id_client = 'Client is required';
    }
    if (!form.id_service || form.id_service.toString().trim() === "") {
      errors.id_service = 'Service is required';
    }
    if (isNaN(Number(form.minutes_included)) || Number(form.minutes_included) < 0) {
      errors.minutes_included = 'Minutes included must be 0 or greater';
    }
    if (isNaN(Number(form.minutes_minimum)) || Number(form.minutes_minimum) < 0) {
      errors.minutes_minimum = 'Minimum minutes must be 0 or greater';
    }
    if (isNaN(Number(form.technicians_included)) || Number(form.technicians_included) < 0) {
      errors.technicians_included = 'Technicians included must be 0 or greater';
    }
    if (!form.fuselage_type || form.fuselage_type.trim() === "") {
      errors.fuselage_type = 'Fuselage type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ----------- FETCH DE DATOS -----------

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const res = await axiosInstance.get('/catalog/service-per-customer/dropdown/companies');
      setCompanies(res.data || []);
    } catch (err) {
      setCompanies([]);
      setError("Error loading company data. Please refresh the page.");
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchClientsByCompany = async (companyCode: string) => {
    try {
      setClientsLoading(true);
      setClients([]);
      setServices([]);
      setSelectedClientCode("");
      setSelectedService("");
      setForm(prevForm => ({
        ...prevForm,
        id_client: "",
        id_service: ""
      }));
      clearFieldError('id_client');
      clearFieldError('id_service');

      if (!companyCode) {
        setClientsLoading(false);
        return;
      }

      const res = await axiosInstance.get(`/catalog/service-per-customer/dropdown/clients?company_code=${encodeURIComponent(companyCode)}`);
      const sortedClients = (res.data || []).sort((a: AirlineClient, b: AirlineClient) =>
        a.airline_name.localeCompare(b.airline_name)
      );
      setClients(sortedClients);
    } catch (err) {
      setClients([]);
      setError("Error loading client data. Please check your connection.");
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchServicesByClient = async (clientCode: string) => {
    try {
      setServicesLoading(true);
      setServices([]);
      setSelectedService("");
      setForm(prevForm => ({
        ...prevForm,
        id_service: ""
      }));
      clearFieldError('id_service');

      if (!clientCode) {
        setServicesLoading(false);
        return;
      }

      const res = await axiosInstance.get(`/catalog/services?client_id=${encodeURIComponent(clientCode)}`);
      setServices(res.data || []);
    } catch (err) {
      setServices([]);
      setError("Error loading service data. Please check your connection.");
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchFuselageTypes = async () => {
    try {
      setFuselageTypesLoading(true);
      const res = await axiosInstance.get('/aircraft-models/');
      const uniqueFuselages = [...new Set(
        res.data
          .map((aircraft: any) => aircraft.fuselaje)
          .filter((fuselaje: string) => fuselaje && fuselaje.trim())
      )];
      const fuselageTypes = uniqueFuselages.map(fuselaje => ({
        fuselage_type: fuselaje
      }));
      setFuselageTypes(fuselageTypes);
    } catch (err) {
      setError("Error loading fuselage type data.");
    } finally {
      setFuselageTypesLoading(false);
    }
  };

  // ----------- EFECTOS DE SINCRONIZACIÓN -----------

  // Sincroniza el valor por defecto de compañía y carga clientes al inicio
  useEffect(() => {
    if (!companiesLoading && companies.length > 0) {
      setSelectedCompanyCode(companies[0].company_code);
      setForm((prevForm) => ({
        ...prevForm,
        id_company: companies[0].company_llave || "",
      }));
      clearFieldError('id_company');
      fetchClientsByCompany(companies[0].company_code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companiesLoading, companies.length]);

  useEffect(() => {
    fetchCompanies();
    fetchFuselageTypes();
  }, []);

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

  // ----------- HANDLERS DE CAMBIO -----------

  const handleCompanyChange = async (companyCode: string) => {
    setSelectedCompanyCode(companyCode);
    const company = companies.find(c => c.company_code === companyCode);
    setForm(prevForm => ({
      ...prevForm,
      id_company: company?.company_llave || "",
      id_client: "",
      id_service: ""
    }));
    clearFieldError('id_company');
    clearFieldError('id_client');
    clearFieldError('id_service');
    await fetchClientsByCompany(companyCode);
  };

  const handleClientChange = (clientCode: string) => {
    setSelectedClientCode(clientCode);
    const client = clients.find(c => c.airline_code === clientCode);
    setForm(prevForm => ({
      ...prevForm,
      id_client: client?.airline_llave || "",
      id_service: ""
    }));
    clearFieldError('id_client');
    clearFieldError('id_service');
    fetchServicesByClient(clientCode);
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    setForm(prevForm => ({
      ...prevForm,
      id_service: serviceId
    }));
    clearFieldError('id_service');
  };

  const handleFuselageChange = (value: string) => {
    setForm(prevForm => ({ ...prevForm, fuselage_type: value }));
    clearFieldError('fuselage_type');
  };

  // ----------- HANDLER DE NÚMEROS -----------

  const handleNumericChange = (field: string, value: string) => {
    let numericValue: number;

    if (value === "" || value === "0") {
      numericValue = 0;
    } else {
      numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: 'Value must be 0 or greater'
        }));
        return;
      }
    }

    setForm(prevForm => ({ ...prevForm, [field]: numericValue }));
    clearFieldError(field);
  };

  // ----------- DUPLICADOS -----------

  const checkDuplicateServicePerCustomer = async () => {
    try {
      const res = await axiosInstance.get(`/catalog/service-per-customer`);
      return res.data.some((item: any) =>
        item.id_service.toString() === form.id_service &&
        item.id_client.toString() === form.id_client &&
        item.id_company.toString() === form.id_company
      );
    } catch (err) {
      return false;
    }
  };

  // ----------- SUBMIT -----------

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
      const isDuplicate = await checkDuplicateServicePerCustomer();
      if (isDuplicate) {
        setShowDuplicateWarningPopup(true);
        setLoading(false);
        return;
      }

      const whonew = sessionStorage.getItem("userName") || "admin";

      const data = {
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        id_company: parseInt(form.id_company),
        minutes_included: Math.max(0, Math.floor(Number(form.minutes_included))),
        minutes_minimum: Math.max(0, Math.floor(Number(form.minutes_minimum))),
        fuselage_type: form.fuselage_type.trim() || "",
        technicians_included: Math.max(0, Math.floor(Number(form.technicians_included))),
        whonew
      };

      await axiosInstance.post(`/catalog/service-per-customer`, data);
      setShowSuccessPopup(true);
    } catch (err: any) {
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

  // ----------- CANCELAR Y POPUPS -----------

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

  // ----------- RENDER -----------

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
                      value={selectedCompanyCode}
                      onChange={async (e) => await handleCompanyChange(e.target.value)}
                      required
                    >
                      <option value="">Select a Company</option>
                      {companies.map((company) => (
                        <option key={company.company_code} value={company.company_code}>
                          {company.company_code} - {company.company_name}
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
                        } focus:ring-2 focus:outline-none transition-all ${!selectedCompanyCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={selectedClientCode}
                      onChange={(e) => handleClientChange(e.target.value)}
                      disabled={!selectedCompanyCode || clientsLoading}
                      required
                    >
                      <option value="">
                        {!selectedCompanyCode ? "Select a company first" : "Select a Client"}
                      </option>
                      {clients.map((client) => (
                        <option key={client.airline_code} value={client.airline_code}>
                          {client.airline_name}
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
                        } focus:ring-2 focus:outline-none transition-all ${!form.id_client ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={selectedService}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      disabled={!form.id_client || servicesLoading}
                      required
                    >
                      <option value="">
                        {!form.id_client ? "Select a client first" : "Select a service"}
                      </option>
                      {services.map((service) => (
                        <option key={service.id_service} value={service.id_service.toString()}>
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
                    value={form.minutes_included}
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
                    value={form.minutes_minimum}
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
                    value={form.technicians_included}
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
                      onChange={(e) => handleFuselageChange(e.target.value)}
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
                  {validationErrors.fuselage_type && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.fuselage_type}</p>
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