import React, { useState, useEffect } from "react";
import AISGBackground from "./fondo";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definir las interfaces
interface OperationReportData {
    company: string;
    airline: string;
    date: string;
    station: string;
    acReg: string;
    flight: string;
    dest: string;
    logBook: string;
    acType: string;
    startTime: string;
    endTime: string;
    servPr: string;
    onGnd: string;
    serv1: string;
    serv2: string;
    serv3: string;
    serv4: string;
    serv5: string;
    serv6: string;
    remarks: string;
    technician?: string;
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

    const [reports, setReports] = useState<OperationReportData[]>([]);
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

    // Nueva función para obtener aerolíneas filtradas por compañía y ordenadas alfabéticamente
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

    // Función para obtener estaciones, por ahora usando una lista predefinida debido a que en bd falta una normalización adecuada
    const fetchStations = async () => {
        try {
            setStationsLoading(true);
            // Stations comunes en aeropuertos (usando lista predefinida en lugar de llamada a API)
            setStations([
                "GDL", "MEX", "CUN", "TIJ", "PVR", "SJD", "MTY", "BJX",
                "LAX", "DFW", "MIA", "JFK", "ORD", "ATL", "DEN", "PHX"
            ]);
        } catch (err) {
            console.error("Error loading stations:", err);
        } finally {
            setStationsLoading(false);
        }
    };

