import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditStatus: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [statusName, setStatusName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsFetching(true);
        const res = await axios.get(`${apiURL}/catalog/service-status/${id}`);
        setStatusName(res.data.status_name);
      } catch {
        setError("Could not load status data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, [id, apiURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) {
      setError("Status name is required");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      await axios.put(`${apiURL}/catalog/service-status/${id}`, {
        status_name: statusName
      });
      navigate("/catalogs/status");
    } catch {
      setError("Could not update status. Try again.");
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
        <span className="ml-4">Loading status...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center font-['Montserrat']">
      <form
        onSubmit={handleSubmit}
        className="bg-[#16213E] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Service Status</h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 animate-pulse">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Status Name</label>
          <input
            className="w-full px-3 py-2 rounded bg-[#1E2A45] text-white border border-gray-700"
            value={statusName}
            onChange={e => setStatusName(e.target.value)}
            placeholder="e.g. In Progress, Completed"
            required
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/catalogs/status")}
            className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-all"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-1/2 ${
              isLoading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
            } text-white font-medium py-2 px-4 rounded transition-all flex items-center justify-center`}
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
  );
};

export default EditStatus;