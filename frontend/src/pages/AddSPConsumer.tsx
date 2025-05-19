import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const AddSPConsumer: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    id_company: "",
    minutes_included: 0,
    minutes_minimun: 0,
    fuselage_type: "",
    technicians_included: 0,
    whonew: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = {
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        id_company: parseInt(form.id_company),
        minutes_included: form.minutes_included,
        minutes_minimun: form.minutes_minimun,
        fuselage_type: form.fuselage_type,
        technicians_included: form.technicians_included,
        whonew: form.whonew,
      };
      await axios.post(`${apiURL}/catalog/service-per-customer`, data);
      navigate("/catalogs/customer");
    } catch (err) {
      setError("Could not save the record. Please check the data and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/catalogs/customer");
  };

  return (
    <AISGBackground>
      <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Add Service per Customer
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Service ID</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Service ID"
                    value={form.id_service}
                    onChange={(e) => setForm({ ...form, id_service: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Client ID</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Client ID"
                    value={form.id_client}
                    onChange={(e) => setForm({ ...form, id_client: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Company ID</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Company ID"
                    value={form.id_company}
                    onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Included Minutes</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Included Minutes"
                    type="number"
                    value={form.minutes_included}
                    onChange={(e) => setForm({ ...form, minutes_included: +e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Minimum Minutes</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Minimum Minutes"
                    type="number"
                    value={form.minutes_minimun}
                    onChange={(e) => setForm({ ...form, minutes_minimun: +e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Technicians Included</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Technicians Included"
                    type="number"
                    value={form.technicians_included}
                    onChange={(e) => setForm({ ...form, technicians_included: +e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Fuselage Type</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Fuselage Type"
                    value={form.fuselage_type}
                    onChange={(e) => setForm({ ...form, fuselage_type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">User</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="User"
                    value={form.whonew}
                    onChange={(e) => setForm({ ...form, whonew: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 ${
                    loading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                  disabled={loading}
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
        </div>
      </div>
    </AISGBackground>
  );
};

export default AddSPConsumer;