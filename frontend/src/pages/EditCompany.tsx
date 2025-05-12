import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface ExtraCompanyConfig {
    id_xtra_company: number;
    id_company: number;
    applies_detail: boolean;
    status: boolean;
}

const EditCompany: React.FC = () => {
    // Colores AISG según el manual de identidad corporativa
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

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    // Usar la variable de entorno para la URL del API
    const apiURL = import.meta.env.VITE_API_URL || "http://82.165.213.124:8000";

    const [form, setForm] = useState({
        id_company: "",
        applies_detail: false,
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Cargamos los datos existentes
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                // Usamos la variable apiURL en lugar de la URL hardcodeada
                const res = await axios.get(`${apiURL}/catalog/extra-company-configuration/${id}`);
                const config = res.data;

                setForm({
                    id_company: config.id_company.toString(),
                    applies_detail: config.applies_detail,
                    status: config.status,
                });

                setLoading(false);
            } catch (err) {
                console.error("Error al obtener la configuración", err);
                setError("No se pudo cargar la configuración. Intente nuevamente.");
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

            // También actualizamos esta URL para usar la variable apiURL
            await axios.put(`${apiURL}/catalog/extra-company-configuration/${id}`, data);

            // Redireccionamos a la lista
            navigate("/catalogs/company");
        } catch (err) {
            console.error("Error al actualizar la configuración", err);
            setError("No se pudo actualizar la configuración. Verifique los datos e intente nuevamente.");
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/company");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                    <p className="mt-4">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
            <div className="max-w-2xl mx-auto">
                {/* Cabecera */}
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
                    <h1 className="text-2xl font-bold text-center text-white">
                        Editar Configuración
                    </h1>
                    <p className="text-gray-200 mt-2 font-light text-center">
                        Modificando configuración #{id}
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-[#16213E] p-6 rounded-lg shadow-lg">
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">ID Compañía</label>
                            <input
                                className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                placeholder="ID Compañía"
                                value={form.id_company}
                                onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Ingrese el ID numérico de la compañía</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Configuración</label>
                            <div className="space-y-4 bg-[#1E2A45] p-4 rounded-md border border-gray-700">
                                <div className="flex items-center">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={form.applies_detail}
                                            onChange={(e) => setForm({ ...form, applies_detail: e.target.checked })}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-300">Aplica Detalle</span>
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
                                        <span className="ml-3 text-sm font-medium text-gray-300">Activo</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={handleCancel}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Actualizar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCompany;