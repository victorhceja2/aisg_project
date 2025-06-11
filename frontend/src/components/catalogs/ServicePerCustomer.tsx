/**
 * ServicePerCustomer - Componente para gestionar la relación entre servicios y aerolíneas
 * 
 * Este componente implementa una interfaz de usuario para administrar los servicios específicos
 * asignados a cada cliente/aerolínea, incluyendo las siguientes funcionalidades:
 * 
 * - Visualización de servicios por cliente en una tabla con múltiples columnas
 * - Obtención y presentación de nombres de clientes desde el endpoint /catalog/clients
 * - Búsqueda de servicios por tipo de fuselaje
 * - Adición de nuevos servicios por cliente
 * - Edición de servicios existentes
 * - Eliminación de servicios con validación de dependencias
 * - Gestión de errores y feedback visual
 * 
 * El componente hace uso de múltiples endpoints:
 * - /catalog/service-per-customer: para obtener y gestionar los registros de servicios
 * - /catalog/clients: para obtener los nombres de los clientes
 * 
 * Incluye modales para confirmación de eliminación, notificación de éxito y errores
 * con accesibilidad mediante teclado integrada.
 */
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

interface CompanyDropdown {
  company_code: string;
  company_name: string;
  company_llave: number;
}

interface ClientDropdown {
  company_code: string;
  company_name: string;
  company_llave: number;
  airline_name: string;
  airline_code: string;
  airline_llave: number;
  client_code: string;
  client_name: string;
  client_status: number;
  client_llave: number; // <-- agregado aquí
}

interface ServiceData {
  id_service: number;
  service_name: string;
  service_code: string;
}

interface ServicePerCustomerRecord {
  id_service_per_customer: number;
  id_service: number;
  id_client: number;
  id_company: number;
  minutes_included: number;
  minutes_minimum: number;
  fuselage_type: string;
  technicians_included: number;
  whonew: string;
  create_at: string;
  updated_at: string;
}

interface DisplayableServiceRecord extends ServicePerCustomerRecord {
  client_name_from_endpoint: string;
  service_name_from_endpoint: string;
  company_name_from_endpoint: string;
}

const ServicePerCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ServicePerCustomerRecord[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [companies, setCompanies] = useState<CompanyDropdown[]>([]);
  const [clients, setClients] = useState<ClientDropdown[]>([]);
  const [displayedRecords, setDisplayedRecords] = useState<DisplayableServiceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);

  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deletedRecordId, setDeletedRecordId] = useState<number | null>(null);
  const [recordNameToDelete, setRecordNameToDelete] = useState<string>("");
  const [deletedRecordName, setDeletedRecordName] = useState<string>("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecordsInfo, setDependentRecordsInfo] = useState<any[]>([]);

  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showSuccessModal && deleteSuccessOkButtonRef.current) {
      setTimeout(() => {
        deleteSuccessOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    if (deleteConfirm && deleteConfirmButtonRef.current) {
      setTimeout(() => {
        deleteConfirmButtonRef.current?.focus();
      }, 100);
    }
  }, [deleteConfirm]);

  useEffect(() => {
    if (showDeleteError && deleteErrorOkButtonRef.current) {
      setTimeout(() => {
        deleteErrorOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteError]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showSuccessModal) {
          e.preventDefault();
          handleSuccessClose();
        } else if (deleteConfirm && !deletingRecord) {
          e.preventDefault();
          handleDelete(deleteConfirm);
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      } else if (e.key === 'Escape') {
        if (deleteConfirm && !deletingRecord) {
          e.preventDefault();
          handleCancelDelete();
        } else if (showSuccessModal) {
          e.preventDefault();
          handleSuccessClose();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      }
    };

    if (deleteConfirm || showSuccessModal || showDeleteError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [deleteConfirm, showSuccessModal, showDeleteError, deletingRecord]);

  // Cambiado: Usar endpoint de dropdown para compañías
  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get<CompanyDropdown[]>('/catalog/service-per-customer/dropdown/companies');
      setCompanies(res.data || []);
    } catch (err) {
      setError(prevError => prevError ? `${prevError} Could not load company names.` : "Could not load company names.");
    }
  };

  // Cambiado: Usar endpoint de dropdown para clientes/airlines (nuevo query)
  const fetchClients = async () => {
    try {
      let allClients: ClientDropdown[] = [];
      for (const company of companies) {
        const res = await axiosInstance.get<ClientDropdown[]>(
          '/catalog/service-per-customer/dropdown/clients',
          { params: { company_code: company.company_code } }
        );
        allClients = allClients.concat(res.data || []);
      }
      setClients(allClients);
    } catch (err) {
      setError(prevError => prevError ? `${prevError} Could not load client names.` : "Could not load client names.");
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get<ServiceData[]>('/catalog/services');
      setServices(res.data || []);
    } catch (err) {
      setError(prevError => prevError ? `${prevError} Could not load service names.` : "Could not load service names.");
    }
  };

  // Cambiado: fetchRecords solo carga todos los registros, no filtra por búsqueda
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get<ServicePerCustomerRecord[]>(
        `/catalog/service-per-customer`,
        { timeout: 30000 }
      );
      setRecords(res.data || []);
      setIsLoading(false);
    } catch (err: any) {
      let errorMessage = "Could not load data. Please try again.";

      if (err.response) {
        if (err.response.status === 500) {
          errorMessage = "Server error: The server encountered an internal error. Please contact the administrator.";
        } else {
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }

      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The server took too long to respond.";
      }

      setError(errorMessage);
      setRecords([]);
      setIsLoading(false);
    }
  };

  // Cambiado: primero cargar compañías, luego clientes (airlines) dependientes
  useEffect(() => {
    fetchCompanies();
    fetchServices();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      fetchClients();
    }
  }, [companies]);

  useEffect(() => {
    fetchRecords();
  }, []);

  // Cambiado: aplicar filtro local por búsqueda desde la primera letra
  useEffect(() => {
    if (records.length > 0 && clients.length > 0 && services.length > 0 && companies.length > 0) {
      let filteredRecords = records;

      if (search.trim() !== "") {
        const searchLower = search.trim().toLowerCase();
        filteredRecords = records.filter(record => {
          const company = companies.find(c => c.company_llave === record.id_company);
          let client = clients.find(
            c => c.airline_llave === record.id_client && c.company_llave === record.id_company
          );
          if (!client) {
            client = clients.find(
              c => c.client_llave === record.id_client && c.company_llave === record.id_company
            );
          }
          const service = services.find(s => s.id_service === record.id_service);

          // Campos a buscar: fuselage_type, client_name, airline_name, service_name, service_code, company_name
          const fuselageType = record.fuselage_type?.toLowerCase() || "";
          const clientName = client
            ? (client.airline_name || client.client_name || "").toLowerCase()
            : "";
          const clientCode = client
            ? (client.airline_code || client.client_code || "").toLowerCase()
            : "";
          const serviceName = service
            ? (service.service_name || "").toLowerCase()
            : "";
          const serviceCode = service
            ? (service.service_code || "").toLowerCase()
            : "";
          const companyName = company
            ? (company.company_name || "").toLowerCase()
            : "";
          const companyCode = company
            ? (company.company_code || "").toLowerCase()
            : "";

          // Buscar desde la primera letra en cualquiera de los campos
          return (
            fuselageType.includes(searchLower) ||
            clientName.includes(searchLower) ||
            clientCode.includes(searchLower) ||
            serviceName.includes(searchLower) ||
            serviceCode.includes(searchLower) ||
            companyName.includes(searchLower) ||
            companyCode.includes(searchLower)
          );
        });
      }

      const newDisplayedRecords = filteredRecords.map(record => {
        const company = companies.find(c => c.company_llave === record.id_company);
        let client = clients.find(
          c => c.airline_llave === record.id_client && c.company_llave === record.id_company
        );
        if (!client) {
          client = clients.find(
            c => c.client_llave === record.id_client && c.company_llave === record.id_company
          );
        }
        const service = services.find(s => s.id_service === record.id_service);

        const companyName = company
          ? `${company.company_code} - ${company.company_name}`
          : `Missing Company Data (ID: ${record.id_company})`;

        let clientName = "";
        if (client) {
          if (client.airline_code && client.airline_name) {
            clientName = `${client.airline_code} - ${client.airline_name}`;
          } else if (client.client_code && client.client_name) {
            clientName = `${client.client_code} - ${client.client_name}`;
          } else {
            clientName = `Missing Client Data (ID: ${record.id_client})`;
          }
        } else {
          clientName = `Missing Client Data (ID: ${record.id_client})`;
        }

        const serviceName = service
          ? `${service.service_code} - ${service.service_name}`
          : `Missing Service Data (ID: ${record.id_service})`;

        return {
          ...record,
          client_name_from_endpoint: clientName,
          service_name_from_endpoint: serviceName,
          company_name_from_endpoint: companyName
        };
      });
      setDisplayedRecords(newDisplayedRecords);
    } else {
      setDisplayedRecords([]);
    }
  }, [records, clients, services, companies, search]);

  // ...el resto del código permanece igual...

  const checkServiceUsage = async (servicePerCustomerId: number): Promise<{ inUse: boolean; records: any[] }> => {
    // ...sin cambios...
    console.log(`Checking usage for service per customer ID: ${servicePerCustomerId}`);
    try {
      console.log("Performing simplified dependency check (frontend)...");
      return {
        inUse: false, 
        records: []
      };
    } catch (err) {
      console.error("Error in frontend checkServiceUsage:", err);
      return { inUse: false, records: [] };
    }
  };

  const handleDeleteConfirm = async (record: DisplayableServiceRecord) => {
    // ...sin cambios...
    console.log(`Attempting to delete service per customer ID: ${record.id_service_per_customer}`);
    setDeletingRecord(true);
    try {
      const { inUse, records: dependentItems } = await checkServiceUsage(record.id_service_per_customer);
      const recordName = `${record.service_name_from_endpoint} for ${record.client_name_from_endpoint}`;

      if (inUse && dependentItems.length > 0) {
        const dependencyList = dependentItems.map(r => `${r.type}: ${r.name || r.id}`).join(", ");
        setDeleteErrorMessage(`Cannot delete service record "${recordName}" because it is currently being used in: ${dependencyList}.`);
        setDependentRecordsInfo(dependentItems);
        setShowDeleteError(true);
        setDeletingRecord(false);
        return;
      }

      setRecordNameToDelete(recordName);
      setDeleteConfirm(record.id_service_per_customer);
    } catch (err) {
      const recordName = `${record.service_name_from_endpoint} for ${record.client_name_from_endpoint}`;
      setRecordNameToDelete(recordName);
      setDeleteConfirm(record.id_service_per_customer);
    } finally {
      if (!deleteConfirm && !showDeleteError) {
         setDeletingRecord(false);
      }
    }
  };
  
  const handleDelete = async (id: number) => {
    // ...sin cambios...
    if (!id) return;
    setDeletingRecord(true);
    const currentRecordName = recordNameToDelete || `record #${id}`;
    try {
      setError("");
      await axiosInstance.delete(`/catalog/service-per-customer/${id}`, { timeout: 15000 });
      setDeletedRecordId(id);
      setDeletedRecordName(currentRecordName);
      await fetchRecords();
      setDeleteConfirm(null);
      setShowSuccessModal(true);
      setSuccess(`Record "${currentRecordName}" deleted successfully.`);
    } catch (err: any) {
      let specificErrorMessage = `Error deleting service record "${currentRecordName}".`;
      if (err.response) {
        if (err.response.status === 409 ||
            err.response.status === 400 && err.response.data?.detail?.toLowerCase().includes("constraint") ||
            err.response.data?.detail?.toLowerCase().includes("foreign key constraint fails") ||
            err.response.data?.detail?.toLowerCase().includes("is referenced by") ||
            err.response.data?.detail?.toLowerCase().includes("still in use")) {
          specificErrorMessage = `Cannot delete service record "${currentRecordName}" because it is currently being used by other records in the system. Please resolve dependencies before deleting.`;
        } else if (err.response.status === 500) {
          specificErrorMessage = `A server error occurred while trying to delete service record "${currentRecordName}". The record might be in use or another issue prevented deletion. Please contact support.`;
        } else if (err.response.data?.detail) {
          specificErrorMessage = `Error deleting service record "${currentRecordName}": ${err.response.data.detail}`;
        }
      } else if (err.request) {
        specificErrorMessage = `No response from server while trying to delete service record "${currentRecordName}". Please check your network connection.`;
      } else if (err.code === 'ECONNABORTED') {
        specificErrorMessage = `Request to delete service record "${currentRecordName}" timed out. Please try again.`;
      }
      setDeleteErrorMessage(specificErrorMessage);
      setDeleteConfirm(null);
      setShowDeleteError(true);
    } finally {
      setDeletingRecord(false);
      setRecordNameToDelete("");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setDeletingRecord(false);
    setRecordNameToDelete("");
  };

  const handleEdit = (id: number) => {
    navigate(`/catalogs/customer/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/catalogs/customer/add");
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setDeletedRecordId(null);
    setDeletedRecordName("");
    setSuccess("");
  };

  const closeDeleteErrorModal = () => {
    setShowDeleteError(false);
    setDeleteErrorMessage("");
    setDependentRecordsInfo([]);
  };

  const SuccessAlert = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
        <div className="bg-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center text-[#002057]">
            Success
          </h2>
          <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
        </div>

        <div className="bg-[#1E2A45] py-8 px-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-lg">
              Service record "{deletedRecordName}" has been successfully deleted!
            </p>
          </div>

          <div className="mt-8">
            <button
              ref={deleteSuccessOkButtonRef}
              onClick={handleSuccessClose}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSuccessClose();
                }
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded transition-all"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AISGBackground>
      {showSuccessModal && <SuccessAlert />}

      <div className="flex flex-col h-screen w-full font-['Montserrat']">
        <div className="flex-shrink-0 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Services by Airline</h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
            <p className="text-gray-200 mt-2 font-light">
              Manage the relationship between services and airlines with specific parameters
            </p>
          </div>

          {error && !showDeleteError && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-2/3 relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
                placeholder="Search by fuselage type, client, service, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              disabled={isLoading || deletingRecord}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service by Airline
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          <div className="h-full w-full overflow-auto">
            {isLoading && !deleteConfirm && !deletingRecord ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
              </div>
            ) : (
              <table className="border-collapse" style={{ minWidth: 'max-content' }}>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-white text-[#002057]">
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Service</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Client</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Company</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Minutes Included</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Minutes Minimum</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Fuselage Type</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Technicians Included</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Created/Modified By</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Created At</th>
                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Updated At</th>
                    <th className="px-3 py-4 text-center font-semibold border border-[#cccccc] text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {displayedRecords.length > 0 ? (
                    displayedRecords.map((r) => (
                      <tr key={r.id_service_per_customer} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.service_name_from_endpoint}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.client_name_from_endpoint}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.company_name_from_endpoint}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap text-center">{r.minutes_included}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap text-center">{r.minutes_minimum}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.fuselage_type}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap text-center">{r.technicians_included}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.whonew}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.create_at ? new Date(r.create_at).toLocaleDateString() : ""}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.updated_at ? new Date(r.updated_at).toLocaleDateString() : ""}</td>
                        <td className="px-3 py-4 border border-[#1e3462] whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(r.id_service_per_customer)}
                              className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit"
                              disabled={isLoading || deletingRecord || !!deleteConfirm}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(r)}
                              disabled={isLoading || deletingRecord || !!deleteConfirm}
                              className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              {deletingRecord && deleteConfirm === r.id_service_per_customer ? (
                                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-6 py-8 text-center text-white bg-transparent">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
              <div className="bg-white py-4 px-6">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Confirm Deletion
                </h2>
                <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
              </div>
              <div className="bg-[#1E2A45] py-8 px-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 rounded-full p-2 flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-white text-lg mt-1">
                    Are you sure you want to delete service record "{recordNameToDelete}"? This action cannot be undone.
                  </p>
                </div>
                <div className="mt-8 flex gap-3">
                  {deletingRecord ? (
                    <div className="w-full flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelDelete}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCancelDelete();
                          }
                        }}
                        className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        ref={deleteConfirmButtonRef}
                        onClick={() => handleDelete(deleteConfirm!)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleDelete(deleteConfirm!);
                          }
                        }}
                        className="w-1/2 bg-[#e6001f] hover:bg-red-700 text-white font-medium py-3 px-4 rounded transition-all"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-lg w-full mx-4 rounded-lg shadow-xl">
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Cannot Delete Service Record
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
              <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                <div className="flex items-start mb-4">
                  <div className="bg-[#f59e0b] rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg mb-2">
                      {deleteErrorMessage}
                    </p>
                    {dependentRecordsInfo.length > 0 && (
                      <div className="mt-3">
                        <p className="text-white text-sm font-medium mb-1">Potential related records:</p>
                        <div className="bg-[#0D1423] rounded-lg p-2 max-h-28 overflow-y-auto">
                          {dependentRecordsInfo.map((record, index) => (
                            <div key={index} className="text-gray-300 text-xs py-0.5">
                              • {record.type}: {record.name || record.id}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    ref={deleteErrorOkButtonRef}
                    onClick={closeDeleteErrorModal}
                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AISGBackground>
  );
};

export default ServicePerCustomer;