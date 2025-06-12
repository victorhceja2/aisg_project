import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';
import { Link } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServiceCategory: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Popups y control de eliminación
    const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
    const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
    const [showDeleteErrorPopup, setShowDeleteErrorPopup] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{id: number, name: string} | null>(null);
    const [deletedCategoryName, setDeletedCategoryName] = useState<string>("");
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Refs para foco en popups
    const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
    const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
    const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

    // Foco en popups
    useEffect(() => { if (showDeleteSuccessPopup) setTimeout(() => deleteSuccessOkButtonRef.current?.focus(), 100); }, [showDeleteSuccessPopup]);
    useEffect(() => { if (showDeleteConfirmPopup) setTimeout(() => deleteConfirmButtonRef.current?.focus(), 100); }, [showDeleteConfirmPopup]);
    useEffect(() => { if (showDeleteErrorPopup) setTimeout(() => deleteErrorOkButtonRef.current?.focus(), 100); }, [showDeleteErrorPopup]);

    // Teclas en popups
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (showDeleteSuccessPopup) { e.preventDefault(); handleCloseSuccessPopup(); }
                else if (showDeleteConfirmPopup && !isDeleting) { e.preventDefault(); handleDelete(); }
                else if (showDeleteErrorPopup) { e.preventDefault(); closeDeleteErrorPopup(); }
            } else if (e.key === 'Escape') {
                if (showDeleteConfirmPopup && !isDeleting) { e.preventDefault(); cancelDelete(); }
                else if (showDeleteSuccessPopup) { e.preventDefault(); handleCloseSuccessPopup(); }
                else if (showDeleteErrorPopup) { e.preventDefault(); closeDeleteErrorPopup(); }
            }
        };
        if (showDeleteConfirmPopup || showDeleteSuccessPopup || showDeleteErrorPopup) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showDeleteConfirmPopup, showDeleteSuccessPopup, showDeleteErrorPopup, isDeleting]);

    // Cargar categorías
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/catalog/service-categories`);
            setAllCategories(res.data);
            setCategories(res.data);
            setError(null);
        } catch {
            setError("Could not load service categories. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Filtro frontend
    useEffect(() => {
        setCategories(
            search.trim() === ""
                ? allCategories
                : allCategories.filter(cat =>
                    (cat.service_category_name || "")
                        .toLowerCase()
                        .includes(search.trim().toLowerCase())
                )
        );
    }, [search, allCategories]);

    // Verificar dependencias de categoría
    const checkCategoryUsage = async (categoryId: number) => {
        try {
            const endpoints = [
                { url: '/catalog/services', key: 'id_service_category', label: 'Service', name: (s: any) => `${s.service_code} - ${s.service_name}`, id: (s: any) => s.id_service },
                { url: '/components', key: 'id_service_category', label: 'Component', name: (c: any) => `Component: ${c.component_name || c.component_number || c.id}`, id: (c: any) => c.id },
                { url: '/components', key: 'category_id', label: 'Component', name: (c: any) => `Component: ${c.component_name || c.component_number || c.id}`, id: (c: any) => c.id },
                { url: '/catalog/service-per-customer', key: 'service_category_id', label: 'Customer Service', name: (cs: any) => `Customer ID: ${cs.id_customer} - Service: ${cs.service_name || cs.id_service}`, id: (cs: any) => cs.id_service_per_customer },
                { url: '/work-orders', key: 'service_category_id', label: 'Work Order', name: (wo: any) => `Work Order: ${wo.work_order_number || wo.id}`, id: (wo: any) => wo.id },
                { url: '/quotes', key: 'service_category_id', label: 'Quote', name: (q: any) => `Quote: ${q.quote_number || q.id}`, id: (q: any) => q.id },
                { url: '/reports/operation-report', key: 'category_id', label: 'Operation Report', name: (r: any) => `Report: ${r.cliente} - ${r.servicio_principal}`, id: (r: any) => r.id },
                { url: '/reports/service-executions', key: 'category_id', label: 'Service Execution', name: (e: any) => `Execution: Work Order ${e.work_order}`, id: (e: any) => e.id },
                { url: '/billing/invoices', key: 'category_id', label: 'Invoice', name: (i: any) => `Invoice: ${i.invoice_number || i.id}`, id: (i: any) => i.id }
            ];
            let allDependentRecords: any[] = [];
            for (const { url, key, label, name, id } of endpoints) {
                try {
                    const res = await axiosInstance.get(url);
                    allDependentRecords.push(
                        ...res.data.filter((item: any) => item[key] === categoryId)
                            .map((item: any) => ({ type: label, name: name(item), id: id(item) }))
                    );
                } catch { /* Silenciar errores individuales */ }
            }
            return { inUse: allDependentRecords.length > 0, records: allDependentRecords };
        } catch {
            return { inUse: false, records: [] };
        }
    };

    // Confirmar eliminación
    const confirmDelete = async (id: number, name: string) => {
        setIsDeleting(true);
        const { inUse } = await checkCategoryUsage(id);
        setIsDeleting(false);
        if (inUse) {
            setDeleteErrorMessage(`Cannot delete category "${name}" because it is currently being used in the system.`);
            setShowDeleteErrorPopup(true);
            return;
        }
        setCategoryToDelete({ id, name });
        setShowDeleteConfirmPopup(true);
    };

    // Eliminar después de confirmar
    const handleDelete = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        const { inUse } = await checkCategoryUsage(categoryToDelete.id);
        if (inUse) {
            setDeleteErrorMessage(`Cannot delete category "${categoryToDelete.name}" because it is currently being used in the system.`);
            setShowDeleteConfirmPopup(false);
            setShowDeleteErrorPopup(true);
            setCategoryToDelete(null);
            setIsDeleting(false);
            return;
        }
        try {
            await axiosInstance.delete(`/catalog/service-categories/${categoryToDelete.id}`);
            setDeletedCategoryName(categoryToDelete.name);
            setShowDeleteConfirmPopup(false);
            setCategoryToDelete(null);
            setShowDeleteSuccessPopup(true);
            await fetchCategories();
            setError(null);
        } catch (err: any) {
            if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
                setDeleteErrorMessage(`Cannot delete category "${categoryToDelete.name}" because it is currently being used in the system.`);
                setShowDeleteConfirmPopup(false);
                setShowDeleteErrorPopup(true);
            } else {
                setError("Could not delete the service category. Please try again.");
                setShowDeleteConfirmPopup(false);
            }
            setCategoryToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    // Popups control
    const handleCloseSuccessPopup = () => { setShowDeleteSuccessPopup(false); setDeletedCategoryName(""); };
    const closeDeleteErrorPopup = () => { setShowDeleteErrorPopup(false); setDeleteErrorMessage(""); };
    const cancelDelete = () => { setCategoryToDelete(null); setShowDeleteConfirmPopup(false); };

    useEffect(() => { fetchCategories(); }, []);

    return (
        <AISGBackground>
            <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Service Category Catalog</h1>
                    <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
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
                                                        disabled={isDeleting}
                                                        className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {isDeleting ? (
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

            {/* Popup de confirmación de eliminación */}
            {showDeleteConfirmPopup && categoryToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">Confirm Deletion</h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4">
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
                                {isDeleting ? (
                                    <div className="w-full flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={cancelDelete}
                                            className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            ref={deleteConfirmButtonRef}
                                            onClick={handleDelete}
                                            className="w-1/2 bg-[#e6001f] hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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

            {/* Popup de éxito después de eliminar */}
            {showDeleteSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">Success</h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4 justify-center">
                                <div className="bg-[#00B140] rounded-full p-2 mr-4">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg">
                                    Category "{deletedCategoryName}" has been successfully deleted!
                                </p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={deleteSuccessOkButtonRef}
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

            {/* Popup de error de eliminación */}
            {showDeleteErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">Cannot Delete Category</h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4">
                                <div className="bg-[#f59e0b] rounded-full p-2 mr-4">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg">{deleteErrorMessage}</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={deleteErrorOkButtonRef}
                                    onClick={closeDeleteErrorPopup}
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

export default CatalogServiceCategory;