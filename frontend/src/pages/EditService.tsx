import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    id_service_status: 1,
    id_service_classification: 1,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL || "http://82.165.213.124:8000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`${apiURL}/catalog/services/${id}`);
        if (res.data) {
          setForm(res.data);
        } else {
          setError("No data found for this service.");
        }
        setLoading(false);
      } catch (err) {
        setError("Error loading the service.");
        setLoading(false);
      }
    };
    fetchService();
  }, [id, apiURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${apiURL}/catalog/services/${id}`, form);
      navigate("/services");
    } catch (err) {
      setError("Could not update the service.");
    }
  };

  if (loading) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading service data...</p>
          </div>
        </div>
      </AISGBackground>
    );
  }

  return (
    <AISGBackground>
      <div className="max-w-2xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Edit Service
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            <p className="text-gray-500 mt-2 font-light text-center">
              Modify the selected service data
            </p>
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
                  Code
                </label>
                <input
                  type="text"
                  value={form.service_code}
                  onChange={(e) =>
                    setForm({ ...form, service_code: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={form.service_name}
                  onChange={(e) =>
                    setForm({ ...form, service_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={form.service_description}
                  onChange={(e) =>
                    setForm({ ...form, service_description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default EditService;