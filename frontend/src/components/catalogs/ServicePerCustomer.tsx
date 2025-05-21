import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

interface ServicePerCustomerRecord {
  id_service_per_customer: number;
  id_service: number;
  id_client: number;
  id_company: number;
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

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("Fetching records with URL:", `/catalog/service-per-customer${search ? `?fuselage_type=${encodeURIComponent(search)}` : ""}`);
      
      const res = await axiosInstance.get(
        `/catalog/service-per-customer${search ? `?fuselage_type=${encodeURIComponent(search)}` : ""}`,
        {
          // Añadir timeout para evitar esperas prolongadas
          timeout: 30000
        }
      );
      
      console.log("Response received:", res.status, res.statusText);
      console.log("Records count:", res.data?.length || 0);
      setRecords(res.data || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      
      let errorMessage = "Could not load data. Please try again.";
      
      if (err.response) {
        // El servidor respondió con un código de estado diferente a 2xx
        errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        // La solicitud se hizo pero no se recibió respuesta
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        // Ocurrió un error durante la configuración de la solicitud
        errorMessage = `Request error: ${err.message}`;
      }
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The server took too long to respond.";
      }
      
      setError(errorMessage);
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
      console.log("Deleting record:", id);
      
      const res = await axiosInstance.delete(`/catalog/service-per-customer/${id}`, {
        timeout: 15000
      });
      
      console.log("Delete response:", res.status, res.statusText);
      await fetchRecords();
      setDeleteConfirm(null);
      setSuccess("Record deleted successfully");
      setIsLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      console.error("Error deleting record:", err);
      
      let errorMessage = "Could not delete record.";
      
      if (err.response) {
        errorMessage = `Delete failed: ${err.response.status} - ${err.response.statusText}`;
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        errorMessage = "No response received during delete operation.";
      } else {
        errorMessage = `Delete error: ${err.message}`;
      }
      
      setIsLoading(false);
      setError(errorMessage);
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
    console.log("Search term changed, fetching records...");
    fetchRecords();
  }, [search]);

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Services by Airline</h1>
          <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
          <p className="text-gray-200 mt-2 font-light">
            Manage the relationship between services and airlines with specific parameters
          </p>
        </div>
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
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
            <p className="font-medium">{success}</p>
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center py-12 bg-transparent">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
          </div>
        )}
        <div className="overflow-x-auto">
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
                    <td className="px-4 py-3 text-white">{r.id_company}</td>
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
                    {isLoading ? "Loading data..." : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </AISGBackground>
  );
};

export default ServicePerCustomer;