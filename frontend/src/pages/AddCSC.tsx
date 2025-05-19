import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddCSC: React.FC = () => {
  const [categoryName, setCategoryName] = useState("");
  const [whonew, setWhonew] = useState("system");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${apiURL}/catalog/service-categories`, {
        service_category_name: categoryName,
        whonew,
      });
      navigate("/catalogs/servicecategory");
    } catch (err) {
      setError("Could not add the service category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center font-['Montserrat']">
      <form
        onSubmit={handleSubmit}
        className="bg-[#16213E] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Add Service Category</h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 animate-pulse">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Category Name</label>
          <input
            className="w-full px-3 py-2 rounded bg-[#1E2A45] text-white border border-gray-700 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            placeholder="Enter service category name"
            required
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/catalogs/servicecategory")}
            className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`w-1/2 ${
              loading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
            } text-white font-medium py-2 px-4 rounded transition-all flex items-center justify-center`}
          >
            {loading ? (
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

export default AddCSC;