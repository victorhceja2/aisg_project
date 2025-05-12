import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface ExtraServiceAssignment {
    id_xtra_sale_employee: number;
    id_service_per_customer: number;
    id_sale_flight: number;
    id_sale_employee: number;
    work_order: string;
    status: boolean;
}

const EditExtraService: React.FC = () => {
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
        id_service_per_customer: "",
        id_sale_flight: "",
        id_sale_employee: "",
        work_order: "",
        status: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");

    // Cargar datos de la asignación
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsFetching(true);
                const res = await axios.get<ExtraServiceAssignment>(`${apiURL}/catalog/extra-service-sale-assignment/${id}`);
                const assignment = res.data;

                setForm({
                    id_service_per_customer: assignment.id_service_per_customer.toString(),
                    id_sale_flight: assignment.id_sale_flight.toString(),
                    id_sale_employee: assignment.id_sale_employee.toString(),
                    work_order: assignment.work_order,
                    status: assignment.status
                });

                setIsFetching(false);
            } catch (err: any) {
                console.error("Error al cargar la asignación", err);
                setError("No se pudo cargar la información de la asignación. Intente nuevamente.");
                setIsFetching(false);
            }
        };

        fetchData();
    }, [id, apiURL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError("");

            // Validar los datos del formulario
            if (!form.id_service_per_customer || !form.id_sale_flight || !form.id_sale_employee || !form.work_order) {
                setError("Por favor complete todos los campos obligatorios.");
                setIsLoading(false);
                return;
            }

            // Enviar los datos al backend
            await axios.put(`${apiURL}/catalog/extra-service-sale-assignment/${id}`, {
                id_service_per_customer: parseInt(form.id_service_per_customer),
                id_sale_flight: parseInt(form.id_sale_flight),
                id_sale_employee: parseInt(form.id_sale_employee),
                work_order: form.work_order,
                status: form.status
            });

            // Redirigir a la lista principal - CORREGIDO
            navigate("/catalogs/assignment");
            setIsLoading(false);

        } catch (err: any) {
            console.error("Error al actualizar asignación", err);
            if (err.response) {
                setError(`Error (${err.response.status}): ${err.response.data.detail || "No se pudo actualizar la asignación"}`);
            } else {
                setError("No se pudo actualizar la asignación. Verifique los datos e intente nuevamente.");
            }
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // CORREGIDO - Redirección a la ruta correcta
        navigate("/catalogs/assignment");
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                    <p className="mt-4">Cargando datos de la asignación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
            <div className="max-w-3xl mx-auto">
                {/* Cabecera con logo y título */}
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg mb-0">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Editar Asignación de Servicio
                            </h1>
                            <p className="text-gray-200 mt-1 font-light">
                                ID: {id} - Modificando asignación de servicio extra
                            </p>
                        </div>

                        {/* Logo de AISG */}
                        <div className="flex items-center">
                            <div className="bg-white p-2 rounded-full shadow-md">
                                <svg className="w-10 h-10 text-[#0033A0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-[#16213E] p-6 rounded-b-lg shadow-lg">
                    {error && (
                        <div className="bg-red-500 bg-opacity-10 border border-red-400 text-red-100 px-4 py-3 rounded mb-6 flex items-start">
                            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        ID Servicio Cliente *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                        placeholder="Ej: 1001"
                                        value={form.id_service_per_customer}
                                        onChange={(e) => setForm({ ...form, id_service_per_customer: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        ID Vuelo *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                        placeholder="Ej: 2050"
                                        value={form.id_sale_flight}
                                        onChange={(e) => setForm({ ...form, id_sale_flight: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        ID Empleado *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                        placeholder="Ej: 3075"
                                        value={form.id_sale_employee}
                                        onChange={(e) => setForm({ ...form, id_sale_employee: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Orden de Trabajo *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                        placeholder="Ej: WO-12345"
                                        value={form.work_order}
                                        onChange={(e) => setForm({ ...form, work_order: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.checked })}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${form.status ? 'bg-[#00B140]' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${form.status ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-gray-300 font-medium">
                                        {form.status ? "Activo" : "Inactivo"}
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    type="button"
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-l-2 border-white mr-2"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Actualizar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                    <p className="text-xs text-gray-400 mt-6">* Campos obligatorios</p>
                </div>
            </div>
        </div>
    );
};

export default EditExtraService;