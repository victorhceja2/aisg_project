import React, { useEffect, useState, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditCompany: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState({
        id_company: "",
        applies_detail: false,
        status: true,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estados para los popups
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    // Referencias para manejar el foco
    const successOkButtonRef = useRef<HTMLButtonElement>(null);
    const errorOkButtonRef = useRef<HTMLButtonElement>(null);

    // Referencia para el primer campo del formulario (Company ID input)
    const companyIdInputRef = useRef<HTMLInputElement>(null);

    // Efecto para enfocar el primer campo DESPUÉS de que se carguen los datos
    useEffect(() => {
        if (!loading && companyIdInputRef.current) {
            setTimeout(() => {
                companyIdInputRef.current?.focus();
            }, 100);
        }
    }, [loading]);

    // Efecto para enfocar el botón OK del popup de éxito
    useEffect(() => {
        if (showSuccessPopup && successOkButtonRef.current) {
            setTimeout(() => {
                successOkButtonRef.current?.focus();
            }, 100);
        }
    }, [showSuccessPopup]);

    // Efecto para enfocar el botón OK del popup de error
    useEffect(() => {
        if (showErrorPopup && errorOkButtonRef.current) {
            setTimeout(() => {
                errorOkButtonRef.current?.focus();
            }, 100);
        }
    }, [showErrorPopup]);

    // Efecto para manejar Enter en los popups
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (showSuccessPopup) {
                    e.preventDefault();
                    handleCloseSuccessPopup();
                } else if (showErrorPopup) {
                    e.preventDefault();
                    closeErrorPopup();
                }
            }
        };

        if (showSuccessPopup || showErrorPopup) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showSuccessPopup, showErrorPopup]);

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
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Prevenir múltiples envíos
        
        try {
            setIsSubmitting(true);
            setError("");
            
            // Obtener el usuario que está actualizando
            const whoupdate = sessionStorage.getItem("userName") || "admin";
            
            const data = {
                id_company: parseInt(form.id_company),
                applies_detail: form.applies_detail,
                status: form.status,
                whoupdate, // Agregar quién está actualizando
            };
            
            await axiosInstance.put(`/catalog/extra-company-configuration/${id}`, data);
            
            // Mostrar popup de éxito en lugar de navegar inmediatamente
            setShowSuccessPopup(true);
        } catch (err: any) {
            let errorMessage = "Could not update the configuration. Please check the data and try again.";
            
            if (err.response && err.response.data) {
                errorMessage = err.response.data.detail || errorMessage;
            }
            
            setError(errorMessage);
            setShowErrorPopup(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/company");
    };

    /**
     * Cierra el popup de éxito y navega al listado
     */
    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
        navigate("/catalogs/company");
    };

    /**
     * Cierra el popup de error
     */
    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setError("");
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
                        {error && !showErrorPopup && (
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
                                    disabled={isSubmitting}
                                    ref={companyIdInputRef} // Asignamos la referencia al input
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
                                                disabled={isSubmitting}
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
                                                disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-1/2 ${
                                        isSubmitting ? "bg-gray-500" : "bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935]"
                                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update"
                                    )}
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
                                <p className="text-white text-lg">Company configuration has been successfully updated!</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={successOkButtonRef}
                                    onClick={handleCloseSuccessPopup}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCloseSuccessPopup();
                                        }
                                    }}
                                    className="w-full bg-[#00B140] hover:bg-[#009935] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup de error */}
            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="overflow-hidden max-w-md w-full mx-4 rounded-lg shadow-xl">
                        {/* Encabezado blanco con texto azul */}
                        <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-[#002057]">
                                Error
                            </h2>
                            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        </div>
                        
                        {/* Cuerpo con fondo azul oscuro */}
                        <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                            <div className="flex items-center mb-4 justify-center">
                                <div className="bg-[#dc2626] rounded-full p-2 mr-4">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg">{error}</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={errorOkButtonRef}
                                    onClick={closeErrorPopup}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            closeErrorPopup();
                                        }
                                    }}
                                    className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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

export default EditCompany;