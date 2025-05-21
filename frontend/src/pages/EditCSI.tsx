import React, { useState, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditCSI: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [serviceName, setServiceName] = useState("");
    const [whonew, setWhonew] = useState("system");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    // apiURL ya no es necesario, usando axiosInstance
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get(`/catalog/service-includes`);
                const serviceInclude = res.data.find((item: any) => item.id_service_include.toString() === id);

                if (serviceInclude) {
                    setServiceName(serviceInclude.service_include);
                } else {
                    setError("Service include not found.");
                }
            } catch (err) {
                setError("Could not load the service include data.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, [id, apiURL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axiosInstance.put(`/catalog/service-includes/${id}`, {
                service_include: serviceName,
                whonew
            });

            navigate("/catalogs/serviceinclude");
        } catch (err) {
            setError("Could not update the service include. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <AISGBackground>
                <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto mb-4"></div>
                        <p className="text-lg">Loading service include data...</p>
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
                            Edit Service Include
                        </h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        <p className="text-gray-500 mt-2 font-light text-center">
                            Editing include #{id}
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
                                    Include Name
                                </label>
                                <input
                                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none transition-all"
                                    value={serviceName}
                                    onChange={e => setServiceName(e.target.value)}
                                    placeholder="Enter service include name"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/catalogs/serviceinclude")}
                                    className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-1/2 ${loading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                                        } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                                >
                                    {loading ? (
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

export default EditCSI;