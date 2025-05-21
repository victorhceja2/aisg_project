import React, { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link } from "react-router-dom";

/**
 * Component to display and manage the Service Classifications catalog.
 * Allows searching, adding, and editing classifications.
 */
const CatalogClassifications: React.FC = () => {
  // List of classifications from backend
  const [classifications, setClassifications] = useState<any[]>([]);
  // Search field value
  const [search, setSearch] = useState("");
  // Error state for user messages
  const [error, setError] = useState<string | null>(null);
  // Loading state for the table
  const [loading, setLoading] = useState(true);
  // API base URL from environment or default
  // apiURL ya no es necesario, usando axiosInstance

  // AISG corporate color palette
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    lightBg: "#F5F5F7",
    textDark: "#222222",
    textLight: "#FFFFFF",
  };

  /**
   * Fetches the list of classifications from the backend.
   * Filters results if a search term is provided.
   */
  const fetchClassifications = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/catalog/service-classification/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setClassifications(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching classifications", err);
      setError("Could not load classifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reloads the list when the search term changes
  useEffect(() => {
    fetchClassifications();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] p-6 font-['Montserrat']">
      <div className="max-w-7xl mx-auto">
        {/* Header with AISG corporate colors */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white">Service Classifications Catalog</h1>
          <p className="text-gray-200 mt-2 font-light">Manage the different service classifications</p>
        </div>

        {/* Main content */}
        <div className="bg-[#16213E] rounded-b-lg shadow-lg p-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Add new classification button */}
          <div className="mb-6 flex justify-end">
            <Link 
              to="/catalogs/classif/add"
              className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Classification
            </Link>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 rounded-lg bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                placeholder="Search classification..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results table */}
          {loading ? (
            // Spinner while loading
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
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2A45]">
                  {classifications.length === 0 ? (
                    // No results message
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    // Render each classification row
                    classifications.map((c) => (
                      <tr key={c.id_service_classification} className="hover:bg-[#1E2A45] transition-colors">
                        <td className="px-6 py-4 text-gray-300">{c.id_service_classification}</td>
                        <td className="px-6 py-4 text-white font-medium">{c.service_classification_name}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {c.create_at ? new Date(c.create_at).toLocaleString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {/* Edit classification button */}
                            <Link
                              to={`/catalogs/classif/edit/${c.id_service_classification}`}
                              className="p-1.5 bg-[#4D70B8] text-white rounded hover:bg-[#0033A0] transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
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

export default CatalogClassifications;