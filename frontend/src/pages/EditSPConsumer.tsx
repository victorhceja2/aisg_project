import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditSPConsumer: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const apiURL = "http://localhost:8000";

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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${apiURL}/catalog/service-per-customer/${id}`);
                const record = res.data;
                setForm({
                    id_service: record.id_service?.toString() || "",
                    id_client: record.id_client?.toString() || "",
                    id_company: record.id_company?.toString() || "",
                    minutes_included: record.minutes_included,
                    minutes_minimun: record.minutes_minimun,
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
                minutes_minimun: form.minutes_minimun,
                fuselage_type: form.fuselage_type,
                technicians_included: form.technicians_included,
                whonew: form.whonew,
            };
            await axios.put(`${apiURL}/catalog/service-per-customer/${id}`, data);
            navigate("/catalogs/customer");
        } catch (err) {
            setError("Could not update the record. Please check the data and try again.");
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/customer");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                    <p className="mt-4">Loading record data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
                    <h1 className="text-2xl font-bold text-center text-white">
                        Edit Service by Airline
                    </h1>
                    <p className="text-gray-200 mt-2 font-light text-center">
                        Editing record #{id}
                    </p>
                </div>
                <div className="bg-[#16213E] p-6 rounded-lg shadow-lg">
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Service ID</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Service ID"
                                    value={form.id_service}
                                    onChange={(e) => setForm({ ...form, id_service: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Client ID</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Client ID"
                                    value={form.id_client}
                                    onChange={(e) => setForm({ ...form, id_client: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Company ID</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Company ID"
                                    value={form.id_company}
                                    onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Minutes Included</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Minutes Included"
                                    type="number"
                                    value={form.minutes_included}
                                    onChange={(e) => setForm({ ...form, minutes_included: +e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Minutes Minimum</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Minutes Minimum"
                                    type="number"
                                    value={form.minutes_minimun}
                                    onChange={(e) => setForm({ ...form, minutes_minimun: +e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Technicians Included</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Technicians Included"
                                    type="number"
                                    value={form.technicians_included}
                                    onChange={(e) => setForm({ ...form, technicians_included: +e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Fuselage Type</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Fuselage Type"
                                    value={form.fuselage_type}
                                    onChange={(e) => setForm({ ...form, fuselage_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Who New</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                    placeholder="Who New"
                                    value={form.whonew}
                                    onChange={(e) => setForm({ ...form, whonew: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSPConsumer;