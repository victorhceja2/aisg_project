import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import AISGBackground from "../catalogs/fondo";

interface OperationRow {
    COMPANY: string;
    LLAVE: number | string;
    AIRLINE: string;
    DATE: string;
    STATION: string;
    AC_REG: string;
    FLIGHT: string;
    AC_TYPE: string;
    START_TIME: string;
    END_TIME: string;
    ON_GND: string;
    SERVICE: string;
    WORK_REFERENCE: string;
    TECHNICIAN: string;
}

interface Company {
    companyCode: string;
    companyName: string;
    MonedaEmpresa: string;
    RFC_En_Company: string;
    RazonSocial_En_CompanyCode: string;
    NombreComercial: string;
    TipoPersona: string;
    MonedaEnCompanyCode: string;
    Producto: string;
    Estatus: string;
    UsuarioRegistro: string;
    FechaRegistro: string;
    HoraRegistro: string;
    Llave: number | string;
}

interface Airline {
    llave: number;
    linea: string;
    nombre: string;
    callSign: string;
    pais: string;
    companyCode: string;
    keyObjectId: string;
    objectKeyValue: string;
    objectKeyIndex: number;
}

/**
 * Pantalla de reporte de servicios operativos con filtros y tabla de resultados.
 * Aplica diseño consistente con el resto del sistema.
 */
