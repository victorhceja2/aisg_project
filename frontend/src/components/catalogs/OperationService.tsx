import React, { useEffect, useState } from "react";
import axios from "axios";
import AISGBackground from "../catalogs/fondo";

interface OperationRow {
    company: string;
    airline: string;
    date: string;
    station: string;
    ac_reg: string;
    fligth: string;
    ac_type: string;
    start_time: string;
    end_time: string;
    on_gnd: string;
    service: string;
    work_reference: string;
    technician: string;
}

/**
 * Pantalla de reporte de servicios operativos con filtros y tabla de resultados.
 * Aplica diseño consistente con el resto del sistema.
 */
const OperationService: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "",
        airline: "",
        station: "",
        startDate: "",
        endDate: "",
    });
    const [data, setData] = useState<OperationRow[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                company: filters.company,
                airline: filters.airline,
                station: filters.station,
                start_date: filters.startDate,
                end_date: filters.endDate,
            };
            const res = await axios.get("http://localhost:8000/operations/report", { params });
            setData(res.data);
        } catch (err) {
            setData([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <AISGBackground>
            <div className="min-h-screen py-8 px-4 font-['Montserrat'] text-white">
                <div className="max-w-7xl mx-auto">
                    {/* Cabecera principal con título y descripción */}
                    <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-t-lg shadow-lg mb-8">
                        <h1 className="text-3xl font-bold text-center text-white">Operations Report</h1>
                        <p className="text-gray-200 mt-2 font-light text-center">
                            Search and analyze operational data
                        </p>
                    </div>
                    {/* Filtros de búsqueda */}
                    <form onSubmit={handleSearch} className="bg-[#16213E] p-6 rounded-b-lg shadow-lg mb-6">
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
                            <button
                                type="submit"
                                className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Search"}
                            </button>
                        </div>
                    </form>
                    {/* Tabla de resultados */}
                    <div className="rounded-lg shadow-lg overflow-x-auto bg-[#1E2A45]">
                        <table className="min-w-full table-auto text-xs">
                            <thead>
                                <tr className="bg-white text-[#002057]">
                                    <th className="p-2">Company</th>
                                    <th className="p-2">Airline</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Station</th>
                                    <th className="p-2">AC REG</th>
                                    <th className="p-2">FLIGHT</th>
                                    <th className="p-2">A/C TYPE</th>
                                    <th className="p-2">Start Time</th>
                                    <th className="p-2">End Time</th>
                                    <th className="p-2">On GND</th>
                                    <th className="p-2">Service</th>
                                    <th className="p-2">Work Reference</th>
                                    <th className="p-2">Technician</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {data.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={13} className="text-center py-8 text-gray-400">
                                            No data found.
                                        </td>
                                    </tr>
                                )}
                                {data.map((row, idx) => (
                                    <tr key={idx} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                        <td className="p-2">{row.company}</td>
                                        <td className="p-2">{row.airline}</td>
                                        <td className="p-2">{row.date}</td>
                                        <td className="p-2">{row.station}</td>
                                        <td className="p-2">{row.ac_reg}</td>
                                        <td className="p-2">{row.fligth}</td>
                                        <td className="p-2">{row.ac_type}</td>
                                        <td className="p-2">{row.start_time}</td>
                                        <td className="p-2">{row.end_time}</td>
                                        <td className="p-2">{row.on_gnd}</td>
                                        <td className="p-2">{row.service}</td>
                                        <td className="p-2">{row.work_reference}</td>
                                        <td className="p-2">{row.technician}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AISGBackground>
    );
};

export default OperationService;