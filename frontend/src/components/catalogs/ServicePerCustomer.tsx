import React, { useEffect, useState, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

interface ServicePerCustomerRecord {
  id_service_per_customer: number;
  id_service: number;
  id_client: number;
  company: string;
  minutes_included: number;
  minutes_minimum: number;
  fuselage_type: string;
  technicians_included: number;
  whonew: string;
  create_at: string;
  updated_at: string;
}

const ServicePerCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ServicePerCustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);

  // Estados para modales de eliminación
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deletedRecordId, setDeletedRecordId] = useState<number | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);

  // Referencias para manejar el foco
  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Efecto para enfocar el botón OK del popup de éxito de eliminación
  useEffect(() => {
    if (showSuccessModal && deleteSuccessOkButtonRef.current) {
      setTimeout(() => {
        deleteSuccessOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showSuccessModal]);

  // Efecto para enfocar el botón Delete del popup de confirmación
  useEffect(() => {
    if (deleteConfirm && deleteConfirmButtonRef.current) {
      setTimeout(() => {
        deleteConfirmButtonRef.current?.focus();
      }, 100);
    }
  }, [deleteConfirm]);

  // Efecto para enfocar el botón OK del popup de error
  useEffect(() => {
    if (showDeleteError && deleteErrorOkButtonRef.current) {
      setTimeout(() => {
        deleteErrorOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteError]);

  // Efecto para manejar Enter en los popups
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

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(
        `/catalog/service-per-customer${search ? `?fuselage_type=${encodeURIComponent(search)}` : ""}`,
        { timeout: 30000 }
      );
      setRecords(res.data || []);
      setIsLoading(false);
    } catch (err: any) {
      let errorMessage = "Could not load data. Please try again.";
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The server took too long to respond.";
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  /**
   * Verificar si un servicio por cliente está siendo utilizado por otros módulos
   */
  const checkServiceUsage = async (serviceId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      // Verificar en extra service sale assignments
      const extraServiceRes = await axiosInstance.get('/catalog/extra-service-sale-assignment');
      const extraServiceUsingService = extraServiceRes.data.filter((esa: any) => 
        esa.id_service_per_customer === serviceId
      );

      // Verificar en work orders
      const workOrdersRes = await axiosInstance.get('/work-orders');
      const workOrdersUsingService = workOrdersRes.data.filter((wo: any) => 
        wo.id_service_per_customer === serviceId
      );

      // Verificar en quotes/proposals
      const quotesRes = await axiosInstance.get('/quotes');
      const quotesUsingService = quotesRes.data.filter((quote: any) => 
        quote.id_service_per_customer === serviceId
      );

      // Verificar en billing/invoices
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
    // Verificar si el servicio está siendo utilizado
    const { inUse, records } = await checkServiceUsage(id);
    
    if (inUse) {
      // Mostrar popup de error con la lista de registros que lo utilizan
      setDependentRecords(records);
      setDeleteErrorMessage(
        `Cannot delete service record #${id} because it is being used by ${records.length} record(s) in the system.`
      );
      setShowDeleteError(true);
      return;
    }

    // Si no está en uso, proceder con la confirmación de eliminación
    setDeleteConfirm(id);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingRecord(true);
      setError("");
      
      // Verificar una vez más antes de eliminar
      const { inUse, records } = await checkServiceUsage(id);
      
      if (inUse) {
        // Si ahora está en uso, mostrar error
        setDependentRecords(records);
        setDeleteErrorMessage(
          `Cannot delete service record #${id} because it is being used by ${records.length} record(s) in the system.`
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
      console.error("Error al eliminar servicio", err);
      
      // Verificar si el error es por dependencias
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

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, [search]);

  // Modal de alerta de éxito
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
      {/* Render modal de éxito si showSuccessModal es true */}
      {showSuccessModal && <SuccessAlert />}

      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
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

        <div className="overflow-x-auto">
          {isLoading && !deleteConfirm ? (
            <div className="flex justify-center py-12 bg-transparent">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white text-[#002057]">
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">Company</th>
                  <th className="px-4 py-3 text-left font-semibold">Minutes Included</th>
                  <th className="px-4 py-3 text-left font-semibold">Minutes Minimum</th>
                  <th className="px-4 py-3 text-left font-semibold">Fuselage Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Technicians Included</th>
                  <th className="px-4 py-3 text-left font-semibold">Created/Modified By</th>
                  <th className="px-4 py-3 text-left font-semibold">Created At</th>
                  <th className="px-4 py-3 text-left font-semibold">Updated At</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#1E2A45]">
                {records.length > 0 ? (
                  records.map((r) => (
                    <tr key={r.id_service_per_customer} className="hover:bg-[#1E2A45] transition-colors">
                      <td className="px-4 py-3 text-white">{r.id_service}</td>
                      <td className="px-4 py-3 text-white">{r.id_client}</td>
                      <td className="px-4 py-3 text-white">{r.company}</td>
                      <td className="px-4 py-3 text-white">{r.minutes_included}</td>
                      <td className="px-4 py-3 text-white">{r.minutes_minimum}</td>
                      <td className="px-4 py-3 text-white">{r.fuselage_type}</td>
                      <td className="px-4 py-3 text-white">{r.technicians_included}</td>
                      <td className="px-4 py-3 text-white">{r.whonew}</td>
                      <td className="px-4 py-3 text-white">{r.create_at ? r.create_at.split("T")[0] : ""}</td>
                      <td className="px-4 py-3 text-white">{r.updated_at ? r.updated_at.split("T")[0] : ""}</td>
                      <td className="px-4 py-3 text-center">
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
                    <td colSpan={11} className="px-6 py-8 text-center text-white">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
              {/* Encabezado blanco con texto azul */}
              <div className="bg-white py-4 px-6">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Confirm Deletion
                </h2>
                <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
              </div>

              {/* Cuerpo con fondo azul oscuro */}
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
                        onClick={() => handleDelete(deleteConfirm)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleDelete(deleteConfirm);
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

        {/* Popup de error de eliminación (registro en uso) */}
        {showDeleteError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-hidden max-w-lg w-full mx-4 rounded-lg shadow-xl">
              {/* Encabezado blanco con texto azul */}
              <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#002057]">
                  Cannot Delete Record
                </h2>
                <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
              </div>
              
              {/* Cuerpo con fondo azul oscuro */}
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