import React, { useState, useRef, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';
import API_ROUTES from '../api/routes';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

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
    
    // Estados para los popups
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showDuplicateWarningPopup, setShowDuplicateWarningPopup] = useState(false);

    // Referencias para manejar el foco
    const idServicePerCustomerInputRef = useRef<HTMLInputElement>(null);
    const successOkButtonRef = useRef<HTMLButtonElement>(null);
    const duplicateOkButtonRef = useRef<HTMLButtonElement>(null);

    // Efecto para enfocar el input al cargar el formulario
    useEffect(() => {
        if (idServicePerCustomerInputRef.current) {
            idServicePerCustomerInputRef.current.focus();
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
     * Verifica si una asignación duplicada ya existe
     */
    const checkDuplicateAssignment = async () => {
        try {
            const res = await axiosInstance.get(API_ROUTES.CATALOG.EXTRA_SERVICE_SALE_ASSIGNMENT);
            return res.data.some((item: any) => 
                item.id_service_per_customer.toString() === form.id_service_per_customer &&
                item.id_sale_flight.toString() === form.id_sale_flight &&
                item.id_sale_employee.toString() === form.id_sale_employee &&
                item.work_order === form.work_order
            );
        } catch (err) {
            console.error("Error checking for duplicate assignment", err);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!form.id_service_per_customer || !form.id_sale_flight || !form.id_sale_employee || !form.work_order) {
            setError("Please complete all required fields.");
            setIsLoading(false);
            return;
        }

        try {
            // Verificar si la asignación ya existe
            const isDuplicate = await checkDuplicateAssignment();
            if (isDuplicate) {
                setShowDuplicateWarningPopup(true);
                setIsLoading(false);
                return;
            }

            const whonew = sessionStorage.getItem("userName") || "system";
            
            await axiosInstance.post(API_ROUTES.CATALOG.EXTRA_SERVICE_SALE_ASSIGNMENT, {
                id_service_per_customer: parseInt(form.id_service_per_customer),
                id_sale_flight: parseInt(form.id_sale_flight),
                id_sale_employee: parseInt(form.id_sale_employee),
                work_order: form.work_order,
                status: form.status,
                whonew: whonew
            });

            // Mostrar popup de éxito en lugar de redirigir inmediatamente
            setShowSuccessPopup(true);
        } catch (err: any) {
            if (err.response) {
                setError(`Error (${err.response.status}): ${err.response.data.detail || "Could not save the assignment."}`);
            } else {
                setError("Could not save the assignment. Please check the data and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Cierra el popup y navega al listado de asignaciones
     */
    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        navigate("/catalogs/assignment");
    };

    /**
     * Cierra el popup de advertencia
     */
    const closeDuplicateWarningPopup = () => {
        setShowDuplicateWarningPopup(false);
    };

    const handleCancel = () => {
        navigate("/catalogs/assignment");
    };

    return (
        <AISGBackground>
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
                                    ref={idServicePerCustomerInputRef}
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
                            
                            {/* Campo de Status con switch mejorado */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Status
                                </label>
                                <div className="bg-[#233554] p-4 rounded-lg border border-gray-600">
                                    <div className="flex items-center">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={form.status}
                                                onChange={e => setForm({ ...form, status: e.target.checked })}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00B140] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                            <span className="ml-3 text-sm font-medium text-white">
                                                {form.status ? "Active" : "Inactive"}
                                            </span>
                                        </label>
                                    </div>
                                </div>
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
                                <p className="text-white text-lg">Extra service assignment has been successfully added!</p>
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

            {/* Popup de advertencia de asignación duplicada */}
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
                                <p className="text-white text-lg">An assignment with the same details already exists!</p>
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

export default AddExtraService;