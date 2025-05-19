import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const AddStatus: React.FC = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [statusName, setStatusName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) {
      setError("Status name is required");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      await axios.post(`${apiURL}/catalog/service-status/`, {
        status_name: statusName
      });
      navigate("/catalogs/status");
    } catch {
      setError("Could not create status. Try again.");
      setIsLoading(false);
    }
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Add Service Status
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Status Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
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
                    "Save"
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

export default AddStatus;