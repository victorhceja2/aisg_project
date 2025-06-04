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
 * - /catalog/extra-service-sale-assignment, /work-orders, /quotes, /billing/invoices:
 *   para verificar si un servicio puede ser eliminado (dependencias)
 * 
 * Incluye modales para confirmación de eliminación, notificación de éxito y errores
 * con accesibilidad mediante teclado integrada.
 */
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

interface ClientData {
  llave: string;
  nombre: string;
  comercial?: string;
}

interface ServiceData {
  id_service: number;
  service_name: string;
  service_code: string;
}

interface CompanyData {
  companyCode: string;
  companyName: string;
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
  const [clients, setClients] = useState<ClientData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
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
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);

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

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get<ClientData[]>('/catalog/clients');
      console.log("Clients fetched:", res.data);
      setClients(res.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(prevError => prevError ? `${prevError} Could not load client names.` : "Could not load client names.");
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get<ServiceData[]>('/catalog/services');
      console.log("Services fetched:", res.data);
      setServices(res.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(prevError => prevError ? `${prevError} Could not load service names.` : "Could not load service names.");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get<CompanyData[]>('/companies/');
      console.log("Companies fetched:", res.data);
      setCompanies(res.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(prevError => prevError ? `${prevError} Could not load company names.` : "Could not load company names.");
    }
  };

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get<ServicePerCustomerRecord[]>(
        `/catalog/service-per-customer${search ? `?fuselage_type=${encodeURIComponent(search)}` : ""}`,
        { timeout: 30000 }
      );
      console.log("Service records fetched:", res.data);
      setRecords(res.data || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching service records:", err);

      let errorMessage = "Could not load data. Please try again.";

      if (err.response) {
        // Error con respuesta del servidor
        if (err.response.status === 500) {
          errorMessage = "Server error: The server encountered an internal error. Please contact the administrator.";
          console.error("Server response data:", err.response.data);
        } else {
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        // Error sin respuesta del servidor
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        // Error en la configuración de la solicitud
        errorMessage = `Request error: ${err.message}`;
      }

      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The server took too long to respond.";
      }

      setError(errorMessage);
      // Establecer records como array vacío para evitar problemas con datos anteriores
      setRecords([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchServices();
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [search]);

  useEffect(() => {
    if (records.length > 0 && clients.length > 0 && services.length > 0 && companies.length > 0) {
      console.log("Processing records with clients, services and companies");
      
      const newDisplayedRecords = records.map(record => {
        // Find client name
        const client = clients.find(c => {
          return (
            c.llave === record.id_client.toString() ||
            c.llave === record.id_client ||
            parseInt(c.llave) === record.id_client
          );
        });

        // Find service name
        const service = services.find(s => s.id_service === record.id_service);
        
        // Find company name
        const company = companies.find(c => {
          // Match by ID if company has numeric ID or by companyCode if string
          return c.companyCode === record.id_company.toString() || 
                 (c as any).id === record.id_company;
        });

        const clientName = client ?
          (client.nombre || client.comercial || `Client ID: ${record.id_client}`) :
          `Missing Client Data (ID: ${record.id_client})`;

        const serviceName = service ? 
          `${service.service_code} - ${service.service_name}` : 
          `Missing Service Data (ID: ${record.id_service})`;

        const companyName = company ? 
          company.companyName : 
          `Missing Company Data (ID: ${record.id_company})`;

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
  }, [records, clients, services, companies]);

  const checkServiceUsage = async (serviceId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      const extraServiceRes = await axiosInstance.get('/catalog/extra-service-sale-assignment');
      const extraServiceUsingService = extraServiceRes.data.filter((esa: any) =>
        esa.id_service_per_customer === serviceId
      );

      const workOrdersRes = await axiosInstance.get('/work-orders');
      const workOrdersUsingService = workOrdersRes.data.filter((wo: any) =>
        wo.id_service_per_customer === serviceId
      );

      const quotesRes = await axiosInstance.get('/quotes');
      const quotesUsingService = quotesRes.data.filter((quote: any) =>
        quote.id_service_per_customer === serviceId
      );

      const billingRes = await axiosInstance.get('/billing/invoices');
      const billingUsingService = billingRes.data.filter((invoice: any) =>
        invoice.id_service_per_customer === serviceId
      );

      const allDependentRecords = [
        ...extraServiceUsingService.map((esa: any) => ({
          type: 'Extra Service Assignment',
          name: `Work Order: ${esa.work_order || esa.id_xtra_sale_employee}`,
          id: esa.id_xtra_sale_employee
        })),
        ...workOrdersUsingService.map((wo: any) => ({
          type: 'Work Order',
          name: `Work Order: ${wo.work_order_number || wo.id}`,
          id: wo.id
        })),
        ...quotesUsingService.map((quote: any) => ({
          type: 'Quote',
          name: `Quote: ${quote.quote_number || quote.id}`,
          id: quote.id
        })),
        ...billingUsingService.map((invoice: any) => ({
          type: 'Invoice',
          name: `Invoice: ${invoice.invoice_number || invoice.id}`,
          id: invoice.id
        }))
      ];

      return {
        inUse: allDependentRecords.length > 0,
        records: allDependentRecords
      };
    } catch (err) {
      console.error("Error checking service usage:", err);
      return { inUse: false, records: [] };
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    const { inUse, records: dependentRecs } = await checkServiceUsage(id);

    if (inUse) {
      setDependentRecords(dependentRecs);
      setDeleteErrorMessage(
        `Cannot delete service record #${id} because it is being used by ${dependentRecs.length} record(s) in the system.`
      );
      setShowDeleteError(true);
      return;
    }
    setDeleteConfirm(id);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingRecord(true);
      setError("");

      const { inUse, records: dependentRecs } = await checkServiceUsage(id);

      if (inUse) {
        setDependentRecords(dependentRecs);
        setDeleteErrorMessage(
          `Cannot delete service record #${id} because it is being used by ${dependentRecs.length} record(s) in the system.`
        );
        setDeleteConfirm(null);
        setShowDeleteError(true);
        return;
      }

      await axiosInstance.delete(`/catalog/service-per-customer/${id}`, { timeout: 15000 });
      setDeletedRecordId(id);
      await fetchRecords();
      setDeleteConfirm(null);
      setShowSuccessModal(true);
      setSuccess("Record deleted successfully");
    } catch (err: any) {
      console.error("Error deleting service", err);

      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete service record #${id} because it is being used by other records in the system.`
        );
        setDeleteConfirm(null);
        setShowDeleteError(true);
      } else {
        let errorMessage = "Could not delete record.";
        if (err.response) {
          errorMessage = `Delete failed: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage = "No response received during delete operation.";
        } else {
          errorMessage = `Delete error: ${err.message}`;
        }
        setError(errorMessage);
        setDeleteConfirm(null);
      }
    } finally {
      setDeletingRecord(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
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
  };

  const closeDeleteErrorModal = () => {
    setShowDeleteError(false);
    setDeleteErrorMessage("");
    setDependentRecords([]);
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
              Service record #{deletedRecordId} has been successfully deleted!
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

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-2/3 relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
                placeholder="Search by fuselage type..."
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
              disabled={isLoading}
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
            {isLoading && !deleteConfirm ? (
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
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.minutes_included}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.minutes_minimum}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.fuselage_type}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.technicians_included}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.whonew}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.create_at ? r.create_at.split("T")[0] : ""}</td>
                        <td className="px-3 py-4 border border-[#1e3462] text-white text-sm whitespace-nowrap">{r.updated_at ? r.updated_at.split("T")[0] : ""}</td>
                        <td className="px-3 py-4 border border-[#1e3462] whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(r.id_service_per_customer)}
                              className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                              title="Edit"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(r.id_service_per_customer)}
                              className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors"
                              title="Delete"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                    Are you sure you want to delete service record #{deleteConfirm}? This action cannot be undone.
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
                  Cannot Delete Record
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
                    <p className="text-white text-lg mb-4">
                      {deleteErrorMessage}
                    </p>
                    {dependentRecords.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white text-sm font-medium mb-2">Records using this service:</p>
                        <div className="bg-[#0D1423] rounded-lg p-3 max-h-32 overflow-y-auto">
                          {dependentRecords.map((record, index) => (
                            <div key={index} className="text-gray-300 text-sm py-1">
                              • {record.type}: {record.name}
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
                    OK
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