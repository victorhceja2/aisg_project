import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const CatalogServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiURL}/catalog/services${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setServices(res.data);
      setError(null);
    } catch (err) {
      setError("Error loading services.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setServiceToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await axios.delete(`${apiURL}/catalog/services/${serviceToDelete}`);
      fetchServices();
      setError(null);
    } catch (err) {
      setError("Could not delete service.");
    } finally {
      setShowConfirmation(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setServiceToDelete(null);
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  return (
    <AISGBackground>
      <div className="min-h-screen p-6 font-['Montserrat']">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg">
            <h1 className="text-3xl font-bold text-white text-center">Services Catalog</h1>
            <p className="text-gray-200 mt-2 font-light text-center">Manage available services</p>
          </div>
          <div className="rounded-b-lg shadow-lg p-6 bg-transparent">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="w-full md:w-2/3 relative">
                <input
                  type="text"
                  placeholder="Search by code, name or description..."
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
                to="/services/add"
                className="w-full md:w-auto bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Service
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-white text-[#002057]">
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Classification</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Include</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Aircraft Type</th>
                        <th className="px-4 py-3">By Time</th>
                        <th className="px-4 py-3">Min Time Configured</th>
                        <th className="px-4 py-3">Technicians Included</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-[#1E2A45]">
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="px-6 py-8 text-center text-gray-400">
                            No services found.
                          </td>
                        </tr>
                      ) : (
                        services.map((s) => (
                          <tr key={s.id_service} className="hover:bg-[#1E2A45] transition-colors">
                            <td className="px-4 py-3 text-gray-300">{s.id_service}</td>
                            <td className="px-4 py-3 text-gray-300">{s.id_service_status}</td>
                            <td className="px-4 py-3 text-gray-300">{s.id_service_classification}</td>
                            <td className="px-4 py-3 text-gray-300">{s.id_service_category}</td>
                            <td className="px-4 py-3 text-gray-300">{s.id_service_type}</td>
                            <td className="px-4 py-3 text-gray-300">{s.id_service_include}</td>
                            <td className="px-4 py-3 text-gray-300">{s.service_code}</td>
                            <td className="px-4 py-3 text-white font-medium">{s.service_name}</td>
                            <td className="px-4 py-3 text-gray-300">{s.service_description}</td>
                            <td className="px-4 py-3 text-gray-300">{s.service_aircraft_type ? "Yes" : "No"}</td>
                            <td className="px-4 py-3 text-gray-300">{s.service_by_time ? "Yes" : "No"}</td>
                            <td className="px-4 py-3 text-gray-300">{s.min_time_configured ? "Yes" : "No"}</td>
                            <td className="px-4 py-3 text-gray-300">{s.service_technicians_included ? "Yes" : "No"}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-2">
                                <Link
                                  to={`/services/edit/${s.id_service}`}
                                  className="p-1.5 bg-[#4D70B8] text-white rounded hover:bg-[#0033A0] transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => handleDeleteClick(s.id_service)}
                                  className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
                </div>
              </div>
            )}
            {showConfirmation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#16213E] rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4 border border-[#0033A0]">
                  <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-4">
                    <h3 className="text-xl font-bold text-white text-center">Confirm Delete</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-white mb-6 text-center">
                      Are you sure you want to delete this service? This action cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2 bg-[#4D70B8] text-white rounded-lg hover:bg-[#3A5A9F] transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default CatalogServices;