import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Componente para agregar una nueva configuración de compañía.
 * Permite ingresar el ID de la compañía, si aplica detalle y si está activa.
 * Realiza validación, muestra errores y navega tras guardar o cancelar.
 */
const AddCompany: React.FC = () => {
    // Paleta de colores corporativos AISG
    const colors = {
        aisgBlue: "#0033A0",
        aisgGreen: "#00B140",
        aisgLightBlue: "#4D70B8",
        aisgLightGreen: "#4DC970",
        darkBg: "#1A1A2E",
        darkBgSecondary: "#16213E",
        darkBgTertiary: "#0D1B2A",
        darkBgPanel: "#1E2A45",
    };

    // Hook para navegación programática
    const navigate = useNavigate();

    // Estado del formulario
    const [form, setForm] = useState({
        id_company: "",
        applies_detail: false,
        status: true,
    });

    // Estado para mensajes de error
    const [error, setError] = useState("");

    /**
     * Maneja el envío del formulario.
     * Valida y realiza la petición POST al backend.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = {
                id_company: parseInt(form.id_company),
                applies_detail: form.applies_detail,
                status: form.status,
            };

            // Envía la nueva configuración al backend
            await axios.post("http://localhost:8000/catalog/extra-company-configuration", data);

            // Redirige al listado de compañías tras guardar
            navigate("/catalogs/company");
        } catch (err) {
            console.error("Error al guardar la configuración", err);
            setError("Could not save the configuration. Please check the data and try again.");
        }
    };

    /**
     * Maneja la acción de cancelar, redirigiendo al listado.
     */
    const handleCancel = () => {
        navigate("/catalogs/company");
    };

    return (
        <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
            <div className="max-w-2xl mx-auto">
                {/* Cabecera con título y descripción */}
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
                    <h1 className="text-2xl font-bold text-center text-white">
                        Add Company Configuration
                    </h1>
                    <p className="text-gray-200 mt-2 font-light text-center">
                        Creating new company configuration
                    </p>
                </div>

                {/* Formulario principal */}
                <div className="bg-[#16213E] p-6 rounded-lg shadow-lg">
                    {/* Mensaje de error */}
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Campo: ID Compañía */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Company ID</label>
                            <input
                                className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                placeholder="Company ID"
                                value={form.id_company}
                                onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Enter the numeric company ID</p>
                        </div>

                        {/* Campo: Configuración (aplica detalle y activo) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Configuration</label>
                            <div className="space-y-4 bg-[#1E2A45] p-4 rounded-md border border-gray-700">
                                {/* Switch: Aplica Detalle */}
                                <div className="flex items-center">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={form.applies_detail}
                                            onChange={(e) => setForm({ ...form, applies_detail: e.target.checked })}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-300">Applies Detail</span>
                                    </label>
                                </div>
                                {/* Switch: Activo */}
                                <div className="flex items-center">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.checked })}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
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
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCompany;