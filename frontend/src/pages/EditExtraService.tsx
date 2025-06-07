import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosInstance';
import API_ROUTES from '../api/routes';
import { useNavigate, useParams } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";

interface ExtraServiceAssignment {
    id_xtra_sale_employee: number;
    id_service_per_customer: number;
    id_sale_flight: number;
    id_sale_employee: number;
    work_order: string;
    status: boolean;
}

const EditExtraService: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState({
        id_service_per_customer: "",
        id_sale_flight: "",
        id_sale_employee: "",
        work_order: "",
        status: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");

    // Estados para los popups
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    // Referencias para manejar el foco
    const successOkButtonRef = useRef<HTMLButtonElement>(null);
    const errorOkButtonRef = useRef<HTMLButtonElement>(null);

    // Referencia para el primer campo del formulario
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Efecto para enfocar el primer campo DESPUÉS de que se carguen los datos
    useEffect(() => {
        if (!isFetching && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        }
    }, [isFetching]);

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
        const fetchData = async () => {
            try {
                setIsFetching(true);
                const res = await axiosInstance.get<ExtraServiceAssignment>(`${API_ROUTES.CATALOG.EXTRA_SERVICE_SALE_ASSIGNMENT}/${id}`);
                const assignment = res.data;

                setForm({
                    id_service_per_customer: assignment.id_service_per_customer.toString(),
                    id_sale_flight: assignment.id_sale_flight.toString(),
                    id_sale_employee: assignment.id_sale_employee.toString(),
                    work_order: assignment.work_order,
                    status: assignment.status,
                });

                setIsFetching(false);
            } catch (err: any) {
                setError("Could not load the assignment information. Please try again.");
                setIsFetching(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return; // Prevenir múltiples envíos

        try {
            setIsLoading(true);
            setError("");

            if (!form.id_service_per_customer || !form.id_sale_flight || !form.id_sale_employee || !form.work_order) {
                setError("Please complete all required fields.");
                setShowErrorPopup(true);
                setIsLoading(false);
                return;
            }

            await axiosInstance.put(`${API_ROUTES.CATALOG.EXTRA_SERVICE_SALE_ASSIGNMENT}/${id}`, {
                id_service_per_customer: parseInt(form.id_service_per_customer),
                id_sale_flight: parseInt(form.id_sale_flight),
                id_sale_employee: parseInt(form.id_sale_employee),
                work_order: form.work_order,
                status: form.status,
            });

            // Mostrar popup de éxito en lugar de navegar inmediatamente
            setShowSuccessPopup(true);
        } catch (err: any) {
            let errorMessage = "Could not update the assignment. Please check the data and try again.";
            
            if (err.response) {
                errorMessage = `Error (${err.response.status}): ${err.response.data.detail || errorMessage}`;
            }
            
            setError(errorMessage);
            setShowErrorPopup(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/catalogs/assignment");
    };

    /**
     * Cierra el popup de éxito y navega al listado
     */
    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
        navigate("/catalogs/assignment");
    };

    /**
     * Cierra el popup de error
     */
    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setError("");
    };

    if (isFetching) {
        return (
            <AISGBackground>
                <div className="flex items-center justify-center min-h-screen text-white font-['Montserrat']">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140] mx-auto"></div>
                        <p className="mt-4">Loading assignment data...</p>
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
                            Edit Extra Service Assignment
                        </h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
                        <p className="text-gray-500 mt-2 font-light text-center">
                            Editing assignment #{id}
                        </p>
                    </div>
                    <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
                        {error && !showErrorPopup && (
                            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                                <p className="font-medium">{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Service per Customer ID *
                                    </label>
                                    <input
                                        ref={firstInputRef} // Asignamos la referencia al primer input
                                        type="number"
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="e.g. 1001"
                                        value={form.id_service_per_customer}
                                        onChange={(e) => setForm({ ...form, id_service_per_customer: e.target.value })}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Flight ID *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="e.g. 2050"
                                        value={form.id_sale_flight}
                                        onChange={(e) => setForm({ ...form, id_sale_flight: e.target.value })}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Employee ID *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="e.g. 3075"
                                        value={form.id_sale_employee}
                                        onChange={(e) => setForm({ ...form, id_sale_employee: e.target.value })}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Work Order *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white text-[#002057] px-4 py-3 rounded-lg border border-[#cccccc] focus:border-[#4D70B8] focus:ring-2 focus:ring-[#4D70B8] focus:outline-none transition-all"
                                        placeholder="e.g. WO-12345"
                                        value={form.work_order}
                                        onChange={(e) => setForm({ ...form, work_order: e.target.value })}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.checked })}
                                        disabled={isLoading}
                                    />
                                    <div className="relative">
                                        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${form.status ? 'bg-[#00B140]' : 'bg-gray-600'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${form.status ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-white font-medium">{form.status ? "Active" : "Inactive"}</span>
                                </label>
                            </div>
                            <div className="flex space-x-4 pt-4 justify-end">
                                <button
                                    type="button"
                                    className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`w-1/2 ${
                                        isLoading ? "bg-gray-500" : "bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935]"
                                    } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Update
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        <p className="text-xs text-gray-400 mt-6">* Required fields</p>
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
                                <p className="text-white text-lg">Extra service assignment has been successfully updated!</p>
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

export default EditExtraService;