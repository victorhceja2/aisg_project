import React, { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServiceCategory: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para los popups de eliminación
    const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
    const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{id: number, name: string} | null>(null);
    
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/catalog/service-categories/${search ? `?search=${encodeURIComponent(search)}` : ""}`
            );
            setCategories(res.data);
            setError(null);
        } catch {
            setError("Could not load service categories. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Mostrar el popup de confirmación de eliminación
    const confirmDelete = (id: number, name: string) => {
        setCategoryToDelete({ id, name });
        setShowDeleteConfirmPopup(true);
    };

    // Ejecutar la eliminación después de confirmar
    const handleDelete = async () => {
        if (!categoryToDelete) return;
        
        try {
            setLoading(true);
            await axiosInstance.delete(`/catalog/service-categories/${categoryToDelete.id}`);
            
            // Ocultar el popup de confirmación
            setShowDeleteConfirmPopup(false);
            
            // Mostrar mensaje de éxito
            setShowDeleteSuccessPopup(true);
            
            // Refrescar la lista de categorías
            await fetchCategories();
            setError(null);
        } catch (err) {
            setShowDeleteConfirmPopup(false);
            setError("Could not delete the service category. It may be used by an active service.");
            setLoading(false);
        }
    };

    // Cerrar el popup de éxito
    const handleCloseSuccessPopup = () => {
        setShowDeleteSuccessPopup(false);
    };

    // Cancelar la eliminación
    const cancelDelete = () => {
        setCategoryToDelete(null);
        setShowDeleteConfirmPopup(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [search]);

    return (
        <AISGBackground>
            <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Service Category Catalog</h1>
                    <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                    <p className="text-gray-200 mt-2 font-light">
                        Manage the different service categories
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full md:w-2/3 relative">
                        <input
                            type="text"
                            placeholder="Search service category..."
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
                        to="/catalogs/servicecategory/add"
                        className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Service Category
                    </Link>
                </div>
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md">
                        <p className="font-medium">{error}</p>
                    </div>
                )}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12 bg-transparent">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Created By</th>
                                    <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Created At</th>
                                    <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">Updated At</th>
                                    <th className="px-4 py-3 text-center font-semibold text-[#002057] border border-[#cccccc]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-white bg-transparent">
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id_service_category} className="bg-transparent">
                                            <td className="px-4 py-3 border border-[#1e3462] font-medium text-white">{cat.service_category_name}</td>
                                            <td className="px-4 py-3 border border-[#1e3462] text-white">{cat.whonew || "-"}</td>
                                            <td className="px-4 py-3 border border-[#1e3462] text-white">
                                                {cat.create_at ? new Date(cat.create_at).toLocaleString() : "-"}
                                            </td>
                                            <td className="px-4 py-3 border border-[#1e3462] text-white">
                                                {cat.updated_at ? new Date(cat.updated_at).toLocaleString() : "-"}
                                            </td>
                                            <td className="px-4 py-3 border border-[#1e3462]">
                                                <div className="flex justify-center space-x-2">
                                                    <Link
                                                        to={`/catalogs/servicecategory/edit/${cat.id_service_category}`}
                                                        className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(cat.id_service_category, cat.service_category_name)}
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

            {/* Popup de confirmación de eliminación */}
            {showDeleteConfirmPopup && categoryToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        {/* Encabezado blanco con texto azul */}
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">
                                Confirm Deletion
                            </h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        
                        {/* Cuerpo con fondo azul oscuro */}
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4 justify-center">
                                <div className="bg-[#e6001f] rounded-full p-2 mr-4">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-lg font-medium">Are you sure you want to delete?</p>
                                    <p className="text-gray-300 mt-1">
                                        The category "{categoryToDelete.name}" will be permanently deleted.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    onClick={cancelDelete}
                                    className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-1/2 bg-[#e6001f] hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Popup de éxito después de eliminar */}
            {showDeleteSuccessPopup && (
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
                                <p className="text-white text-lg">The service category has been successfully deleted!</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    onClick={handleCloseSuccessPopup}
                                    className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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

export default CatalogServiceCategory;