    // Función para buscar datos desde la API
    const searchReports = async () => {
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

            const response = await axiosInstance.get(`/api/operation-reports?${params}`);
            setReports(response.data);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("Could not load operation reports. Please try again.");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        const headers = [
            'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 'Dest',
            'Log Book', 'A/C Type', 'Start Time', 'End Time', 'Serv PR', 'On GND',
            'Serv1', 'Serv2', 'Serv3', 'Serv4', 'Serv5', 'Serv6', 'Remarks', 'Technician'
        ];

        const data = reports.length > 0 ? reports.map(report => [
            report.company,
            report.airline,
            report.date,
            report.station,
            report.acReg,
            report.flight,
            report.dest,
            report.logBook,
            report.acType,
            report.startTime,
            report.endTime,
            report.servPr,
            report.onGnd,
            report.serv1,
            report.serv2,
            report.serv3,
            report.serv4,
            report.serv5,
            report.serv6,
            report.remarks,
            report.technician || ''
        ]) : [['No data available']];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operations Report');

        const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Función para exportar a CSV
    const exportToCSV = () => {
        const headers = [
            'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 'Dest',
            'Log Book', 'A/C Type', 'Start Time', 'End Time', 'Serv PR', 'On GND',
            'Serv1', 'Serv2', 'Serv3', 'Serv4', 'Serv5', 'Serv6', 'Remarks', 'Technician'
        ];

        const csvData = reports.length > 0 ? reports.map(report => [
            report.company,
            report.airline,
            report.date,
            report.station,
            report.acReg,
            report.flight,
            report.dest,
            report.logBook,
            report.acType,
            report.startTime,
            report.endTime,
            report.servPr,
            report.onGnd,
            report.serv1,
            report.serv2,
            report.serv3,
            report.serv4,
            report.serv5,
            report.serv6,
            report.remarks,
            report.technician || ''
        ]) : [['No data available']];

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `operations_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función para exportar a PDF (CORREGIDA)
    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

            // Título del reporte
            doc.setFontSize(16);
            doc.text('Operations Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

            // Definir las columnas para la tabla
            const columns = [
                'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 'Dest',
                'Log Book', 'A/C Type', 'Start Time', 'End Time', 'Serv PR', 'On GND',
                'Serv1', 'Serv2', 'Serv3', 'Serv4', 'Serv5', 'Serv6', 'Remarks', 'Technician'
            ];

            // Preparar los datos
            const tableData = reports.length > 0 ? reports.map(report => [
                report.company || '',
                report.airline || '',
                report.date || '',
                report.station || '',
                report.acReg || '',
                report.flight || '',
                report.dest || '',
                report.logBook || '',
                report.acType || '',
                report.startTime || '',
                report.endTime || '',
                report.servPr || '',
                report.onGnd || '',
                report.serv1 || '',
                report.serv2 || '',
                report.serv3 || '',
                report.serv4 || '',
                report.serv5 || '',
                report.serv6 || '',
                report.remarks || '',
                report.technician || ''
            ]) : [['No data available', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];

            // Usar autoTable correctamente importado
            autoTable(doc, {
                head: [columns],
                body: tableData,
                startY: 35,
                styles: {
                    fontSize: 6,
                    cellPadding: 1,
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
                    0: { cellWidth: 15 }, // Company
                    1: { cellWidth: 15 }, // Airline
                    2: { cellWidth: 12 }, // Date
                    3: { cellWidth: 10 }, // Station
                    4: { cellWidth: 12 }, // AC REG
                    5: { cellWidth: 10 }, // Flight
                    6: { cellWidth: 10 }, // Dest
                    7: { cellWidth: 12 }, // Log Book
                    8: { cellWidth: 12 }, // A/C Type
                    9: { cellWidth: 12 }, // Start Time
                    10: { cellWidth: 12 }, // End Time
                    11: { cellWidth: 10 }, // Serv PR
                    12: { cellWidth: 10 }, // On GND
                    13: { cellWidth: 8 }, // Serv1
                    14: { cellWidth: 8 }, // Serv2
                    15: { cellWidth: 8 }, // Serv3
                    16: { cellWidth: 8 }, // Serv4
                    17: { cellWidth: 8 }, // Serv5
                    18: { cellWidth: 8 }, // Serv6
                    19: { cellWidth: 15 }, // Remarks
                    20: { cellWidth: 12 }, // Technician
                }
            });

            // Guardar el PDF
            const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);

            // Función alternativa si falla autoTable
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(20);
            doc.text('Operations Report', 14, 22);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

            let yPosition = 50;
            doc.setFontSize(10);

            if (reports.length === 0) {
                doc.text('No data available', 14, yPosition);
            } else {
                doc.text('Company | Airline | Date | Station | Flight', 14, yPosition);
                yPosition += 10;

                reports.forEach((report, index) => {
                    const line = `${report.company || 'N/A'} | ${report.airline || 'N/A'} | ${report.date || 'N/A'} | ${report.station || 'N/A'} | ${report.flight || 'N/A'}`;
                    doc.text(line, 14, yPosition);
                    yPosition += 8;
                    if (yPosition > 180) {
                        doc.addPage();
                        yPosition = 20;
                    }
                });
            }

            const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        }
    };

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

                {/* Mensajes de error */}
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Filtros de búsqueda */}
                <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        {/* Company Dropdown - Ya tiene el formato CODE - NAME */}
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

                        {/* Airline Dropdown - Ahora con formato llave - nombre */}
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

                        {/* Station Dropdown - Ahora con formato CODE - CODE */}
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
                                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                onClick={exportToPDF}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                                </svg>
                                Export PDF
                            </button>
                            <button
                                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                onClick={exportToExcel}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" clipRule="evenodd" />
                                </svg>
                                Export Excel
                            </button>
                            <button
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
                            className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                            onClick={searchReports}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Indicador de carga */}
                {loading && (
                    <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
                    </div>
                )}

                {/* Tabla de resultados */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-white">
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
                            {reports.length > 0 ? (
                                reports.map((item, index) => (
                                    <tr key={index} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                        <td className="p-2">{item.company}</td>
                                        <td className="p-2">{item.airline}</td>
                                        <td className="p-2">{item.date}</td>
                                        <td className="p-2">{item.station}</td>
                                        <td className="p-2">{item.acReg}</td>
                                        <td className="p-2">{item.flight}</td>
                                        <td className="p-2">{item.dest}</td>
                                        <td className="p-2">{item.logBook}</td>
                                        <td className="p-2">{item.acType}</td>
                                        <td className="p-2">{item.startTime}</td>
                                        <td className="p-2">{item.endTime}</td>
                                        <td className="p-2">{item.servPr}</td>
                                        <td className="p-2">{item.onGnd}</td>
                                        <td className="p-2">{item.serv1}</td>
                                        <td className="p-2">{item.serv2}</td>
                                        <td className="p-2">{item.serv3}</td>
                                        <td className="p-2">{item.serv4}</td>
                                        <td className="p-2">{item.serv5}</td>
                                        <td className="p-2">{item.serv6}</td>
                                        <td className="p-2">{item.remarks}</td>
                                        <td className="p-2">{item.technician}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={21} className="p-4 text-center">
                                        No operation reports found. Please search to view results.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AISGBackground>
    );
};

export default OperationReport;