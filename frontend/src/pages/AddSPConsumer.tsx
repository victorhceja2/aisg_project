import React, { useState, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

// Interface para los clientes
interface Client {
  llave: number;
  nombre: string;
  razonSocial: string;
}

// Interface para los servicios
interface Service {
  id_service: number;
  service_name: string;
  service_code: string;
}

const AddSPConsumer: React.FC = () => {
  const navigate = useNavigate();
  // Estado para almacenar la lista de clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  
  // Estado para almacenar la lista de servicios
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    id_company: "",
    minutes_included: 0,
    minutes_minimum: 0,
    fuselage_type: "",
    technicians_included: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Estado para controlar la alerta de éxito
  const [showSuccess, setShowSuccess] = useState(false);

  // Obtener la lista de clientes y servicios cuando el componente se monta
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar clientes
        const clientsResponse = await axiosInstance.get('/catalog/clients');
        console.log("Clientes recibidos:", clientsResponse.data);
        setClients(clientsResponse.data);
        setClientsLoading(false);
        
        // Cargar servicios
        const servicesResponse = await axiosInstance.get('/catalog/services');
        console.log("Servicios recibidos:", servicesResponse.data);
        setServices(servicesResponse.data);
        setServicesLoading(false);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error loading data. Please refresh the page.");
        setClientsLoading(false);
        setServicesLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validación básica
      if (!form.id_service || !form.id_client || !form.id_company) {
        setError("All ID fields are required");
        setLoading(false);
        return;
      }

      const whonew = sessionStorage.getItem("userName") || "admin";
      const data = {
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        id_company: parseInt(form.id_company),
        minutes_included: form.minutes_included,
        minutes_minimum: form.minutes_minimum,
        fuselage_type: form.fuselage_type || "",  // Asegurar que no sea undefined
        technicians_included: form.technicians_included,
        whonew,
      };

      console.log("Enviando datos:", data);

      const response = await axiosInstance.post(`/catalog/service-per-customer`, data);
      console.log("Respuesta:", response.data);
      
      // Mostrar alerta de éxito en lugar de navegar inmediatamente
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Error completo:", err);
      
      if (err.response && err.response.data) {
        console.error("Detalles del error:", err.response.data);
        
        // Mostrar detalles de validación si están disponibles
        if (err.response.data.detail) {
          setError(`Error: ${err.response.data.detail}`);
        } else {
          setError(`Error de validación: ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.statusText}`);
      } else {
        setError("Could not save the record. Please check the data and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/catalogs/customer");
  };
  
  // Función para manejar el cierre del modal de éxito
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/catalogs/customer");
  };

  // Modal de alerta de éxito
  const SuccessAlert = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-center text-[#002057]">
            Success
          </h3>
          <div className="mt-1 w-14 h-1 bg-[#e6001f] mx-auto rounded"></div>
        </div>
        <div className="bg-[#1E2A45] p-6 flex flex-col items-center">
          <div className="bg-green-600 rounded-full h-14 w-14 flex items-center justify-center mb-4">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-white text-lg mb-6 text-center">
            Service per customer has been successfully added!
          </p>
          <button 
            onClick={handleSuccessClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AISGBackground>
      {/* Render modal de éxito si showSuccess es true */}
      {showSuccess && <SuccessAlert />}
      
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
                  <label className="block text-white text-sm font-medium mb-2">Service</label>
                  {servicesLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading services...
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                      value={form.id_service}
                      onChange={(e) => setForm({ ...form, id_service: e.target.value })}
                      required
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id_service} value={service.id_service}>
                          {service.service_code} - {service.service_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Client</label>
                  {clientsLoading ? (
                    <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                      Loading clients...
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                      value={form.id_client}
                      onChange={(e) => setForm({ ...form, id_client: e.target.value })}
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.llave} value={client.llave}>
                          {client.razonSocial || client.nombre || `Client #${client.llave}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Company ID</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                    placeholder="Company ID"
                    type="number"
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
                    value={form.minutes_minimum}
                    onChange={(e) => setForm({ ...form, minutes_minimum: +e.target.value })}
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