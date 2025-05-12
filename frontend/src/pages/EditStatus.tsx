import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Componente para editar un estatus de servicio existente.
 * Permite modificar el nombre del estatus y guardar los cambios en el backend.
 * Incluye carga de datos, validación, manejo de errores y navegación tras guardar o cancelar.
 */
const EditStatus: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const apiURL = import.meta.env.VITE_API_URL || "http://82.165.213.124:8000";

    // Estado para el nombre del estatus
    const [statusName, setStatusName] = useState("");
    // Estado para mostrar spinner de carga al guardar
    const [isLoading, setIsLoading] = useState(false);
    // Estado para mostrar spinner de carga al obtener datos
    const [isFetching, setIsFetching] = useState(true);
    // Estado para mensajes de error
    const [error, setError] = useState("");

    // Cargar datos del estatus existente al montar el componente
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsFetching(true);
                const res = await axios.get(`${apiURL}/catalog/service-status/${id}`);
                setStatusName(res.data.status_name);
                setIsFetching(false);
            } catch (err: any) {
                console.error("Error al cargar estatus:", err);
                setError("No se pudo cargar la información del estatus. Intente nuevamente.");
                setIsFetching(false);
            }
        };

        fetchStatus();
    }, [id, apiURL]);

    /**
     * Maneja el envío del formulario.
     * Valida el campo y realiza la petición PUT al backend.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!statusName.trim()) {
            setError("El nombre del estatus es obligatorio");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            await axios.put(`${apiURL}/catalog/service-status/${id}`, {
                status_name: statusName
            });

            navigate("/catalogs/status");
        } catch (err: any) {
            console.error("Error al actualizar estatus:", err);
            if (err.response) {
                setError(`Error (${err.response.status}): ${err.response.data.detail || "No se pudo actualizar el estatus"}`);
            } else {
                setError("No se pudo actualizar el estatus. Verifique su conexión e intente nuevamente.");
            }
            setIsLoading(false);
        }
    };

    /**
     * Maneja la acción de cancelar, redirigiendo al listado.
     */
    const handleCancel = () => {
        navigate("/catalogs/status");
    };

    // Muestra spinner mientras se cargan los datos
    if (isFetching) {
        return (
            <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                    <p className="mt-4">Cargando datos del estatus...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
            <div className="max-w-2xl mx-auto">
                {/* Cabecera */}
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg mb-0">
                    <h1 className="text-2xl font-bold text-center text-white">
                        Editar Estatus
                    </h1>
                    <p className="text-gray-200 mt-2 font-light text-center">
                        ID: {id} - Modificando estatus de servicio
                    </p>
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
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre del Estatus *
                            </label>
                            <input
                                type="text"
                                className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                                placeholder="Ej: En Proceso, Completado, etc."
                                value={statusName}
                                onChange={(e) => setStatusName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
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
                                        Actualizando...
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
                    </form>
                    <p className="text-xs text-gray-400 mt-6">* Campos obligatorios</p>
                </div>
            </div>
        </div>
    );
};

export default EditStatus;