import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ServicePerCustomerRecord {
  id_service_per_customer: number;
  id_service: number;
  id_client: number;
  id_company: number;
  minutes_included: number;
  minutes_minimun: number;
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

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axios.get(
        `${API_BASE_URL}/catalog/service-per-customer${search ? `?fuselage_type=${encodeURIComponent(search)}` : ""}`
      );
      setRecords(res.data);
      setIsLoading(false);
    } catch (err: any) {
      setError("Could not load data. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setDeleteConfirm(id);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      setError("");
      await axios.delete(`${API_BASE_URL}/catalog/service-per-customer/${id}`);
      await fetchRecords();
      setDeleteConfirm(null);
      setSuccess("Record deleted successfully");
      setIsLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setIsLoading(false);
      setError("Could not delete record.");
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

  useEffect(() => {
    fetchRecords();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Services by Airline
          </h1>
          <p className="text-gray-200 mt-2 font-light text-center">
            Manage the relationship between services and airlines with specific parameters
          </p>
        </div>

        <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex-grow max-w-md">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search by Fuselage Type</label>
            <input
              type="text"
              className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
              placeholder="Search by fuselage type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Service by Airline
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-100 px-4 py-3 rounded mb-4">
            <p>{success}</p>
          </div>
        )}
        {isLoading && (
          <div className="bg-[#16213E] p-4 rounded-lg shadow-lg mb-6 flex justify-center">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B140] mr-3"></div>
              <span>Loading...</span>
            </div>
          </div>
        )}

        <div className="bg-[#16213E] rounded-lg shadow-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#0D1B2A]">
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Service</th>
                <th className="p-3 text-left font-semibold">Client</th>
                <th className="p-3 text-left font-semibold">Company</th>
                <th className="p-3 text-left font-semibold">Minutes Included</th>
                <th className="p-3 text-left font-semibold">Minutes Minimum</th>
                <th className="p-3 text-left font-semibold">Fuselage Type</th>
                <th className="p-3 text-left font-semibold">Technicians Included</th>
                <th className="p-3 text-left font-semibold">Who New</th>
                <th className="p-3 text-left font-semibold">Created At</th>
                <th className="p-3 text-left font-semibold">Updated At</th>
                <th className="p-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id_service_per_customer} className="border-t border-[#0D1B2A] hover:bg-[#1E2A45]">
                    <td className="p-3">{r.id_service_per_customer}</td>
                    <td className="p-3">{r.id_service}</td>
                    <td className="p-3">{r.id_client}</td>
                    <td className="p-3">{r.id_company}</td>
                    <td className="p-3">{r.minutes_included}</td>
                    <td className="p-3">{r.minutes_minimun}</td>
                    <td className="p-3">{r.fuselage_type}</td>
                    <td className="p-3">{r.technicians_included}</td>
                    <td className="p-3">{r.whonew}</td>
                    <td className="p-3">{r.create_at ? r.create_at.split("T")[0] : ""}</td>
                    <td className="p-3">{r.updated_at ? r.updated_at.split("T")[0] : ""}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(r.id_service_per_customer)}
                          className="text-[#4D70B8] hover:text-[#00B140] transition-colors duration-200"
                          title="Edit"
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(r.id_service_per_customer)}
                          className="text-red-500 hover:text-red-400 transition-colors duration-200"
                          title="Delete"
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="p-4 text-center text-gray-400">
                    {isLoading ? "Loading data..." : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#16213E] rounded-lg shadow-lg max-w-md w-full p-6 border-2 border-red-500 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-white">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete record #{deleteConfirm}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isLoading}
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePerCustomer;