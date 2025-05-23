import React, { useState, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const AddService: React.FC = () => {
  const [form, setForm] = useState({
    id_service_status: 0, // Cambiado a 0 para indicar que no hay selección
    id_service_classification: 0,
    id_service_category: 0,
    id_service_type: 0,
    id_service_include: 0,
    service_code: "",
    service_name: "",
    service_description: "",
    service_aircraft_type: false,
    service_by_time: false,
    min_time_configured: false,
    service_technicians_included: false,
  });

  // Validación para habilitar el botón de envío
  const isFormValid = () => {
    return form.id_service_status > 0 &&
           form.id_service_classification > 0 &&
           form.id_service_category > 0 &&
           form.id_service_type > 0 &&
           form.id_service_include > 0 &&
           form.service_code.trim() !== "" &&
           form.service_name.trim() !== "";
  };

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Estados para los catálogos
  const [statuses, setStatuses] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [includes, setIncludes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar los catálogos
  const fetchCatalogs = async () => {
    try {
      const [statusesRes, classificationsRes, categoriesRes, typesRes, includesRes] = await Promise.all([
        axiosInstance.get('/catalog/service-status'),
        axiosInstance.get('/catalog/service-classification'),
        axiosInstance.get('/catalog/service-categories'),
        axiosInstance.get('/catalog/service-types'),
        axiosInstance.get('/catalog/service-includes')
      ]);

      setStatuses(statusesRes.data);
      setClassifications(classificationsRes.data);
      setCategories(categoriesRes.data);
      setTypes(typesRes.data);
      setIncludes(includesRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading catalogs:", err);
      setError("Error loading catalog data. Please refresh the page.");
      setLoading(false);
    }
  };

  // Cargar los catálogos cuando se monte el componente
  useEffect(() => {
    fetchCatalogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se hayan seleccionado valores
    if (!isFormValid()) {
      setError("Please select values for all required fields");
      return;
    }
    
    setSubmitting(true);

    // Obtener el usuario desde sessionStorage para enviarlo en el payload
    const whonew = sessionStorage.getItem("userName") || "admin";

    const payload = {
      ...form,
      service_aircraft_type: form.service_aircraft_type ? 2 : 1,
      service_by_time: form.service_by_time ? 2 : 1,
      min_time_configured: form.min_time_configured ? 2 : 1,
      service_technicians_included: form.service_technicians_included ? 2 : 1,
      whonew, // Se agrega aquí automáticamente
    };

    try {
      await axiosInstance.post(`/catalog/services/`, payload);
      navigate("/services");
    } catch (err: any) {
      console.error("Error creating service:", err);
      if (err.response) {
        if (err.response.data && err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            const errorMessages = err.response.data.detail
              .map((detail: any) => `${detail.loc.join(" -> ")}: ${detail.msg}`)
              .join("; ");
            setError(`Validation errors: ${errorMessages}`);
          } else {
            setError(`Error: ${err.response.data.detail}`);
          }
        } else {
          setError(`Error ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError("No se recibió respuesta del servidor");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AISGBackground>
        <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
            <p className="text-lg">Loading catalog data...</p>
          </div>
        </div>
      </AISGBackground>
    );
  }

  return (
    <AISGBackground>
      <div className="max-w-3xl mx-auto p-6 font-['Montserrat']">
        <div className="w-full">
          <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-[#002057]">
              Add New Service
            </h1>
            <div className="mt-2 w-32 h-1 bg-[#e6001f] mx-auto rounded"></div>
          </div>
          <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Status ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_status}
                      onChange={(e) =>
                        setForm({ ...form, id_service_status: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                    >
                      <option value={0} disabled>Select a status...</option>
                      {statuses.map(status => (
                        <option key={status.id_service_status} value={status.id_service_status}>
                          {status.status_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Classification ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Classification ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_classification}
                      onChange={(e) =>
                        setForm({ ...form, id_service_classification: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                    >
                      <option value={0} disabled>Select a classification...</option>
                      {classifications.map(classification => (
                        <option key={classification.id_service_classification} value={classification.id_service_classification}>
                          {classification.service_classification_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Category ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Category ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_category}
                      onChange={(e) =>
                        setForm({ ...form, id_service_category: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                    >
                      <option value={0} disabled>Select a category...</option>
                      {categories.map(category => (
                        <option key={category.id_service_category} value={category.id_service_category}>
                          {category.service_category_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Type ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Type ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_type}
                      onChange={(e) =>
                        setForm({ ...form, id_service_type: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                    >
                      <option value={0} disabled>Select a type...</option>
                      {types.map(type => (
                        <option key={type.id_service_type} value={type.id_service_type}>
                          {type.service_type_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Include ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Include ID
                  </label>
                  <div className="relative">
                    <select
                      value={form.id_service_include}
                      onChange={(e) =>
                        setForm({ ...form, id_service_include: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all appearance-none"
                      required
                    >
                      <option value={0} disabled>Select an include option...</option>
                      {includes.map(include => (
                        <option key={include.id_service_include} value={include.id_service_include}>
                          {include.service_include}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 10 10)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
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
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                    required
                    placeholder="Enter service code"
                  />
                </div>

                {/* Nombre */}
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
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                    required
                    placeholder="Enter service name"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={form.service_description}
                  onChange={e =>
                    setForm({ ...form, service_description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                  rows={4}
                  required
                  placeholder="Enter service description"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aircraft_type"
                    checked={form.service_aircraft_type}
                    onChange={(e) =>
                      setForm({ ...form, service_aircraft_type: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                  />
                  <label htmlFor="aircraft_type" className="ml-2 text-white">
                    Aircraft Type
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="by_time"
                    checked={form.service_by_time}
                    onChange={(e) =>
                      setForm({ ...form, service_by_time: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                  />
                  <label htmlFor="by_time" className="ml-2 text-white">
                    By Time
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="min_time"
                    checked={form.min_time_configured}
                    onChange={(e) =>
                      setForm({ ...form, min_time_configured: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                  />
                  <label htmlFor="min_time" className="ml-2 text-white">
                    Min Time Configured
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="technicians"
                    checked={form.service_technicians_included}
                    onChange={(e) =>
                      setForm({ ...form, service_technicians_included: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0033A0] border-gray-300 rounded focus:ring-[#0033A0]"
                  />
                  <label htmlFor="technicians" className="ml-2 text-white">
                    Technicians Included
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={submitting || !isFormValid()}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default AddService;