const OperationService: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "all",
        airline: "all",
        station: "all",
        startDate: "",
        endDate: "",
    });
    
    const [data, setData] = useState<OperationRow[]>([]);
    const [allData, setAllData] = useState<OperationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    // Estados para los dropdowns
    const [companies, setCompanies] = useState<Company[]>([]);
    const [airlines, setAirlines] = useState<Airline[]>([]);
    const [stations, setStations] = useState<string[]>([]);
    
    // Estados de carga para los dropdowns
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [airlinesLoading, setAirlinesLoading] = useState(false);
    const [stationsLoading, setStationsLoading] = useState(true);

    // Función para validar fechas
    const validateDates = (startDate: string, endDate: string): boolean => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) {
                setDateError("Start date cannot be greater than end date.");
                return false;
            }
        }
        setDateError(null);
        return true;
    };

    // Función de ordenamiento alfabético personalizado
    const customAlphabeticalSort = (a: string, b: string) => {
        const aUpper = a.toUpperCase();
        const bUpper = b.toUpperCase();
        const aStartsWithNumber = /^[0-9]/.test(aUpper);
        const bStartsWithNumber = /^[0-9]/.test(bUpper);
        if (aStartsWithNumber && !bStartsWithNumber) return -1;
        if (!aStartsWithNumber && bStartsWithNumber) return 1;
        return aUpper.localeCompare(bUpper, 'en', { numeric: true });
    };

    // Cargar companies y stations al montar el componente (no airlines inicialmente)
    useEffect(() => {
        const initializeData = async () => {
            await fetchCompanies();
            await fetchStations();
            await loadAllServicesReports();
        };
        initializeData();
    }, []);

    // Effect para cargar aerolíneas cuando cambia la compañía seleccionada
    useEffect(() => {
        if (filters.company && filters.company !== "all") {
            fetchAirlinesByCompany(filters.company);
        } else {
            setAirlines([]);
            setFilters(prev => ({ ...prev, airline: "all" }));
        }
    }, [filters.company]);

    // Aplicar filtros automáticamente cuando cambian los datos o filtros
    useEffect(() => {
        if (allData.length > 0) {
            applyFilters();
        }
    }, [allData, filters]);

    // Función para obtener companies
    const fetchCompanies = async () => {
        try {
            setCompaniesLoading(true);
            const response = await axiosInstance.get('/companies/');
            const sortedCompanies = [...response.data].sort((a, b) =>
                customAlphabeticalSort(a.companyName, b.companyName)
            );
            setCompanies(sortedCompanies);

            // Mantener "all" por defecto
            if (sortedCompanies.length > 0 && filters.company === "all") {
                setFilters(prev => ({
                    ...prev,
                    company: "all",
                    airline: "all"
                }));
            }
        } catch (err) {
            console.error("Error loading companies:", err);
        } finally {
            setCompaniesLoading(false);
        }
    };

    // Función para obtener aerolíneas filtradas por compañía
    const fetchAirlinesByCompany = async (companyLlave: string) => {
        try {
            setAirlinesLoading(true);
            // Buscar el companyCode correspondiente a la llave seleccionada
            const selectedCompany = companies.find(c => String(c.Llave) === companyLlave);
            const companyCode = selectedCompany ? selectedCompany.companyCode : "";
            
            // Usar el endpoint de airlines
            const response = await axiosInstance.get('/companies/airlines');
            
            // Filtrar por companyCode si se seleccionó una compañía específica
            let filteredAirlines = response.data || [];
            if (companyCode) {
                filteredAirlines = filteredAirlines.filter((airline: Airline) => 
                    airline.companyCode === companyCode
                );
            }
            
            const sortedAirlines = [...filteredAirlines].sort((a, b) => {
                const nameA = a.linea || a.nombre || '';
                const nameB = b.linea || b.nombre || '';
                return customAlphabeticalSort(nameA, nameB);
            });
            setAirlines(sortedAirlines);

            // Mantener "all" por defecto
            if (!filters.airline) {
                setFilters(prev => ({ ...prev, airline: "all" }));
            }
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
            const stationsList = [
                "GDL", "MEX", "CUN", "TIJ", "PVR", "SJD", "MTY", "BJX", 
                "LAX", "DFW", "MIA", "JFK", "ORD", "ATL", "DEN", "PHX"
            ];
            const sortedStations = [...stationsList].sort(customAlphabeticalSort);
            setStations(sortedStations);
        } catch (err) {
            console.error("Error loading stations:", err);
        } finally {
            setStationsLoading(false);
        }
    };

    // Función para cargar todos los datos del backend (sin parámetros)
    const loadAllServicesReports = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/reports/services-reports');
            setAllData(response.data);
        } catch (err) {
            setError("Could not load services reports. Please try again.");
            setData([]);
            setAllData([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para aplicar filtros localmente en el frontend
    const applyFilters = () => {
        // Validar fechas antes de aplicar filtros
        if (!validateDates(filters.startDate, filters.endDate)) {
            return;
        }

        let filteredReports = [...allData];

        // Aplicar filtro de compañía usando LLAVE
        if (filters.company && filters.company !== "all") {
            filteredReports = filteredReports.filter(report =>
                report.LLAVE && String(report.LLAVE) === filters.company
            );
        }

        // Aplicar filtro de aerolínea usando el campo linea
        if (filters.airline && filters.airline !== "all") {
            const selectedAirline = airlines.find(airline => airline.llave.toString() === filters.airline);
            if (selectedAirline) {
                const airlineName = selectedAirline.linea;
                filteredReports = filteredReports.filter(report =>
                    report.AIRLINE && report.AIRLINE.toLowerCase().includes(airlineName.toLowerCase())
                );
            }
        }

        // Aplicar filtro de estación
        if (filters.station && filters.station !== "all") {
            filteredReports = filteredReports.filter(report =>
                report.STATION && report.STATION.toLowerCase() === filters.station.toLowerCase()
            );
        }

        // Aplicar filtro de fecha de inicio
        if (filters.startDate) {
            filteredReports = filteredReports.filter(report =>
                report.DATE && report.DATE >= filters.startDate
            );
        }

        // Aplicar filtro de fecha de fin
        if (filters.endDate) {
            filteredReports = filteredReports.filter(report =>
                report.DATE && report.DATE <= filters.endDate
            );
        }

        setData(filteredReports);
    };

    // Función manual de búsqueda (para el botón)
    const searchOperationServices = () => {
        if (!validateDates(filters.startDate, filters.endDate)) {
            return;
        }
        applyFilters();
    };

    // Función para manejar cambio de fecha de inicio
    const handleStartDateChange = (value: string) => {
        setFilters({ ...filters, startDate: value });
        validateDates(value, filters.endDate);
        
        // Si hay una fecha de fin seleccionada y es menor que la nueva fecha de inicio, limpiarla
        if (filters.endDate && value && filters.endDate < value) {
            setFilters(prev => ({ ...prev, startDate: value, endDate: "" }));
        }
    };

    // Función para manejar cambio de fecha de fin
    const handleEndDateChange = (value: string) => {
        setFilters({ ...filters, endDate: value });
        validateDates(filters.startDate, value);
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        const headers = [
            'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 
            'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'
        ];

        const exportData = data.length > 0 ? data.map(row => [
            row.COMPANY,
            row.AIRLINE,
            row.DATE,
            row.STATION,
            row.AC_REG,
            row.FLIGHT,
            row.AC_TYPE,
            row.START_TIME,
            row.END_TIME,
            row.ON_GND,
            row.SERVICE,
            row.WORK_REFERENCE,
            row.TECHNICIAN
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
            row.COMPANY,
            row.AIRLINE,
            row.DATE,
            row.STATION,
            row.AC_REG,
            row.FLIGHT,
            row.AC_TYPE,
            row.START_TIME,
            row.END_TIME,
            row.ON_GND,
            row.SERVICE,
            row.WORK_REFERENCE,
            row.TECHNICIAN
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
                row.COMPANY || '',
                row.AIRLINE || '',
                row.DATE || '',
                row.STATION || '',
                row.AC_REG || '',
                row.FLIGHT || '',
                row.AC_TYPE || '',
                row.START_TIME || '',
                row.END_TIME || '',
                row.ON_GND || '',
                row.SERVICE || '',
                row.WORK_REFERENCE || '',
                row.TECHNICIAN || ''
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
                    const line = `${row.COMPANY || 'N/A'} | ${row.AIRLINE || 'N/A'} | ${row.DATE || 'N/A'} | ${row.STATION || 'N/A'} | ${row.SERVICE || 'N/A'} | ${row.TECHNICIAN || 'N/A'}`;
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

                    {/* Mensaje de error de fechas */}
                    {dateError && (
                        <div className="bg-orange-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{dateError}</p>
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
                                            setFilters({ ...filters, company: e.target.value, airline: "all" });
                                        }}
                                    >
                                        <option value="all">All Companies</option>
                                        {companies.map((company) => (
                                            <option key={company.Llave} value={company.Llave}>
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
                                        disabled={!filters.company || filters.company === "all"}
                                    >
                                        <option value="all">All Airlines</option>
                                        {airlines.map((airline) => (
                                            <option key={airline.llave} value={airline.llave}>
                                                {airline.linea} - {airline.nombre || `Airline #${airline.llave}`}
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
                                        <option value="all">All Stations</option>
                                        {stations.map((station) => (
                                            <option key={station} value={station}>
                                                {station}
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
                                    className={`w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border ${
                                        dateError ? 'border-red-500' : 'border-gray-700'
                                    } focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none`}
                                    value={filters.startDate}
                                    onChange={e => handleStartDateChange(e.target.value)}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className={`w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border ${
                                        dateError ? 'border-red-500' : 'border-gray-700'
                                    } focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none`}
                                    value={filters.endDate}
                                    min={filters.startDate || undefined}
                                    onChange={e => handleEndDateChange(e.target.value)}
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
                                className={`${
                                    dateError 
                                        ? 'bg-gray-500 cursor-not-allowed' 
                                        : 'bg-[#00B140] hover:bg-[#009935]'
                                } text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200`}
                                disabled={loading || !!dateError}
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

                    {/* Información de resultados */}
                    <div className="mb-4 text-white">
                        <p>Total records: {allData.length} | Filtered records: {data.length}</p>
                    </div>

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
                                {data.length > 0 ? (
                                    data.map((row, idx) => (
                                        <tr key={idx} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                            <td className="p-2 text-white">{row.COMPANY || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.AIRLINE || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.DATE || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.STATION || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.AC_REG || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.FLIGHT || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.AC_TYPE || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.START_TIME || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.END_TIME || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.ON_GND || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.SERVICE || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.WORK_REFERENCE || 'N/A'}</td>
                                            <td className="p-2 text-white">{row.TECHNICIAN || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="text-center py-8 text-gray-400">
                                            {allData.length === 0 ? 'No operation services available.' : 'No operation services match the current filters.'}
                                        </td>
                                    </tr>
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