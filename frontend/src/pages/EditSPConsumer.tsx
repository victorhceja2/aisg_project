import React, { useEffect, useState } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditSPConsumer: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    // apiURL ya no es necesario, usando axiosInstance

    const [form, setForm] = useState({
        id_service: "",
        id_client: "",
        id_company: "",
        minutes_included: 0,
        minutes_minimum: 0, // CORREGIDO: "minimum" en lugar de "minimun"
        fuselage_type: "",
        technicians_included: 0,
        whonew: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                    minutes_minimum: record.minutes_minimum, // CORREGIDO: "minimum" en lugar de "minimun"
                    fuselage_type: record.fuselage_type,
                    technicians_included: record.technicians_included,
                    whonew: record.whonew || "",
                });
                setLoading(false);
            } catch (err) {
                setError("Could not load the record. Please try again.");
                setLoading(false);
            }
        };
        fetchData();
    }, [id, apiURL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                id_service: parseInt(form.id_service),
                id_client: parseInt(form.id_client),
                id_company: parseInt(form.id_company),
                minutes_included: form.minutes_included,
                minutes_minimum: form.minutes_minimum, // CORREGIDO: "minimum" en lugar de "minimun"
                fuselage_type: form.fuselage_type,
                technicians_included: form.technicians_included,
                whonew: form.whonew,
            };
            
            console.log("Enviando datos de actualización:", data);
            await axiosInstance.put(`/catalog/service-per-customer/${id}`, data);
            navigate("/catalogs/customer");
        } catch (err: any) {
            console.error("Error al actualizar:", err);
            if (err.response) {
                console.error("Detalle del error:", err.response.data);
                if (err.response.data.detail) {
                    setError(`Error: ${err.response.data.detail}`);
                } else {
                    setError(`Error ${err.response.status}: ${err.response.statusText}`);
                }
            } else {
                setError("Could not update the record. Please check the data and try again.");
            }
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
                            Edit Service by Airline
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
                                    <label className="block text-white text-sm font-medium mb-2">Client ID</label>
                                    <input
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Client ID"
                                        value={form.id_client}
                                        onChange={(e) => setForm({ ...form, id_client: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Company ID</label>
                                    <input
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Company ID"
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
                                        value={form.minutes_minimum} // CORREGIDO: "minimum" en lugar de "minimun"
                                        onChange={(e) => setForm({ ...form, minutes_minimum: +e.target.value })} // CORREGIDO: "minimum" en lugar de "minimun"
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
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">Who New</label>
                                    <input
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="Who New"
                                        value={form.whonew}
                                        onChange={(e) => setForm({ ...form, whonew: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4 pt-4 justify-end">
                                <button
                                    type="button"
                                    className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Update
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