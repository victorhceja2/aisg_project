import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

const EditCSI: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [serviceName, setServiceName] = useState("");
    const [originalName, setOriginalName] = useState(""); // Guardamos el nombre original para comparar
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    // Estados para los popups
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);
    
    const navigate = useNavigate();

    // Referencias para manejar el foco
    const successOkButtonRef = useRef<HTMLButtonElement>(null);
    const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

    // Referencia para el primer campo del formulario (Service Name input)
    const serviceNameInputRef = useRef<HTMLInputElement>(null);

    // Efecto para enfocar el primer campo DESPUÉS de que se carguen los datos
    useEffect(() => {
        if (!initialLoading && serviceNameInputRef.current) {
            setTimeout(() => {
                serviceNameInputRef.current?.focus();
            }, 100);
        }
    }, [initialLoading]);

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

    // Efecto para manejar Enter en los popups
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (showSuccessPopup) {
                    e.preventDefault();
                    handleClosePopup();
                } else if (showDuplicateWarningPopup) {
                    e.preventDefault();
                    closeDuplicateWarningPopup();
                }
            }
        };

        if (showSuccessPopup || showDuplicateWarningPopup) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showSuccessPopup, showDuplicateWarningPopup]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`Fetching service include with ID: ${id}`);
                const res = await axiosInstance.get(`/catalog/service-includes`);
                
                if (res.data && Array.isArray(res.data)) {
                    const serviceInclude = res.data.find(
                        (item: any) => item.id_service_include.toString() === id
                    );
    
                    if (serviceInclude) {
                        console.log("Service include found:", serviceInclude);
                        setServiceName(serviceInclude.service_include);
                        setOriginalName(serviceInclude.service_include); // Guardamos el nombre original
                        setError(null);
                    } else {
                        console.error(`Service include with ID ${id} not found in response`);
                        setError(`Service include with ID ${id} not found.`);
                    }
                } else {
                    console.error("Response data is not an array:", res.data);
                    setError("Invalid response from server.");
                }
            } catch (err) {
                console.error("Error loading service include:", err);
                setError("Could not load the service include data. Please check network connection or try again later.");
            } finally {
                setInitialLoading(false);
            }
        };

        if (id) {
            fetchData();
        } else {
            setError("No service include ID provided.");
            setInitialLoading(false);
        }
    }, [id]);

    /**
     * Verifica si un service include con el mismo nombre ya existe
     */
    const checkDuplicateServiceInclude = async (name: string) => {
        try {
            const res = await axiosInstance.get(`/catalog/service-includes`);
            // Si hay resultados, verificamos si alguno coincide exactamente con el nombre
            // pero ignoramos el elemento actual que estamos editando
            return res.data.some((item: any) => 
                item.service_include.toLowerCase() === name.toLowerCase() && 
                item.id_service_include.toString() !== id
            );
        } catch (err) {
            console.error("Error checking for duplicate service include", err);
            return false; // En caso de error, asumimos que no es duplicado
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        if (!serviceName.trim()) {
            setError("Service include name is required.");
            setLoading(false);
            return;
        }

        try {
            // Solo realizar la verificación si el nombre ha cambiado
            if (serviceName.toLowerCase() !== originalName.toLowerCase()) {
                // Verificar si el nombre ya existe
                const isDuplicate = await checkDuplicateServiceInclude(serviceName);
                if (isDuplicate) {
                    // Mostrar el popup de advertencia
                    setShowDuplicateWarningPopup(true);
                    setLoading(false);
                    return;
                }
            }
            
            // Obtenemos el nombre de usuario actual desde localStorage y luego de sessionStorage
            let currentUser = localStorage.getItem("userName");
            
            // Si no existe en localStorage, intentamos con sessionStorage
            if (!currentUser) {
                currentUser = sessionStorage.getItem("userName");
            }
            
            // Si aún no hay nombre, usamos un valor por defecto
            if (!currentUser) {
                currentUser = "system";
            }
            
            console.log("Current user updating record:", currentUser);
            
            // Al revisar el código del backend en service_catalogs.py, vemos que la función
            // update_service_include espera que se envíe el campo "service_include" para el nombre del
            // servicio y "whonew" para el usuario que lo actualiza (NO usa "whoedit")
            const payload = {
                service_include: serviceName,
                whonew: currentUser  // Este es el campo esperado por el backend
            };
            
            console.log("Sending update payload:", payload);
            
            // Enviamos la solicitud PUT con los datos actualizados
            const response = await axiosInstance.put(`/catalog/service-includes/${id}`, payload);
            
            console.log("Update response:", response.data);
            
            // Mostrar popup de éxito en lugar de redirigir inmediatamente
            setShowSuccessPopup(true);
        } catch (err: any) {
            console.error("Error updating service include:", err);
            setError(err.response?.data?.message || "Could not update the service include. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cierra el popup y navega al listado de service includes
     */
    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        navigate("/catalogs/serviceinclude");
    };

    /**
     * Cierra el popup de advertencia
     */
    const closeDuplicateWarningPopup = () => {
        setShowDuplicateWarningPopup(false);
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
                                    ref={serviceNameInputRef} // Asignamos la referencia al input
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
                                    className={`w-1/2 ${loading ? "bg-gray-500" : "bg-[#00B140] hover:bg-[#009935]"} 
                                    text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
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
                                <p className="text-white text-lg">Service include has been successfully updated!</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={successOkButtonRef}
                                    onClick={handleClosePopup}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleClosePopup();
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
            
            {/* Popup de advertencia de servicio duplicado */}
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
                                <p className="text-white text-lg">A service include with the name "{serviceName}" already exists!</p>
                            </div>
                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    ref={duplicateOkButtonRef}
                                    onClick={closeDuplicateWarningPopup}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            closeDuplicateWarningPopup();
                                        }
                                    }}
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

export default EditCSI;