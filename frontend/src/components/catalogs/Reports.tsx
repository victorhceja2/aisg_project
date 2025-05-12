import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente que permite seleccionar visualmente entre los diferentes tipos de reportes del sistema AISG.
 * Cada tarjeta representa un tipo de reporte y al hacer clic se navega a la sección correspondiente.
 */
const ReportSelector: React.FC = () => {
    const navigate = useNavigate();

    // Definimos los colores corporativos de AISG para usarlos en los gradientes y fondos
    const colors = {
        aisgBlue: "#0033A0",
        aisgGreen: "#00B140",
        aisgLightBlue: "#4D70B8",
        aisgLightGreen: "#4DC970",
        darkBg: "#1A1A2E",
        darkBgSecondary: "#16213E",
        darkBgTertiary: "#0D1B2A",
    };

    // Creamos un arreglo con la información de cada tipo de reporte: nombre, ruta, ícono y gradiente
    // Solo mantenemos la opción "Asignación Extra de Servicios"
    const reports = [
        {
            label: "Asignación Extra de Servicios",
            path: "/reports/assignment",
            icon: (
                // Ícono representativo para asignación extra
                <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
            ),
            color: "from-[#0033A0] to-[#4D70B8]"
        }
    ];

    return (
        <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
            <div className="max-w-6xl mx-auto">
                {/* Cabecera principal con título y descripción */}
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-8">
                    <h1 className="text-2xl font-bold text-center text-white">
                        Reportes
                    </h1>
                    <p className="text-gray-200 mt-2 font-light text-center">
                        Sistema de reportes y análisis
                    </p>
                </div>

                {/* Sección de tarjetas, cada una representa un tipo de reporte diferente */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 max-w-md mx-auto">
                    {reports.map(({ label, path, icon, color }) => (
                        <div
                            key={path}
                            onClick={() => navigate(path)}
                            className="bg-[#16213E] rounded-lg shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
                        >
                            {/* Cabecera de la tarjeta con gradiente e ícono */}
                            <div className={`bg-gradient-to-r ${color} p-4 flex items-center justify-center`}>
                                {icon}
                            </div>

                            {/* Cuerpo de la tarjeta con el nombre y una breve instrucción */}
                            <div className="p-6 text-center">
                                <h2 className="text-lg font-medium text-white">{label}</h2>
                                <p className="mt-2 text-sm text-gray-400">
                                    Haz clic para acceder a este reporte
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportSelector;