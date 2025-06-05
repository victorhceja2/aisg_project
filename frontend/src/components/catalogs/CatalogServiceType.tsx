import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServiceType: React.FC = () => {
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Estados para modales
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [showDeleteError, setShowDeleteError] = useState(false);
    const [serviceTypeToDelete, setServiceTypeToDelete] = useState<{id: number, name: string} | null>(null);
    const [deletedServiceTypeName, setDeletedServiceTypeName] = useState("");
    const [deletingServiceType, setDeletingServiceType] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
    const [dependentRecords, setDependentRecords] = useState<any[]>([]);

    // Referencias para manejar el foco
    const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
    const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
    const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

    // Efecto para enfocar el botón OK del popup de éxito de eliminación
    useEffect(() => {
        if (showDeleteSuccess && deleteSuccessOkButtonRef.current) {
            setTimeout(() => {
                deleteSuccessOkButtonRef.current?.focus();
            }, 100);
        }
    }, [showDeleteSuccess]);

    // Efecto para enfocar el botón Delete del popup de confirmación
    useEffect(() => {
        if (showDeleteConfirmation && deleteConfirmButtonRef.current) {
            setTimeout(() => {
                deleteConfirmButtonRef.current?.focus();
            }, 100);
        }
    }, [showDeleteConfirmation]);

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
                if (showDeleteSuccess) {
                    e.preventDefault();
                    closeSuccessModal();
                } else if (showDeleteConfirmation && !deletingServiceType) {
                    e.preventDefault();
                    handleDelete();
                } else if (showDeleteError) {
                    e.preventDefault();
                    closeDeleteErrorModal();
                }
            } else if (e.key === 'Escape') {
                if (showDeleteConfirmation && !deletingServiceType) {
                    e.preventDefault();
                    cancelDelete();
                } else if (showDeleteSuccess) {
                    e.preventDefault();
                    closeSuccessModal();
                } else if (showDeleteError) {
                    e.preventDefault();
                    closeDeleteErrorModal();
                }
            }
        };

        if (showDeleteConfirmation || showDeleteSuccess || showDeleteError) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showDeleteConfirmation, showDeleteSuccess, showDeleteError, deletingServiceType]);

    const fetchServiceTypes = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/catalog/service-types/${search ? `?search=${encodeURIComponent(search)}` : ""}`
            );
            setServiceTypes(res.data);
            setError(null);
        } catch (err) {
            setError("Could not load service types. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Verificar si un service type está siendo utilizado por diferentes módulos
    const checkServiceTypeUsage = async (typeId: number): Promise<{ inUse: boolean; records: any[] }> => {
        try {
            const allDependentRecords: any[] = [];

            // Verificar en servicios
            try {
                const servicesRes = await axiosInstance.get('/catalog/services');
                const servicesUsingType = servicesRes.data.filter((service: any) => 
                    service.id_service_type === typeId
                );
                allDependentRecords.push(
                    ...servicesUsingType.map((service: any) => ({
                        type: 'Service',
                        name: `${service.service_code} - ${service.service_name}`,
                        id: service.id_service
                    }))
                );
            } catch (err) {
                console.warn("Error checking services:", err);
            }

            // Verificar en componentes (módulo principal que utiliza service types)
            try {
                const componentsRes = await axiosInstance.get('/components');
                const componentsUsingType = componentsRes.data.filter((comp: any) => 
                    comp.id_service_type === typeId ||
                    comp.service_type_id === typeId ||
                    comp.type_id === typeId
                );
                allDependentRecords.push(
                    ...componentsUsingType.map((comp: any) => ({
                        type: 'Component',
                        name: `Component: ${comp.component_name || comp.component_number || comp.id}`,
                        id: comp.id
                    }))
                );
            } catch (err) {
                console.warn("Error checking components:", err);
            }

            // Verificar en customer services
            try {
                const customerServicesRes = await axiosInstance.get('/catalog/service-per-customer');
                const customerServicesUsingType = customerServicesRes.data.filter((cs: any) => {
                    // Verificar si el servicio del customer service usa este tipo
                    return cs.service_type_id === typeId;
                });
                allDependentRecords.push(
                    ...customerServicesUsingType.map((cs: any) => ({
                        type: 'Customer Service',
                        name: `Customer ID: ${cs.id_customer} - Service: ${cs.service_name || cs.id_service}`,
                        id: cs.id_service_per_customer
                    }))
                );
            } catch (err) {
                console.warn("Error checking customer services:", err);
            }

            // Verificar en work orders
            try {
                const workOrdersRes = await axiosInstance.get('/work-orders');
                const workOrdersUsingType = workOrdersRes.data.filter((wo: any) => 
                    wo.service_type_id === typeId
                );
                allDependentRecords.push(
                    ...workOrdersUsingType.map((wo: any) => ({
                        type: 'Work Order',
                        name: `Work Order: ${wo.work_order_number || wo.id}`,
                        id: wo.id
                    }))
                );
            } catch (err) {
                console.warn("Error checking work orders:", err);
            }

            // Verificar en cotizaciones/quotes
            try {
                const quotesRes = await axiosInstance.get('/quotes');
                const quotesUsingType = quotesRes.data.filter((quote: any) => 
                    quote.service_type_id === typeId
                );
                allDependentRecords.push(
                    ...quotesUsingType.map((quote: any) => ({
                        type: 'Quote',
                        name: `Quote: ${quote.quote_number || quote.id}`,
                        id: quote.id
                    }))
                );
            } catch (err) {
                console.warn("Error checking quotes:", err);
            }

            // Verificar en reportes operacionales
            try {
                const operationReportsRes = await axiosInstance.get('/reports/operation-report');
                const reportsUsingType = operationReportsRes.data.filter((report: any) => 
                    report.type_id === typeId
                );
                allDependentRecords.push(
                    ...reportsUsingType.map((report: any) => ({
                        type: 'Operation Report',
                        name: `Report: ${report.cliente} - ${report.servicio_principal}`,
                        id: report.id
                    }))
                );
            } catch (err) {
                console.warn("Error checking operation reports:", err);
            }

            // Verificar en ejecuciones de servicio
            try {
                const serviceExecutionsRes = await axiosInstance.get('/reports/service-executions');
                const executionsUsingType = serviceExecutionsRes.data.filter((exec: any) => 
                    exec.type_id === typeId
                );
                allDependentRecords.push(
                    ...executionsUsingType.map((exec: any) => ({
                        type: 'Service Execution',
                        name: `Execution: Work Order ${exec.work_order}`,
                        id: exec.id
                    }))
                );
            } catch (err) {
                console.warn("Error checking service executions:", err);
            }

            // Verificar en facturas/invoices
            try {
                const invoicesRes = await axiosInstance.get('/billing/invoices');
                const invoicesUsingType = invoicesRes.data.filter((invoice: any) => 
                    invoice.type_id === typeId
                );
                allDependentRecords.push(
                    ...invoicesUsingType.map((invoice: any) => ({
                        type: 'Invoice',
                        name: `Invoice: ${invoice.invoice_number || invoice.id}`,
                        id: invoice.id
                    }))
                );
            } catch (err) {
                console.warn("Error checking invoices:", err);
            }

            return {
                inUse: allDependentRecords.length > 0,
                records: allDependentRecords
            };
        } catch (err) {
            console.error("Error checking service type usage:", err);
            return { inUse: false, records: [] };
        }
    };

    const confirmDelete = async (id: number, name: string) => {
        setDeletingServiceType(true);
        
        // Verificar si el service type está siendo utilizado
        const { inUse } = await checkServiceTypeUsage(id);
        
        setDeletingServiceType(false);
        
        if (inUse) {
            // Mostrar popup de error simplificado
            setDeleteErrorMessage(
                `Cannot delete service type "${name}" because it is currently being used in the system.`
            );
            setShowDeleteError(true);
            return;
        }

        // Si no está en uso, proceder con la confirmación de eliminación
        setServiceTypeToDelete({ id, name });
        setShowDeleteConfirmation(true);
    };

    const handleDelete = async () => {
        if (!serviceTypeToDelete) return;
        
        try {
            setDeletingServiceType(true);
            
            // Verificar una vez más antes de eliminar
            const { inUse } = await checkServiceTypeUsage(serviceTypeToDelete.id);
            
            if (inUse) {
                // Si ahora está en uso, mostrar error simplificado
                setDeleteErrorMessage(
                    `Cannot delete service type "${serviceTypeToDelete.name}" because it is currently being used in the system.`
                );
                setShowDeleteConfirmation(false);
                setShowDeleteError(true);
                setServiceTypeToDelete(null);
                return;
            }

            await axiosInstance.delete(`/catalog/service-types/${serviceTypeToDelete.id}`);
            setDeletedServiceTypeName(serviceTypeToDelete.name);
            setShowDeleteConfirmation(false);
            setServiceTypeToDelete(null);
            fetchServiceTypes();
            setError(null);
            setShowDeleteSuccess(true);
        } catch (err: any) {
            console.error("Error deleting service type:", err);
            
            // Verificar si el error es por dependencias
            if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
                setDeleteErrorMessage(
                    `Cannot delete service type "${serviceTypeToDelete.name}" because it is currently being used in the system.`
                );
                setShowDeleteConfirmation(false);
                setShowDeleteError(true);
            } else {
                let errorMessage = "Could not delete the service type. It may be used by an active service.";
                
                if (err.response?.data?.detail) {
                    errorMessage = err.response.data.detail;
                }
                
                setError(errorMessage);
                setShowDeleteConfirmation(false);
            }
            
            setServiceTypeToDelete(null);
        } finally {
            setDeletingServiceType(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setServiceTypeToDelete(null);
    };

    const closeSuccessModal = () => {
        setShowDeleteSuccess(false);
        setDeletedServiceTypeName("");
    };

    const closeDeleteErrorModal = () => {
        setShowDeleteError(false);
        setDeleteErrorMessage("");
        setDependentRecords([]);
    };

    useEffect(() => {
        fetchServiceTypes();
    }, [search]);

    return (
        <AISGBackground>
            <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Service Types Catalog</h1>
                    <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                    <p className="text-gray-200 mt-2 font-light">
                        Manage the different service types
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full md:w-2/3 relative">
                        <input
                            type="text"
                            placeholder="Search service type..."
                            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <Link
                        to="/catalogs/servicetype/add"
                        className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Service Type
                    </Link>
                </div>
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                        <p className="font-medium">{error}</p>
                    </div>
                )}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12 bg-transparent">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white text-[#002057]">
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Created/Modified By</th>
                                    <th className="px-4 py-3 text-left font-semibold">Created At</th>
                                    <th className="px-4 py-3 text-left font-semibold">Updated At</th>
                                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-[#1E2A45]">
                                {serviceTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-white">
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    serviceTypes.map((t) => (
                                        <tr key={t.id_service_type} className="hover:bg-[#1E2A45] transition-colors">
                                            <td className="px-4 py-3 text-white font-medium">{t.service_type_name}</td>
                                            <td className="px-4 py-3 text-white">{t.whonew || "-"}</td>
                                            <td className="px-4 py-3 text-white">
                                                {t.create_at ? new Date(t.create_at).toLocaleString() : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-white">
                                                {t.updated_at ? new Date(t.updated_at).toLocaleString() : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center space-x-2">
                                                    <Link
                                                        to={`/catalogs/servicetype/edit/${t.id_service_type}`}
                                                        className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(t.id_service_type, t.service_type_name)}
                                                        disabled={deletingServiceType}
                                                        className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deletingServiceType ? (
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
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteConfirmation && serviceTypeToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                                    Are you sure you want to delete the service type "{serviceTypeToDelete.name}"? This action cannot be undone.
                                </p>
                            </div>

                            {/* Botones uno al lado del otro como en la imagen */}
                            <div className="mt-8 flex gap-3">
                                {deletingServiceType ? (
                                    <div className="w-full flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={cancelDelete}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    cancelDelete();
                                                }
                                            }}
                                            className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            ref={deleteConfirmButtonRef}
                                            onClick={handleDelete}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleDelete();
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

            {/* Modal de éxito después de eliminar */}
            {showDeleteSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                                    Service type "{deletedServiceTypeName}" has been successfully deleted!
                                </p>
                            </div>

                            <div className="mt-8">
                                <button
                                    ref={deleteSuccessOkButtonRef}
                                    onClick={closeSuccessModal}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            closeSuccessModal();
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
            )}

            {/* Popup de error de eliminación (registro en uso) */}
            {showDeleteError && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        {/* Encabezado blanco con texto azul */}
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">
                                Cannot Delete Service Type
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
        </AISGBackground>
    );
};

export default CatalogServiceType;