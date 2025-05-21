import React, { useEffect, useState } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditCompany: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    // apiURL ya no es necesario, usando axiosInstance

    const [form, setForm] = useState({
        id_company: "",
        applies_detail: false,
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/catalog/extra-company-configuration/${id}`);
                const config = res.data;
                setForm({
                    id_company: config.id_company.toString(),
                    applies_detail: config.applies_detail,
                    status: config.status,
                });
                setLoading(false);
            } catch (err) {
                setError("Could not load the configuration. Please try again.");
                setLoading(false);
            }
        };
        fetchConfig();
    }, [id, apiURL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                id_company: parseInt(form.id_company),
                applies_detail: form.applies_detail,
                status: form.status,
            };
            await axiosInstance.put(`/catalog/extra-company-configuration/${id}`, data);
            navigate("/catalogs/company");
        } catch (err) {
            setError("Could not update the configuration. Please check the data and try again.");
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/company");
    };

    if (loading) {
        return (
            <AISGBackground>
                <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                        <p className="mt-4">Loading configuration...</p>
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
                            Edit Company Configuration
                        </h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        <p className="text-gray-500 mt-2 font-light text-center">
                            Editing configuration #{id}
                        </p>
                    </div>
                    <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                        {error && (
                            <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
                                <p>{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">Company ID</label>
                                <input
                                    className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                    placeholder="Company ID"
                                    value={form.id_company}
                                    onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-gray-300 mt-1">Enter the numeric company ID</p>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">Configuration</label>
                                <div className="space-y-4 bg-[#22325c] p-4 rounded-md border border-gray-700">
                                    <div className="flex items-center">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={form.applies_detail}
                                                onChange={(e) => setForm({ ...form, applies_detail: e.target.checked })}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            <span className="ml-3 text-sm font-medium text-white">Applies Detail</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={form.status}
                                                onChange={(e) => setForm({ ...form, status: e.target.checked })}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            <span className="ml-3 text-sm font-medium text-white">Active</span>
                                        </label>
                                    </div>
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

export default EditCompany;