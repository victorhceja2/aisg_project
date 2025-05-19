import React from "react";
import { useNavigate } from "react-router-dom";
import AISGBackground from "../catalogs/fondo";

const ReportSelector: React.FC = () => {
    const navigate = useNavigate();

    const reports = [
        {
            label: "Extra Service Assignment (In development)",
            path: "/reports/assignment",
            icon: (
                <svg className="w-8 h-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
            ),
            color: "from-[#0033A0] to-[#4D70B8]",
            disabled: true
        },
        {
            label: "Operations Report",
            path: "/reports/operations",
            icon: (
                <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 11V7a4 4 0 00-8 0v4M12 17v.01"></path>
                </svg>
            ),
            color: "from-[#00B140] to-[#0033A0]",
            disabled: false
        },
        {
            label: "Services Report",
            path: "/reports/services",
            icon: (
                <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M7 7a4 4 0 018 0v4M5 21h14a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
                </svg>
            ),
            color: "from-[#0033A0] to-[#00B140]",
            disabled: false
        }
    ];

    return (
        <AISGBackground>
            <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-8">
                        <h1 className="text-2xl font-bold text-center text-white">
                            Reports
                        </h1>
                        <p className="text-gray-200 mt-2 font-light text-center">
                            Reporting and analysis system
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {reports.map(({ label, path, icon, color, disabled }) => (
                            <div
                                key={path + label}
                                onClick={() => {
                                    if (!disabled) navigate(path);
                                }}
                                className={`bg-[#16213E] rounded-xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow border border-[#0033A0] flex flex-col items-center ${disabled ? "opacity-60 cursor-not-allowed hover:border-[#0033A0]" : "hover:border-[#00B140]"}`}
                                style={{ minHeight: "220px" }}
                            >
                                <div className={`w-full bg-gradient-to-r ${color} p-4 flex items-center justify-center`}>
                                    {icon}
                                </div>
                                <div className="p-6 text-center flex-1 flex flex-col justify-center">
                                    <h2 className="text-lg font-semibold text-white">{label}</h2>
                                    <p className="mt-2 text-sm text-gray-400">
                                        {disabled ? "This report is under development" : "Click to access this report"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AISGBackground>
    );
};

export default ReportSelector;