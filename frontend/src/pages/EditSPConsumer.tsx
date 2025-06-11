// ...existing code...
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

// Interface para las compañías (consistente con AddSPConsumer y endpoint /dropdown/companies)
interface Company {
  company_code: string;
  company_name: string;
  company_llave: string; // Es un ID numérico, pero se maneja como string en el form
}

// Interface para los clientes/aerolíneas (consistente con AddSPConsumer y endpoint /dropdown/clients)
interface AirlineClient {
  airline_llave: string; // Es un ID numérico, pero se maneja como string en el form
  airline_name: string;
  airline_code: string;
  company_code?: string;
  company_name?: string;
  company_llave?: string;
}

// Interface para los servicios
interface Service {
    id_service: number; // El ID del servicio es numérico
    service_name: string;
    service_code: string;
}

// Interface para los tipos de fuselaje
interface FuselageType {
    fuselage_type: string;
}

const EditSPConsumer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estado para almacenar las listas
    const [companies, setCompanies] = useState<Company[]>([]);
    const [clients, setClients] = useState<AirlineClient[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [fuselageTypes, setFuselageTypes] = useState<FuselageType[]>([]);

    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [fuselageTypesLoading, setFuselageTypesLoading] = useState(false);

    // Estados para controlar la selección en cascada (usando códigos)
    const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>("");
    const [selectedClientCode, setSelectedClientCode] = useState<string>("");
    const [selectedService, setSelectedService] = useState<string>("");

    // Estados para errores de validación específicos
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Estado para los datos originales (para verificar cambios) - IDs como strings
    const [originalData, setOriginalData] = useState({
        id_service: "",
        id_client: "",
        id_company: "",
        minutes_included: 0,
        minutes_minimum: 0,
        fuselage_type: "",
        technicians_included: 0,
    });

    // Estado del formulario - IDs como strings (llaves)
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
    const [submitting, setSubmitting] = useState(false);

    // Estados para los popups
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);
    const [showInUseWarningPopup, setShowInUseWarningPopup] = useState(false);

    // Referencias para manejar el foco
    const successOkButtonRef = useRef<HTMLButtonElement>(null);
    const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);
    const inUseOkButtonRef = useRef<HTMLButtonElement>(null);
    const companySelectRef = useRef<HTMLSelectElement>(null);

    // Validación para habilitar el botón de envío
    const isFormValid = () => {
        return form.id_service !== "" &&
            form.id_client !== "" &&
            form.id_company !== "" &&
            form.fuselage_type.trim() !== "" &&
            !isNaN(Number(form.minutes_included)) && Number(form.minutes_included) >= 0 &&
            !isNaN(Number(form.minutes_minimum)) && Number(form.minutes_minimum) >= 0 &&
            !isNaN(Number(form.technicians_included)) && Number(form.technicians_included) >= 0;
    };

    const clearFieldError = (field: string) => {
        setValidationErrors((prev) => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
    };

    // Función para validar campos individuales
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

    // Función para validar todos los campos
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

    // Modificado: ahora acepta keepSelection para carga inicial
    const fetchClientsByCompanyCode = async (companyCode: string, keepSelection = false) => {
        try {
            setClientsLoading(true);
            setClients([]); // Clear previous clients
            setServices([]); // Clear previous services as client is changing or being loaded
            if (!keepSelection) {
                setSelectedClientCode("");
                setSelectedService("");
                setForm(prevForm => ({
                    ...prevForm,
                    id_client: "",
                    id_service: ""
                }));
                clearFieldError('id_client');
                clearFieldError('id_service');
            }
            if (!companyCode) {
                setClientsLoading(false);
                return [];
            }
            const res = await axiosInstance.get(`/catalog/service-per-customer/dropdown/clients?company_code=${encodeURIComponent(companyCode)}`);
            const sortedClients = (res.data || []).sort((a: AirlineClient, b: AirlineClient) =>
                a.airline_name.localeCompare(b.airline_name)
            );
            setClients(sortedClients);
            return sortedClients;
        } catch (err: any) {
            console.error("Error loading clients by company code:", err);
            setError("Error loading client data. Please check your connection.");
            setClients([]);
            return [];
        } finally {
            setClientsLoading(false);
        }
    };

    // Modificado: ahora acepta keepSelection para carga inicial
    const fetchServicesByClientLlave = async (clientLlave: string, keepSelection = false) => {
        try {
            setServicesLoading(true);
            setServices([]); // Clear previous services
            if (!keepSelection) {
                setSelectedService("");
                setForm(prevForm => ({
                    ...prevForm,
                    id_service: ""
                }));
                clearFieldError('id_service');
            }
            if (!clientLlave) {
                setServicesLoading(false);
                return [];
            }
            const res = await axiosInstance.get(`/catalog/services?client_id=${encodeURIComponent(clientLlave)}`);
            setServices(res.data || []);
            return res.data || [];
        } catch (err: any) {
            console.error("Error loading services by client llave:", err);
            setError("Error loading service data. Please check your connection.");
            setServices([]);
            return [];
        } finally {
            setServicesLoading(false);
        }
    };

    // Función para cargar los tipos de fuselaje
    const fetchFuselageTypes = async () => {
        try {
            setFuselageTypesLoading(true);
            const res = await axiosInstance.get('/aircraft-models/');
            const uniqueFuselages = [...new Set(
                res.data
                    .map((aircraft: any) => aircraft.fuselaje)
                    .filter((fuselaje: string) => fuselaje && fuselaje.trim())
            )];
            const fuselageTypesData = uniqueFuselages.map(fuselaje => ({
                fuselage_type: fuselaje
            }));
            setFuselageTypes(fuselageTypesData);
        } catch (err) {
            console.error("Error loading fuselage types:", err);
            setError("Error loading fuselage type data.");
        } finally {
            setFuselageTypesLoading(false);
        }
    };

    // Manejar cambio de compañía (se selecciona por company_code)
    const handleCompanyChange = async (companyCode: string) => {
        setSelectedCompanyCode(companyCode);
        const company = companies.find(c => c.company_code === companyCode);

        setForm(prevForm => ({
            ...prevForm,
            id_company: company?.company_llave || "",
            id_client: "",
            id_service: ""
        }));

        setSelectedClientCode("");
        setSelectedService("");

        validateField('id_company', company?.company_llave || "");
        clearFieldError('id_client');
        clearFieldError('id_service');

        if (companyCode) {
            await fetchClientsByCompanyCode(companyCode); // keepSelection is false by default
        } else {
            setClients([]);
            setServices([]);
        }
    };

    // Manejar cambio de cliente (se selecciona por airline_code)
    const handleClientChange = async (clientCode: string) => {
        setSelectedClientCode(clientCode);
        const client = clients.find(c => c.airline_code === clientCode);

        setForm(prevForm => ({
            ...prevForm,
            id_client: client?.airline_llave || "",
            id_service: ""
        }));
        setSelectedService("");

        validateField('id_client', client?.airline_llave || "");
        clearFieldError('id_service');

        if (client?.airline_llave) {
            await fetchServicesByClientLlave(client.airline_llave); // keepSelection is false by default
        } else {
            setServices([]);
        }
    };

    // Manejar cambio de servicio (se selecciona por id_service)
    const handleServiceChange = (serviceId: string) => {
        setSelectedService(serviceId);
        setForm(prevForm => ({
            ...prevForm,
            id_service: serviceId
        }));
        validateField('id_service', serviceId);
    };

    const handleFuselageChange = (value: string) => {
        setForm(prevForm => ({ ...prevForm, fuselage_type: value }));
        clearFieldError('fuselage_type');
    };

    // Efecto para enfocar el primer campo al cargar el formulario
    useEffect(() => {
        if (!loading && !companiesLoading && companySelectRef.current) {
            setTimeout(() => {
                companySelectRef.current?.focus();
            }, 100);
        }
    }, [loading, companiesLoading]);

    // Efectos para enfocar botones de popups
    useEffect(() => {
        if (showSuccessPopup && successOkButtonRef.current) {
            setTimeout(() => { successOkButtonRef.current?.focus(); }, 100);
        }
    }, [showSuccessPopup]);
    useEffect(() => {
        if (showDuplicateWarningPopup && duplicateOkButtonRef.current) {
            setTimeout(() => { duplicateOkButtonRef.current?.focus(); }, 100);
        }
    }, [showDuplicateWarningPopup]);
    useEffect(() => {
        if (showInUseWarningPopup && inUseOkButtonRef.current) {
            setTimeout(() => { inUseOkButtonRef.current?.focus(); }, 100);
        }
    }, [showInUseWarningPopup]);

    // Efecto para manejar Enter en los popups
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (showSuccessPopup) { e.preventDefault(); handleClosePopup(); }
                else if (showDuplicateWarningPopup) { e.preventDefault(); closeDuplicateWarningPopup(); }
                else if (showInUseWarningPopup) { e.preventDefault(); closeInUseWarningPopup(); }
            }
        };
        if (showSuccessPopup || showDuplicateWarningPopup || showInUseWarningPopup) {
            document.addEventListener('keydown', handleKeyDown);
            return () => { document.removeEventListener('keydown', handleKeyDown); };
        }
    }, [showSuccessPopup, showDuplicateWarningPopup, showInUseWarningPopup]);

    // Función para manejar cambios en campos numéricos
    const handleNumericChange = (field: string, value: string) => {
        let numericValue: number;
        if (value === "" || value === "0") { // Allow empty string to be treated as 0 or to clear
            numericValue = 0;
        } else {
            numericValue = parseFloat(value);
        }
        // Validate after attempting to parse
        if (isNaN(numericValue) || numericValue < 0) {
             // Keep the input as is if it's invalid for now, or reset/handle error
            setValidationErrors((prev) => ({
                ...prev,
                [field]: 'Value must be 0 or greater'
            }));
            // Optionally set form field to a safe value or leave as is for user to correct
            // setForm(prevForm => ({ ...prevForm, [field]: value })); // Keep user's input
            return; // Prevent setting form if invalid and rely on validation message
        }

        setForm(prevForm => ({ ...prevForm, [field]: numericValue }));
        validateField(field, numericValue);
    };


    // Cargar datos iniciales y dependencias en cascada
    useEffect(() => {
        const fetchInitialDataAndDeps = async () => {
            try {
                setLoading(true);
                setCompaniesLoading(true); // Start loading companies

                // 1. Cargar compañías
                const companiesRes = await axiosInstance.get('/catalog/service-per-customer/dropdown/companies');
                const loadedCompanies: Company[] = (companiesRes.data || []).sort((a: Company, b: Company) => a.company_name.localeCompare(b.company_name));
                setCompanies(loadedCompanies);
                setCompaniesLoading(false); // Finish loading companies

                // 2. Cargar el registro específico para editar
                const servicePerCustomerRes = await axiosInstance.get(`/catalog/service-per-customer/${id}`);
                const serviceData = servicePerCustomerRes.data;

                console.log("Fetched serviceData:", serviceData);

                if (serviceData) {
                    const formDataFromDB = {
                        id_service: serviceData.id_service.toString(),
                        id_client: serviceData.id_client.toString(),
                        id_company: serviceData.id_company.toString(),
                        minutes_included: serviceData.minutes_included || 0,
                        minutes_minimum: serviceData.minutes_minimum || 0,
                        fuselage_type: serviceData.fuselage_type || "",
                        technicians_included: serviceData.technicians_included || 0,
                    };
                    setForm(formDataFromDB);
                    setOriginalData(formDataFromDB);
                    console.log("Set form with formDataFromDB:", formDataFromDB);

                    const currentCompany = loadedCompanies.find(c => String(c.company_llave) === formDataFromDB.id_company);
                    console.log("Finding company with llave:", formDataFromDB.id_company, "Found:", currentCompany);

                    if (currentCompany) {
                        setSelectedCompanyCode(currentCompany.company_code);
                        console.log("Selected company code:", currentCompany.company_code);

                        // Fetch clients for this company, keeping selection if needed (true for initial load)
                        const loadedClients = await fetchClientsByCompanyCode(currentCompany.company_code, true);
                        console.log("Loaded clients for company", currentCompany.company_code, ":", loadedClients);

                        const currentClient = loadedClients.find(c => String(c.airline_llave) === formDataFromDB.id_client);
                        console.log("Finding client with llave:", formDataFromDB.id_client, "Found:", currentClient);

                        if (currentClient) {
                            setSelectedClientCode(currentClient.airline_code);
                            console.log("Selected client code:", currentClient.airline_code);

                            // Fetch services for this client, keeping selection (true for initial load)
                            const loadedServices = await fetchServicesByClientLlave(currentClient.airline_llave, true); // Use currentClient.airline_llave
                            console.log("Loaded services for client", currentClient.airline_llave, ":", loadedServices);
                            
                            setSelectedService(formDataFromDB.id_service);
                            console.log("Selected service ID:", formDataFromDB.id_service);
                        } else {
                            console.warn(`Client with llave ${formDataFromDB.id_client} not found in loaded clients for company ${currentCompany.company_name}.`);
                            setSelectedClientCode(""); // Clear if not found
                            setServices([]); // Clear services if client not found
                            setSelectedService("");
                        }
                    } else {
                        console.warn(`Company with llave ${formDataFromDB.id_company} not found in loaded companies.`);
                        setSelectedCompanyCode(""); // Clear if not found
                        setClients([]); // Clear clients if company not found
                        setSelectedClientCode("");
                        setServices([]); // Clear services
                        setSelectedService("");
                    }
                    await fetchFuselageTypes();
                } else {
                    setError("Failed to load service per customer data.");
                }
            } catch (err: any) {
                console.error("Error loading initial data:", err);
                setError("Error loading data. Please refresh the page.");
            } finally {
                setLoading(false);
                // Ensure loading states are false if they were true
                if (companiesLoading) setCompaniesLoading(false);
                if (clientsLoading) setClientsLoading(false);
                if (servicesLoading) setServicesLoading(false);
                if (fuselageTypesLoading) setFuselageTypesLoading(false);
            }
        };

        if (id) {
            fetchInitialDataAndDeps();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only re-run if id changes

    // Verificar si un service per customer duplicado ya existe (excluyendo el actual)
    const checkDuplicateServicePerCustomer = async () => {
        try {
            const res = await axiosInstance.get(`/catalog/service-per-customer`);
            return res.data.some((item: any) =>
                item.id_service.toString() === form.id_service &&
                item.id_client.toString() === form.id_client &&
                item.id_company.toString() === form.id_company &&
                item.id_service_per_customer.toString() !== id // Exclude current item
            );
        } catch (err) {
            console.error("Error checking for duplicate service per customer", err);
            // Assume not duplicate on error to allow submission, or handle error more gracefully
            return false;
        }
    };

    // Verificar si el registro está siendo usado
    const checkIfInUse = async () => {
        // This is a placeholder. Implement actual logic if needed.
        // For example, check against related records in other tables.
        // try {
        // const res = await axiosInstance.get(`/some-endpoint/check-usage/service-per-customer/${id}`);
        // return res.data.isInUse; // Assuming endpoint returns { isInUse: boolean }
        // } catch (err) {
        // console.error("Error checking if service per customer is in use", err);
        // return false; // Default to not in use on error, or handle as critical
        // }
        return false; // Placeholder
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setError("");

        const isValid = validateAllFields();
        if (!isValid) {
            setError("Please fill in all required fields correctly.");
            // Focus on the first invalid field if possible (more complex UI logic)
            return;
        }
        setSubmitting(true);

        try {
            // Check for duplicates or if in use only if key identifiers have changed
            const keyFieldsChanged =
                form.id_service !== originalData.id_service ||
                form.id_client !== originalData.id_client ||
                form.id_company !== originalData.id_company;

            if (keyFieldsChanged) {
                const inUse = await checkIfInUse();
                if (inUse) {
                    setShowInUseWarningPopup(true);
                    setSubmitting(false);
                    return;
                }
                const isDuplicate = await checkDuplicateServicePerCustomer();
                if (isDuplicate) {
                    setShowDuplicateWarningPopup(true);
                    setSubmitting(false);
                    return;
                }
            }

            const whonew = sessionStorage.getItem("userName") || "admin"; // Get username
            const data = {
                id_service: parseInt(form.id_service),
                id_client: parseInt(form.id_client),
                id_company: parseInt(form.id_company),
                minutes_included: Math.max(0, Math.floor(Number(form.minutes_included))),
                minutes_minimum: Math.max(0, Math.floor(Number(form.minutes_minimum))),
                fuselage_type: form.fuselage_type.trim() || "", // Ensure fuselage_type is not just whitespace
                technicians_included: Math.max(0, Math.floor(Number(form.technicians_included))),
                whonew
            };

            await axiosInstance.put(`/catalog/service-per-customer/${id}`, data);
            setShowSuccessPopup(true);
        } catch (err: any) {
            console.error("Error submitting form:", err);
            if (err.response && err.response.data) {
                if (err.response.data.detail) {
                    if (Array.isArray(err.response.data.detail)) {
                        // Handle Pydantic validation errors
                        const errorMessages = err.response.data.detail.map((errorDetail: any) => {
                            const field = errorDetail.loc ? errorDetail.loc.join('.') : 'Unknown field';
                            const message = errorDetail.msg || 'Validation error';
                            return `${field}: ${message}`;
                        }).join('; ');
                        setError(`Validation errors: ${errorMessages}`);
                    } else {
                        // Handle other FastAPI HTTPException details
                        setError(`Error: ${err.response.data.detail}`);
                    }
                } else {
                    setError(`Backend error: ${JSON.stringify(err.response.data)}`);
                }
            } else if (err.response) {
                // Handle non-FastAPI HTTP errors
                setError(`HTTP Error ${err.response.status}: ${err.response.statusText}`);
            } else if (err.request) {
                // Handle network errors (no response)
                setError("Network error: No response received from server. Please check your connection.");
            } else {
                // Handle other request setup errors
                setError(`Request error: ${err.message}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/customer");
    };
    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        navigate("/catalogs/customer"); // Navigate back after success
    };
    const closeDuplicateWarningPopup = () => {
        setShowDuplicateWarningPopup(false);
    };
    const closeInUseWarningPopup = () => {
        setShowInUseWarningPopup(false);
    };

    if (loading) {
        return (
            <AISGBackground>
                <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
                        <p className="text-lg">Loading service per customer data...</p>
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
                            Edit Service per Customer
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
                                {/* Company Dropdown */}
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Company <span className="text-red-400">*</span>
                                    </label>
                                    {companiesLoading ? (
                                        <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">Loading companies...</div>
                                    ) : (
                                        <select
                                            ref={companySelectRef}
                                            className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.id_company ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all`}
                                            value={selectedCompanyCode}
                                            onChange={(e) => handleCompanyChange(e.target.value)}
                                            disabled={submitting || companiesLoading}
                                            required
                                        >
                                            <option value="">Select a company</option>
                                            {companies.map((company) => (
                                                <option key={company.company_llave} value={company.company_code}>
                                                    {company.company_code} - {company.company_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {validationErrors.id_company && (<p className="mt-1 text-sm text-red-400">{validationErrors.id_company}</p>)}
                                </div>

                                {/* Client Dropdown */}
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Client (Airline) <span className="text-red-400">*</span>
                                    </label>
                                    {clientsLoading ? (
                                        <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">Loading clients...</div>
                                    ) : (
                                        <select
                                            className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.id_client ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all ${!selectedCompanyCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={selectedClientCode}
                                            onChange={(e) => handleClientChange(e.target.value)}
                                            disabled={!selectedCompanyCode || clientsLoading || submitting}
                                            required
                                        >
                                            <option value="">{!selectedCompanyCode ? "Select a company first" : "Select a client"}</option>
                                            {clients.map((client) => (
                                                <option key={client.airline_llave} value={client.airline_code}>
                                                    {client.airline_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {validationErrors.id_client && (<p className="mt-1 text-sm text-red-400">{validationErrors.id_client}</p>)}
                                </div>

                                {/* Service Dropdown */}
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Service <span className="text-red-400">*</span>
                                    </label>
                                    {servicesLoading ? (
                                        <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">Loading services...</div>
                                    ) : (
                                        <select
                                            className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.id_service ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all ${!selectedClientCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={selectedService}
                                            onChange={(e) => handleServiceChange(e.target.value)}
                                            disabled={!selectedClientCode || servicesLoading || submitting} // Disabled if no client is selected
                                            required
                                        >
                                            <option value="">{!selectedClientCode ? "Select a client first" : "Select a service"}</option>
                                            {services.map((service) => (
                                                <option key={service.id_service} value={service.id_service.toString()}>
                                                    {service.service_code} - {service.service_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {validationErrors.id_service && (<p className="mt-1 text-sm text-red-400">{validationErrors.id_service}</p>)}
                                </div>
                            </div>

                            {/* Resto de campos en grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Included Minutes <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.minutes_included ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all`}
                                        placeholder="Included Minutes" type="number" min="0" step="1"
                                        value={form.minutes_included}
                                        onChange={(e) => handleNumericChange('minutes_included', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                                        disabled={submitting} required
                                    />
                                    {validationErrors.minutes_included && (<p className="mt-1 text-sm text-red-400">{validationErrors.minutes_included}</p>)}
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Minimum Minutes <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.minutes_minimum ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all`}
                                        placeholder="Minimum Minutes" type="number" min="0" step="1"
                                        value={form.minutes_minimum}
                                        onChange={(e) => handleNumericChange('minutes_minimum', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                                        disabled={submitting} required
                                    />
                                    {validationErrors.minutes_minimum && (<p className="mt-1 text-sm text-red-400">{validationErrors.minutes_minimum}</p>)}
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Technicians Included <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.technicians_included ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all`}
                                        placeholder="Technicians Included" type="number" min="0" step="1"
                                        value={form.technicians_included}
                                        onChange={(e) => handleNumericChange('technicians_included', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                                        disabled={submitting} required
                                    />
                                    {validationErrors.technicians_included && (<p className="mt-1 text-sm text-red-400">{validationErrors.technicians_included}</p>)}
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Fuselage Type <span className="text-red-400">*</span>
                                    </label>
                                    {fuselageTypesLoading ? (
                                        <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">Loading fuselage types...</div>
                                    ) : (
                                        <select
                                            className={`w-full px-4 py-3 rounded-lg bg-white text-[#002057] border ${validationErrors.fuselage_type ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cccccc] focus:border-[#00B140] focus:ring-[#00B140]'} focus:ring-2 focus:outline-none transition-all`}
                                            value={form.fuselage_type}
                                            onChange={(e) => handleFuselageChange(e.target.value)}
                                            disabled={submitting || fuselageTypesLoading} required
                                        >
                                            <option value="">Select a fuselage type</option>
                                            {fuselageTypes.map((type, index) => (
                                                <option key={index} value={type.fuselage_type}>
                                                    {type.fuselage_type}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {validationErrors.fuselage_type && (<p className="mt-1 text-sm text-red-400">{validationErrors.fuselage_type}</p>)}
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button type="button" className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" onClick={handleCancel} disabled={submitting}>Cancel</button>
                                <button type="submit" className={`w-1/2 ${submitting || !isFormValid() ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"} text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`} disabled={submitting || !isFormValid()}>
                                    {submitting ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>Updating...</>) : ("Update")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Popups */}
            {showSuccessPopup && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl"> <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg"> <h2 className="text-2xl font-bold text-center text-[#002057]">Success</h2> <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div> </div> <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8"> <div className="flex items-center mb-4 justify-center"> <div className="bg-[#00B140] rounded-full p-2 mr-4"> <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> </div> <p className="text-white text-lg">Service per customer has been successfully updated!</p> </div> <div className="mt-6 flex justify-center space-x-4"> <button ref={successOkButtonRef} onClick={handleClosePopup} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleClosePopup(); }}} className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">OK</button> </div> </div> </div> </div> )}
            {showDuplicateWarningPopup && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl"> <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg"> <h2 className="text-2xl font-bold text-center text-[#002057]">Warning</h2> <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div> </div> <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8"> <div className="flex items-center mb-4 justify-center"> <div className="bg-[#f59e0b] rounded-full p-2 mr-4"> <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" /></svg> </div> <p className="text-white text-lg">A service per customer with this combination already exists!</p> </div> <div className="mt-6 flex justify-center space-x-4"> <button ref={duplicateOkButtonRef} onClick={closeDuplicateWarningPopup} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); closeDuplicateWarningPopup(); }}} className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">OK</button> </div> </div> </div> </div> )}
            {showInUseWarningPopup && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl"> <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg"> <h2 className="text-2xl font-bold text-center text-[#002057]">Warning</h2> <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div> </div> <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8"> <div className="flex items-center mb-4 justify-center"> <div className="bg-[#f59e0b] rounded-full p-2 mr-4"> <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" /></svg> </div> <p className="text-white text-lg">This service per customer configuration is currently in use and cannot be modified!</p> </div> <div className="mt-6 flex justify-center space-x-4"> <button ref={inUseOkButtonRef} onClick={closeInUseWarningPopup} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); closeInUseWarningPopup(); }}} className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">OK</button> </div> </div> </div> </div> )}
        </AISGBackground>
    );
};

export default EditSPConsumer;