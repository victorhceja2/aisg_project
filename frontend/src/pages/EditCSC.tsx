import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditCSC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [categoryName, setCategoryName] = useState("");
  const [whonew, setWhonew] = useState("system");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${apiURL}/catalog/service-categories`);
        const found = res.data.find((cat: any) => cat.id_service_category?.toString() === id);
        if (found) {
          setCategoryName(found.service_category_name);
        } else {
          setError("Service category not found.");
        }
      } catch (err) {
        setError("Could not load the service category.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCategory();
  }, [id, apiURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.put(`${apiURL}/catalog/service-categories/${id}`, {
        service_category_name: categoryName,
        whonew,
      });
      navigate("/catalogs/servicecategory");
    } catch (err) {
      setError("Could not update the service category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center font-['Montserrat']">
      <form
        onSubmit={handleSubmit}
        className="bg-[#16213E] p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Service Category</h2>
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
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCSC;