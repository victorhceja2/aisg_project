import React, { useState, useRef, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

/**
 * Componente para agregar una nueva configuración de compañía.
 * Permite ingresar el ID de la compañía, si aplica detalle y si está activa.
 * Realiza validación, muestra errores y navega tras guardar o cancelar.
 */
const AddCompany: React.FC = () => {
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
    // Estado para mostrar el popup de éxito
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    // Estado para mostrar el popup de advertencia de duplicado
    const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);

    // Referencias para manejar el foco
    const idCompanyInputRef = useRef<HTMLInputElement>(null);
    const successOkButtonRef = useRef<HTMLButtonElement>(null);
    const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

    // Efecto para enfocar el input al cargar el formulario
    useEffect(() => {
        if (idCompanyInputRef.current) {
            idCompanyInputRef.current.focus();
        }
    }, []);

    // Efecto para enfocar el botón OK del popup de éxito
    useEffect(() => {
        if (showSuccessPopup && successOkButtonRef.current) {
            setTimeout(() => {
                successOkButtonRef.current?.focus();
            }, 100);
        }
    }, [showSuccessPopup]);

    // Efecto para enfocar el botón OK del popup de advertencia
    useEffect(() => {
        if (showDuplicateWarningPopup && duplicateOkButtonRef.current) {
            setTimeout(() => {
                duplicateOkButtonRef.current?.focus();
            }, 100);
        }
    }, [showDuplicateWarningPopup]);

    /**
     * Verifica si una configuración de compañía con el mismo ID ya existe
     */
    const checkDuplicateCompany = async (companyId: string) => {
        try {
            const res = await axiosInstance.get(`/catalog/extra-company-configuration/?search=${encodeURIComponent(companyId)}`);
            return res.data.some((item: any) => 
                item.id_company.toString() === companyId
            );
        } catch (err) {
            console.error("Error checking for duplicate company", err);
            return false;
        }
    };

    /**
     * Maneja el envío del formulario.
     * Valida y realiza la petición POST al backend.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.id_company) {
            setError("Company ID is required.");
            return;
        }

        // Verificar si el ID de compañía ya existe
        const isDuplicate = await checkDuplicateCompany(form.id_company);
        if (isDuplicate) {
            setShowDuplicateWarningPopup(true);
            return;
        }

        try {
            const whonew = sessionStorage.getItem("userName") || "system";
            const data = {
                id_company: parseInt(form.id_company),
                applies_detail: form.applies_detail,
                status: form.status,
                whonew: whonew
            };

            // Envía la nueva configuración al backend
            await axiosInstance.post(`/catalog/extra-company-configuration`, data);

            // Mostrar popup de éxito en lugar de redirigir inmediatamente
            setShowSuccessPopup(true);
        } catch (err) {
            console.error("Error al guardar la configuración", err);
            setError("Could not save the configuration. Please check the data and try again.");
        }
    };

    /**
     * Cierra el popup y navega al listado de compañías
     */
    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        navigate("/catalogs/company");
    };

    /**
     * Cierra el popup de advertencia
     */
    const closeDuplicateWarningPopup = () => {
        setShowDuplicateWarningPopup(false);
    };

    /**
     * Maneja la acción de cancelar, redirigiendo al listado.
     */
    const handleCancel = () => {
        navigate("/catalogs/company");
    };

    return (
        <AISGBackground>
            <div className="max-w-7xl mx-auto p-6 font-['Montserrat'] min-h-screen flex items-center justify-center">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                        <h1 className="text-2xl font-bold text-center text-[#002057]">
                            Add Company Configuration
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
                            {/* Campo: ID Compañía */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Company ID
                                </label>
                                <input
                                    type="number"
                                    value={form.id_company}
                                    onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-[#002057] border border-[#cccccc] focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none transition-all"
                                    placeholder="Enter company ID"
                                    required
                                    ref={idCompanyInputRef}
                                />
                                <p className="text-xs text-gray-300 mt-1">Enter the numeric company ID</p>
                            </div>

                            {/* Campo: Configuración */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Configuration
                                </label>
                                <div className="space-y-4 bg-[#233554] p-4 rounded-lg border border-gray-600">
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
                                            <span className="ml-3 text-sm font-medium text-white">Applies Detail</span>
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
                                            <span className="ml-3 text-sm font-medium text-white">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Popup de éxito */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        {/* Encabezado blanco con texto azul */}
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">
                                Success
                            </h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        
                        {/* Cuerpo con fondo azul oscuro */}
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4 justify-center">
                                <div className="bg-[#00B140] rounded-full p-2 mr-4">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg">Company configuration has been successfully added!</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={successOkButtonRef}
                                    onClick={handleClosePopup}
                                    className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup de advertencia de compañía duplicada */}
            {showDuplicateWarningPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        {/* Encabezado blanco con texto azul */}
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">
                                Warning
                            </h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        
                        {/* Cuerpo con fondo azul oscuro */}
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4 justify-center">
                                <div className="bg-[#f59e0b] rounded-full p-2 mr-4">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg">A company with ID "{form.id_company}" already exists!</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={duplicateOkButtonRef}
                                    onClick={closeDuplicateWarningPopup}
                                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AISGBackground>
    );
};

export default AddCompany;