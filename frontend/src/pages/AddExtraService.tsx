import React, { useState } from "react";
import axiosInstance from '../api/axiosInstance';

import { useNavigate } from "react-router-dom";

/**
 * Componente para agregar una nueva asignación de servicio extra.
 * Permite ingresar los IDs de servicio por cliente, vuelo, empleado, la orden de trabajo y el estado.
 * Realiza validación de campos, muestra errores y permite cancelar o guardar.
 */
const AddExtraService: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        id_service_per_customer: "",
        id_sale_flight: "",
        id_sale_employee: "",
        work_order: "",
        status: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError("");

            if (!form.id_service_per_customer || !form.id_sale_flight || !form.id_sale_employee || !form.work_order) {
                setError("Please complete all required fields.");
                setIsLoading(false);
                return;
            }

            await axiosInstance.post(`/catalog/extra-service-sale-assignment`, {
                id_service_per_customer: parseInt(form.id_service_per_customer),
                id_sale_flight: parseInt(form.id_sale_flight),
                id_sale_employee: parseInt(form.id_sale_employee),
                work_order: form.work_order,
                status: form.status
            });

            navigate("/catalogs/assignment");
        } catch (err: any) {
            if (err.response) {
                setError(`Error (${err.response.status}): ${err.response.data.detail || "Could not save the assignment."}`);
            } else {
                setError("Could not save the assignment. Please check the data and try again.");
            }
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/assignment");
    };

    return (
        <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                    <h1 className="text-2xl font-bold text-center text-[#002057]">
                        Add Extra Service Assignment
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
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Service per Customer ID
                            </label>
                            <input
                                type="number"
                                value={form.id_service_per_customer}
                                onChange={e => setForm({ ...form, id_service_per_customer: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                                placeholder="Enter service per customer ID"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Flight ID
                            </label>
                            <input
                                type="number"
                                value={form.id_sale_flight}
                                onChange={e => setForm({ ...form, id_sale_flight: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                                placeholder="Enter flight ID"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Employee ID
                            </label>
                            <input
                                type="number"
                                value={form.id_sale_employee}
                                onChange={e => setForm({ ...form, id_sale_employee: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                                placeholder="Enter employee ID"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                Work Order
                            </label>
                            <input
                                type="text"
                                value={form.work_order}
                                onChange={e => setForm({ ...form, work_order: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                                placeholder="Enter work order"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.checked })}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${form.status ? 'bg-[#00B140]' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${form.status ? 'transform translate-x-4' : ''}`}></div>
                                <span className="ml-3 text-white font-medium">
                                    {form.status ? "Active" : "Inactive"}
                                </span>
                            </label>
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-1/2 ${
                                    isLoading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"
                                } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                            >
                                {isLoading ? (
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
    );
};

export default AddExtraService;