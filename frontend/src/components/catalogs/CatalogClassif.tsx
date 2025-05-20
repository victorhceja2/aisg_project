import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AISGBackground from "./fondo"; // Import from fondo.tsx

const CatalogClassif: React.FC = () => {
  const [classifications, setClassifications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchClassifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiURL}/catalog/service-classification/${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setClassifications(res.data);
      setError(null);
    } catch {
      setError("Could not load classifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the classification "${name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${apiURL}/catalog/service-classification/${id}`);
        fetchClassifications();
        setError(null);
      } catch {
        setError("Could not delete the classification. It may be used by an active service.");
      }
    }
  };

  useEffect(() => {
    fetchClassifications();
  }, [search]);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Service Classifications Catalog</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-2/3 relative">
            <input
              type="text"
              placeholder="Search classification..."
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
            to="/catalogs/classif/add"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Classification
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
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                    Created/Modified By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#002057] border border-[#cccccc]">
                    Updated At
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-[#002057] border border-[#cccccc]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {classifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-white bg-transparent">
                      No records found
                    </td>
                  </tr>
                ) : (
                  classifications.map((c) => (
                    <tr key={c.id_service_classification} className="bg-transparent">
                      <td className="px-4 py-3 border border-[#1e3462] text-white">{c.whonew || "-"}</td>
                      <td className="px-4 py-3 border border-[#1e3462] font-medium text-white">{c.service_classification_name}</td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white">
                        {c.create_at ? new Date(c.create_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 border border-[#1e3462] text-white">
                        {c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 border border-[#1e3462]">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/catalogs/classif/edit/${c.id_service_classification}`}
                            className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id_service_classification, c.service_classification_name)}
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
    </AISGBackground>
  );
};

export default CatalogClassif;