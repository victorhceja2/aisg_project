import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

interface Company {
    companyCode: string;
    companyName: string;
}

interface Client {
    llave: number;
    nombre: string;
    comercial: string;
    razonSocial: string;
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
    const [error, setError] = useState<string | null>(null);

    // Estados para los dropdowns
    const [companies, setCompanies] = useState<Company[]>([]);
    const [airlines, setAirlines] = useState<Client[]>([]);
    const [stations, setStations] = useState<string[]>([]);
    
    // Estados de carga para los dropdowns
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [airlinesLoading, setAirlinesLoading] = useState(false);
    const [stationsLoading, setStationsLoading] = useState(true);

    // Cargar companies y stations al montar el componente (no airlines inicialmente)
    useEffect(() => {
        fetchCompanies();
        fetchStations();
    }, []);

    // Effect para cargar aerolíneas cuando cambia la compañía seleccionada
    useEffect(() => {
        if (filters.company) {
            fetchAirlinesByCompany(filters.company);
        } else {
            // Si no hay compañía seleccionada, limpiar la lista de aerolíneas
            setAirlines([]);
        }
    }, [filters.company]);

    // Función para obtener companies
    const fetchCompanies = async () => {
        try {
            setCompaniesLoading(true);
            const response = await axiosInstance.get('/companies/');
            setCompanies(response.data);
        } catch (err) {
            console.error("Error loading companies:", err);
        } finally {
            setCompaniesLoading(false);
        }
    };

    // Función para obtener aerolíneas filtradas por compañía y ordenadas alfabéticamente
    const fetchAirlinesByCompany = async (companyValue: string) => {
        try {
            setAirlinesLoading(true);
            // Extraer el código de compañía (formato esperado: "CODE - Name")
            const companyCode = companyValue.split(' - ')[0];
            
            // Obtener aerolíneas filtradas por compañía
            const response = await axiosInstance.get(`/catalog/clients?tipoCliente=1&companyCode=${companyCode}`);
            
            // Ordenar alfabéticamente por nombre comercial o nombre
            const sortedAirlines = [...(response.data || [])].sort((a, b) => {
                const nameA = (a.comercial || a.nombre || '').toUpperCase();
                const nameB = (b.comercial || b.nombre || '').toUpperCase();
                return nameA.localeCompare(nameB);
            });
            
            setAirlines(sortedAirlines);
        } catch (err) {
            console.error("Error loading airlines for company:", err);
            setAirlines([]);
        } finally {
            setAirlinesLoading(false);
        }
    };

    // Función para obtener stations
    const fetchStations = async () => {
        try {
            setStationsLoading(true);
            // Stations comunes en aeropuertos ordenadas alfabéticamente
            setStations([
                "GDL", "MEX", "CUN", "TIJ", "PVR", "SJD", "MTY", "BJX", 
                "LAX", "DFW", "MIA", "JFK", "ORD", "ATL", "DEN", "PHX"
            ].sort());
        } catch (err) {
            console.error("Error loading stations:", err);
        } finally {
            setStationsLoading(false);
        }
    };

    // Función para buscar datos desde la API
    const searchOperationServices = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Construir los parámetros de consulta
            const params = new URLSearchParams();
            if (filters.company) params.append('company', filters.company);
            // Solo agregar airline si no es "all" o vacío
            if (filters.airline && filters.airline !== "all") {
                params.append('airline', filters.airline);
            }
            if (filters.station) params.append('station', filters.station);
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            
            const response = await axiosInstance.get(`/api/operation-services?${params}`);
            setData(response.data);
        } catch (err) {
            console.error("Error fetching operation services:", err);
            setError("Could not load operation services. Please try again.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        const headers = [
            'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 
            'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'
        ];

        const exportData = data.length > 0 ? data.map(row => [
            row.company,
            row.airline,
            row.date,
            row.station,
            row.ac_reg,
            row.fligth,
            row.ac_type,
            row.start_time,
            row.end_time,
            row.on_gnd,
            row.service,
            row.work_reference,
            row.technician
        ]) : [['No data available']];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operation Services');
        
        const fileName = `operation_services_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Función para exportar a CSV
    const exportToCSV = () => {
        const headers = [
            'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 
            'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'
        ];

        const csvData = data.length > 0 ? data.map(row => [
            row.company,
            row.airline,
            row.date,
            row.station,
            row.ac_reg,
            row.fligth,
            row.ac_type,
            row.start_time,
            row.end_time,
            row.on_gnd,
            row.service,
            row.work_reference,
            row.technician
        ]) : [['No data available']];

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `operation_services_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función para exportar a PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
            
            // Título del reporte
            doc.setFontSize(16);
            doc.text('Operation Services Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

            // Definir las columnas para la tabla
            const columns = [
                'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight',
                'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'
            ];

            // Preparar los datos
            const tableData = data.length > 0 ? data.map(row => [
                row.company || '',
                row.airline || '',
                row.date || '',
                row.station || '',
                row.ac_reg || '',
                row.fligth || '',
                row.ac_type || '',
                row.start_time || '',
                row.end_time || '',
                row.on_gnd || '',
                row.service || '',
                row.work_reference || '',
                row.technician || ''
            ]) : [['No data available', '', '', '', '', '', '', '', '', '', '', '', '']];

            // Usar autoTable
            autoTable(doc, {
                head: [columns],
                body: tableData,
                startY: 35,
                styles: { 
                    fontSize: 8, 
                    cellPadding: 2,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: { 
                    fillColor: [0, 33, 87],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                margin: { top: 35, left: 14, right: 14 },
                theme: 'striped',
                columnStyles: {
                    0: { cellWidth: 20 }, // Company
                    1: { cellWidth: 25 }, // Airline
                    2: { cellWidth: 18 }, // Date
                    3: { cellWidth: 15 }, // Station
                    4: { cellWidth: 18 }, // AC REG
                    5: { cellWidth: 18 }, // Flight
                    6: { cellWidth: 15 }, // A/C Type
                    7: { cellWidth: 18 }, // Start Time
                    8: { cellWidth: 18 }, // End Time
                    9: { cellWidth: 15 }, // On GND
                    10: { cellWidth: 20 }, // Service
                    11: { cellWidth: 20 }, // Work Reference
                    12: { cellWidth: 25 }, // Technician
                }
            });

            // Guardar el PDF
            const fileName = `operation_services_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            
            // Función alternativa si falla autoTable
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(20);
            doc.text('Operation Services Report', 14, 22);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
            
            let yPosition = 50;
            doc.setFontSize(10);
            
            if (data.length === 0) {
                doc.text('No data available', 14, yPosition);
            } else {
                doc.text('Company | Airline | Date | Station | Service | Technician', 14, yPosition);
                yPosition += 10;
                
                data.forEach((row, index) => {
                    const line = `${row.company || 'N/A'} | ${row.airline || 'N/A'} | ${row.date || 'N/A'} | ${row.station || 'N/A'} | ${row.service || 'N/A'} | ${row.technician || 'N/A'}`;
                    doc.text(line, 14, yPosition);
                    yPosition += 8;
                    if (yPosition > 180) {
                        doc.addPage();
                        yPosition = 20;
                    }
                });
            }
            
            const fileName = `operation_services_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchOperationServices();
    };

    return (
        <AISGBackground>
            <div className="min-h-screen py-8 px-4 font-['Montserrat'] text-white">
                <div className="max-w-7xl mx-auto">
                    {/* Cabecera principal con título y descripción */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Operation Services Report</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">
                            Search and analyze operational services
                        </p>
                    </div>

                    {/* Mensajes de error */}
                    {error && (
                        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {/* Filtros de búsqueda */}
                    <form onSubmit={handleSearch} className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            {/* Company Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                                {companiesLoading ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.company}
                                        onChange={(e) => {
                                            // Resetear el valor de aerolínea al cambiar de compañía
                                            setFilters({ ...filters, company: e.target.value, airline: "" });
                                        }}
                                    >
                                        <option value="">Select a company</option>
                                        {companies.map((company) => (
                                            <option key={company.companyCode} value={`${company.companyCode} - ${company.companyName}`}>
                                                {company.companyCode} - {company.companyName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Airline Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                                {airlinesLoading ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.airline}
                                        onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                                        disabled={!filters.company} // Deshabilitar si no hay compañía seleccionada
                                    >
                                        <option value="">Select an airline</option>
                                        <option value="all">All Airlines</option>
                                        {airlines.map((airline) => (
                                            <option key={airline.llave} value={airline.llave}>
                                                {airline.llave} - {airline.comercial || airline.nombre || `Airline #${airline.llave}`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Station Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                {stationsLoading ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.station}
                                        onChange={(e) => setFilters({ ...filters, station: e.target.value })}
                                    >
                                        <option value="">Select a station</option>
                                        {stations.map((station) => (
                                            <option key={station} value={station}>
                                                {station} - {station}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                    value={filters.startDate}
                                    onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                    value={filters.endDate}
                                    onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    type="button"
                                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                    onClick={exportToPDF}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                                    </svg>
                                    Export PDF
                                </button>
                                <button 
                                    type="button"
                                    className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                    onClick={exportToExcel}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" clipRule="evenodd" />
                                    </svg>
                                    Export Excel
                                </button>
                                <button 
                                    type="button"
                                    className="bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                    onClick={exportToCSV}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Export CSV
                                </button>
                            </div>
                            
                            <button
                                type="submit"
                                className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </form>

                    {/* Indicador de carga */}
                    {loading && (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
                        </div>
                    )}

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
                                    <th className="p-2">Flight</th>
                                    <th className="p-2">A/C Type</th>
                                    <th className="p-2">Start Time</th>
                                    <th className="p-2">End Time</th>
                                    <th className="p-2">On GND</th>
                                    <th className="p-2">Service</th>
                                    <th className="p-2">Work Reference</th>
                                    <th className="p-2">Technician</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {data.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={13} className="text-center py-8 text-gray-400">
                                            No operation services found. Please search to view results.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row, idx) => (
                                        <tr key={idx} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                            <td className="p-2 text-white">{row.company}</td>
                                            <td className="p-2 text-white">{row.airline}</td>
                                            <td className="p-2 text-white">{row.date}</td>
                                            <td className="p-2 text-white">{row.station}</td>
                                            <td className="p-2 text-white">{row.ac_reg}</td>
                                            <td className="p-2 text-white">{row.fligth}</td>
                                            <td className="p-2 text-white">{row.ac_type}</td>
                                            <td className="p-2 text-white">{row.start_time}</td>
                                            <td className="p-2 text-white">{row.end_time}</td>
                                            <td className="p-2 text-white">{row.on_gnd}</td>
                                            <td className="p-2 text-white">{row.service}</td>
                                            <td className="p-2 text-white">{row.work_reference}</td>
                                            <td className="p-2 text-white">{row.technician}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AISGBackground>
    );
};

export default OperationService;