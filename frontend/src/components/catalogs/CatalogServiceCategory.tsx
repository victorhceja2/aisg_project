import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Catalog for Service Categories. Allows search, add, edit, and delete.
 */
const CatalogServiceCategory: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const navigate = useNavigate();

    // Fetch service categories from backend
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${apiURL}/catalog/service-categories/${search ? `?search=${encodeURIComponent(search)}` : ""}`
            );
            setCategories(res.data);
            setError(null);
        } catch (err) {
            setError("Could not load service categories. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Delete a service category
    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await axios.delete(`${apiURL}/catalog/service-categories/${id}`);
                fetchCategories();
                setError(null);
            } catch (err) {
                setError("Could not delete the service category. It may be used by an active service.");
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [search]);

    return (
        <div className="min-h-screen bg-[#1A1A2E] p-6 font-['Montserrat']">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-white text-center">Service Category Catalog</h1>
                    <p className="text-gray-200 mt-2 font-light text-center">Manage the different service categories</p>
                </div>
                <div className="bg-[#16213E] rounded-b-lg shadow-lg p-6">
                    {error && (
                        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="w-full md:w-2/3 relative">
                            <input
                                type="text"
                                placeholder="Search service category..."
                                className="w-full px-4 py-3 pl-10 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
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
                            className="w-full md:w-auto bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Service Category
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center my-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
                        </div>
                    ) : (
                        <div className="bg-[#0D1B2A] rounded-lg overflow-hidden shadow-lg">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-[#0033A0] text-white">
                                        <th className="px-6 py-4 text-left font-semibold">ID</th>
                                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                                        <th className="px-6 py-4 text-left font-semibold">Created At</th>
                                        <th className="px-6 py-4 text-left font-semibold">Updated At</th>
                                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1E2A45]">
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((cat) => (
                                            <tr key={cat.id_service_category} className="hover:bg-[#1E2A45] transition-colors">
                                                <td className="px-6 py-4 text-gray-300">{cat.id_service_category}</td>
                                                <td className="px-6 py-4 text-white font-medium">{cat.service_category_name}</td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    {cat.create_at ? new Date(cat.create_at).toLocaleString() : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    {cat.updated_at ? new Date(cat.updated_at).toLocaleString() : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center space-x-2">
                                                        <Link
                                                            to={`/catalogs/servicecategory/edit/${cat.id_service_category}`}
                                                            className="p-1.5 bg-[#4D70B8] text-white rounded hover:bg-[#0033A0] transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(cat.id_service_category, cat.service_category_name)}
                                                            className="p-1.5 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogServiceCategory;