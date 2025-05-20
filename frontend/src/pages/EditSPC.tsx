import React, { useEffect, useState } from "react";
import axiosInstance from '../api/axiosInstance';

import { useParams, useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditServiceType: React.FC = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [whonew, setWhonew] = useState("system");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // apiURL ya no es necesario, usando axiosInstance
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/catalog/service-types`);
        const found = res.data.find((t: any) => t.id_service_type === Number(id));
        if (found) setName(found.service_type_name);
        else setError("Service type not found.");
      } catch {
        setError("Could not load the service type.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, apiURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await axiosInstance.put(`/catalog/service-types/${id}`, { service_type_name: name, whonew });
      navigate("/catalogs/servicetype");
    } catch {
      setError("Could not update the service type. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading service type data...</p>
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
              Edit Service Type
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            <p className="text-gray-500 mt-2 font-light text-center">
              Editing service type #{id}
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
                  Service Type Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter service type name"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/catalogs/servicetype")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-1/2 ${
                    saving ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                >
                  {saving ? (
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

export default EditServiceType;