import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddService: React.FC = () => {
  const [form, setForm] = useState({
    id_service_status: 1,
    id_service_clasification: 1, // <-- corregido
    id_service_category: 1,
    id_service_type: 1,
    id_service_include: 1,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false,
    whonew: "",
  });

  const [error, setError] = useState<string | null>(null);
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        service_aircraft_type: form.service_aircraft_type ? 2 : 1,
        service_by_time: form.service_by_time ? 2 : 1,
        min_time_configured: form.min_time_configured ? 2 : 1,
        service_technicians_included: form.service_technicians_included ? 2 : 1,
      };
      await axios.post(`${apiURL}/catalog/services/`, payload);
      navigate("/services");
    } catch (err) {
      setError("Could not add service.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
          <h1 className="text-2xl font-bold text-center text-[#002057]">
            Add New Service
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
                <label className="block text-white text-sm font-medium mb-2">
                  Status ID
                </label>
                <input
                  type="number"
                  value={form.id_service_status}
                  onChange={e =>
                    setForm({ ...form, id_service_status: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Classification ID
                </label>
                <input
                  type="number"
                  value={form.id_service_clasification}
                  onChange={e =>
                    setForm({ ...form, id_service_clasification: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Category ID
                </label>
                <input
                  type="number"
                  value={form.id_service_category}
                  onChange={e =>
                    setForm({ ...form, id_service_category: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Type ID
                </label>
                <input
                  type="number"
                  value={form.id_service_type}
                  onChange={e =>
                    setForm({ ...form, id_service_type: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Include ID
                </label>
                <input
                  type="number"
                  value={form.id_service_include}
                  onChange={e =>
                    setForm({ ...form, id_service_include: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={form.service_code}
                  onChange={e =>
                    setForm({ ...form, service_code: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
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
                  onChange={e =>
                    setForm({ ...form, service_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={form.service_description}
                  onChange={e =>
                    setForm({ ...form, service_description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                  rows={3}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.service_aircraft_type}
                  onChange={e =>
                    setForm({ ...form, service_aircraft_type: e.target.checked })
                  }
                  id="aircraft_type"
                />
                <label htmlFor="aircraft_type" className="text-white text-sm">
                  Aircraft Type
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.service_by_time}
                  onChange={e =>
                    setForm({ ...form, service_by_time: e.target.checked })
                  }
                  id="by_time"
                />
                <label htmlFor="by_time" className="text-white text-sm">
                  By Time
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.min_time_configured}
                  onChange={e =>
                    setForm({ ...form, min_time_configured: e.target.checked })
                  }
                  id="min_time_configured"
                />
                <label htmlFor="min_time_configured" className="text-white text-sm">
                  Min Time Configured
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.service_technicians_included}
                  onChange={e =>
                    setForm({ ...form, service_technicians_included: e.target.checked })
                  }
                  id="technicians_included"
                />
                <label htmlFor="technicians_included" className="text-white text-sm">
                  Technicians Included
                </label>
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Who New
              </label>
              <input
                type="text"
                value={form.whonew}
                onChange={e =>
                  setForm({ ...form, whonew: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
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
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddService;