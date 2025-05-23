import React, { useState, useEffect } from "react";
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
    const [serviceTypeToDelete, setServiceTypeToDelete] = useState<{id: number, name: string} | null>(null);
    const [deletedServiceTypeName, setDeletedServiceTypeName] = useState("");
    const [deletingServiceType, setDeletingServiceType] = useState(false);

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

    const confirmDelete = (id: number, name: string) => {
        setServiceTypeToDelete({ id, name });
        setShowDeleteConfirmation(true);
    };

    const handleDelete = async () => {
        if (!serviceTypeToDelete) return;
        
        try {
            setDeletingServiceType(true);
            await axiosInstance.delete(`/catalog/service-types/${serviceTypeToDelete.id}`);
            setDeletedServiceTypeName(serviceTypeToDelete.name);
            setShowDeleteConfirmation(false);
            setServiceTypeToDelete(null);
            fetchServiceTypes();
            setError(null);
            setShowDeleteSuccess(true);
        } catch (err: any) {
            let errorMessage = "Could not delete the service type. It may be used by an active service.";
            
            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            }
            
            setError(errorMessage);
            setShowDeleteConfirmation(false);
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
                                                        className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
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
                                            className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
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
                                    onClick={closeSuccessModal}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded transition-all"
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

export default CatalogServiceType;