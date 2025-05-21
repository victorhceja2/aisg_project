import React, { useEffect, useState } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

// Interface para los clientes
interface Client {
    llave: number;
    nombre: string;
    razonSocial: string;
}

const EditSPConsumer: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // Estado para almacenar la lista de clientes
    const [clients, setClients] = useState<Client[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);

    const [form, setForm] = useState({
        id_service: "",
        id_client: "",
        id_company: "",
        minutes_included: 0,
        minutes_minimum: 0,
        fuselage_type: "",
        technicians_included: 0,
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    // Cargar clientes
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get('/catalog/clients');
                console.log("Clientes recibidos:", response.data);
                setClients(response.data);
            } catch (err: any) {
                console.error("Error fetching clients:", err);
                setError("Error loading clients. Please refresh the page.");
            } finally {
                setClientsLoading(false);
            }
        };

        fetchClients();
    }, []);

    // Cargar datos del registro a editar
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/catalog/service-per-customer/${id}`);
                const record = res.data;
                setForm({
                    id_service: record.id_service?.toString() || "",
                    id_client: record.id_client?.toString() || "",
                    id_company: record.id_company?.toString() || "",
                    minutes_included: record.minutes_included,
                    minutes_minimum: record.minutes_minimum,
                    fuselage_type: record.fuselage_type || "",
                    technicians_included: record.technicians_included,
                });
                setLoading(false);
            } catch (err) {
                setError("Could not load the record. Please try again.");
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError("");
        
        try {
            // Validación básica
            if (!form.id_service || !form.id_client || !form.id_company) {
                setError("Todos los campos de ID son requeridos");
                setUpdating(false);
                return;
            }

            // Obtener el nombre de usuario actual de la sesión
            const currentUser = sessionStorage.getItem("userName") || "admin";

            const data = {
                id_service: parseInt(form.id_service),
                id_client: parseInt(form.id_client),
                id_company: parseInt(form.id_company),
                minutes_included: form.minutes_included,
                minutes_minimum: form.minutes_minimum,
                fuselage_type: form.fuselage_type || "",
                technicians_included: form.technicians_included,
                whonew: currentUser, // Siempre usar el usuario actual (automático)
            };
            
            console.log("Enviando datos de actualización:", data);
            await axiosInstance.put(`/catalog/service-per-customer/${id}`, data);
            navigate("/catalogs/customer");
        } catch (err: any) {
            console.error("Error completo:", err);
            
            if (err.response && err.response.data) {
                console.error("Detalles del error:", err.response.data);
                
                if (err.response.data.detail) {
                    setError(`Error: ${err.response.data.detail}`);
                } else {
                    setError(`Error de validación: ${JSON.stringify(err.response.data)}`);
                }
            } else if (err.response) {
                setError(`Error ${err.response.status}: ${err.response.statusText}`);
            } else {
                setError("Could not update the record. Please check the data and try again.");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/customer");
    };

    if (loading) {
        return (
            <AISGBackground>
                <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                        <p className="mt-4">Loading record data...</p>
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
                            Edit Service per Customer
                        </h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        <p className="text-gray-500 mt-2 font-light text-center">
                            Editing record #{id}
                        </p>
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
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Service ID"
                                        value={form.id_service}
                                        onChange={(e) => setForm({ ...form, id_service: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Client</label>
                                    {clientsLoading ? (
                                        <div className="w-full px-4 py-3 rounded-lg bg-gray-200 animate-pulse text-center">
                                            Loading clients...
                                        </div>
                                    ) : (
                                        <select
                                            className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
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
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Company ID"
                                        type="number"
                                        value={form.id_company}
                                        onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Minutes Included</label>
                                    <input
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Minutes Included"
                                        type="number"
                                        value={form.minutes_included}
                                        onChange={(e) => setForm({ ...form, minutes_included: +e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Minutes Minimum</label>
                                    <input
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Minutes Minimum"
                                        type="number"
                                        value={form.minutes_minimum}
                                        onChange={(e) => setForm({ ...form, minutes_minimum: +e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Technicians Included</label>
                                    <input
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
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
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Fuselage Type"
                                        value={form.fuselage_type}
                                        onChange={(e) => setForm({ ...form, fuselage_type: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4 pt-4 justify-end">
                                <button
                                    type="button"
                                    className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={handleCancel}
                                    disabled={updating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`w-1/2 ${
                                        updating ? "bg-gray-500" : "bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935]"
                                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update"
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

export default EditSPConsumer;