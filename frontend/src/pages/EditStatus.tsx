import React, { useState, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditStatus: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [statusName, setStatusName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Cargar el usuario actual
  useEffect(() => {
    const storedUser = sessionStorage.getItem("userName");
    setCurrentUser(storedUser || "admin");
  }, []);

  // Cargar datos del status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsFetching(true);
        const res = await axiosInstance.get(`/catalog/service-status/${id}`);
        setStatusName(res.data.status_name);
      } catch (err) {
        console.error("Error fetching status:", err);
        setError("Could not load status data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, [id]); // Eliminar apiURL de aquí, ya que no está definido

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) {
      setError("Status name is required");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      
      // Obtener el usuario actual para incluirlo en la actualización
      const whonew = sessionStorage.getItem("userName") || "admin";
      console.log("Usuario para actualización:", whonew);
      
      await axiosInstance.put(`/catalog/service-status/${id}`, {
        status_name: statusName,
        whonew: whonew // Incluir quién modificó el registro
      });
      
      navigate("/catalogs/status");
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Could not update status. Try again.");
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading status data...</p>
          </div>
        </div>
      </AISGBackground>
    );
  }

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Edit Service Status
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            <p className="text-gray-500 mt-2 font-light text-center">
              Editing status #{id}
            </p>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}
            {currentUser && (
              <div className="mb-4 text-gray-300 text-sm">
                <p>Logged in as: {currentUser}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Status Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  value={statusName}
                  onChange={e => setStatusName(e.target.value)}
                  placeholder="e.g. In Progress, Completed"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/status")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-1/2 ${
                    isLoading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default EditStatus;