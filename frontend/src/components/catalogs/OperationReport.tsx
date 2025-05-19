import React, { useState } from "react";
import AISGBackground from "./fondo";

/**
 * Pantalla de reporte de operaciones con filtros y tabla de resultados.
 * Aplica diseño consistente con el resto del sistema.
 */
const OperationReport: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "",
        airline: "",
        station: "",
        startDate: "",
        endDate: "",
    });

    // Aquí iría la lógica para obtener los datos del backend usando los filtros

    return (
        <AISGBackground>
            <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
                {/* Cabecera principal con título y descripción */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Operations Report</h1>
                    <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                    <p className="text-gray-200 mt-2 font-light">
                        Search and analyze operational data
                    </p>
                </div>
                {/* Filtros de búsqueda */}
                <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                            <input
                                className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                placeholder="Company"
                                value={filters.company}
                                onChange={e => setFilters({ ...filters, company: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                            <input
                                className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                placeholder="Airline"
                                value={filters.airline}
                                onChange={e => setFilters({ ...filters, airline: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                            <input
                                className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                placeholder="Station"
                                value={filters.station}
                                onChange={e => setFilters({ ...filters, station: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                value={filters.startDate}
                                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                value={filters.endDate}
                                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200">
                            Search
                        </button>
                    </div>
                </div>
                {/* Tabla de resultados */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-white text-[#002057]">
                                <th className="p-2">Company</th>
                                <th className="p-2">Airline</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Station</th>
                                <th className="p-2">AC REG</th>
                                <th className="p-2">Flight</th>
                                <th className="p-2">Dest</th>
                                <th className="p-2">Log Book</th>
                                <th className="p-2">A/C Type</th>
                                <th className="p-2">Start Time</th>
                                <th className="p-2">End Time</th>
                                <th className="p-2">Serv PR</th>
                                <th className="p-2">On GND</th>
                                <th className="p-2">Serv1</th>
                                <th className="p-2">Serv2</th>
                                <th className="p-2">Serv3</th>
                                <th className="p-2">Serv4</th>
                                <th className="p-2">Serv5</th>
                                <th className="p-2">Serv6</th>
                                <th className="p-2">Remarks</th>
                                <th className="p-2">Technician</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {/* Ejemplo de fila, reemplazar por datos dinámicos */}
                            <tr className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                <td className="p-2">A&P</td>
                                <td className="p-2">Alaska</td>
                                <td className="p-2">02-may-24</td>
                                <td className="p-2">GDL</td>
                                <td className="p-2">N251AK</td>
                                <td className="p-2">1419.142</td>
                                <td className="p-2">LAX</td>
                                <td className="p-2">60903583</td>
                                <td className="p-2">737</td>
                                <td className="p-2">21:30</td>
                                <td className="p-2">23:35</td>
                                <td className="p-2">TRANSIT CHECK</td>
                                <td className="p-2">02:05</td>
                                <td className="p-2">Transit</td>
                                <td className="p-2">EngOilServ</td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2">TRANSIT CHECK / FUELING ASSISTANCE / DEPARTURE SUPERVISION / OIL ADDED 0/0</td>
                                <td className="p-2">RAMIREZ A</td>
                            </tr>
                            {/* ...más filas dinámicas */}
                        </tbody>
                    </table>
                </div>
            </div>
        </AISGBackground>
    );
};

export default OperationReport;