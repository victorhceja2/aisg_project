import React, { useState, useEffect, useMemo } from "react";
import AISGBackground from "./fondo";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definir las interfaces según el schema del backend OperationReportV2Response
interface OperationReportData {
    COMPANY: string | null;
    // LLAVE: number | null; // Campo ELIMINADO: No es provisto por el endpoint /operation-reports-v2
    AIRLINE: string | null;
    DATE: string | null; // Puede ser "YYYY-MM-DD" (string), o null
    STATION: string | null;
    AC_REG: string | null;
    FLIGTH: string | null; // Typo mantenido por consistencia con backend
    DEST: string | null;
    LOG_BOOK: string | null;
    AC_TYPE: string | null;
    START_TIME: string | null; // Formato HH:MM:SS o null
    END_TIME: string | null;   // Formato HH:MM:SS o null
    SERV_PR: string | null;
    // ON_GND: string; // Campo REEMPLAZADO por TOTAL_TECHNICIAN_TIME
    TOTAL_TECHNICIAN_TIME: string | null; // NUEVO CAMPO (equivalente a ON_GND)
    ASSISTANT_TYPE: string | null;      // NUEVO CAMPO
    AOG: string | null;                 // NUEVO CAMPO
    SERV1: string | null;
    SERV2: string | null;
    SERV3: string | null;
    SERV4: string | null;
    SERV5: string | null;
    SERV6: string | null;
    REMARKS: string | null;
    TECHNICIAN: string | null;
}

// Interfaces para las opciones de los dropdowns derivadas de OperationReportData
interface CompanyOption {
    llave: number; // TODO: Revisar cómo se poblará esta 'llave' si OperationReportData.LLAVE ya no existe.
    name: string; // COMPANY (companyCode)
}

// AirlineOption será simplemente un string (nombre de la aerolínea)
// StationOption será simplemente un string (nombre de la estación)

// Helper function to parse date string or number (YYYY-MM-DD, YYYYMMDD, or days since 0001-01-01) to Date object (UTC)
const parseReportDateStringToDate = (dateValue: string | number | null): Date | null => {
    if (dateValue === null || dateValue === undefined) return null;

    if (typeof dateValue === 'number') {
        const daysSinceUnixEpoch = dateValue - 719162;
        const millisecondsSinceUnixEpoch = daysSinceUnixEpoch * 24 * 60 * 60 * 1000;
        const date = new Date(millisecondsSinceUnixEpoch);
        if (!isNaN(date.getTime())) {
            return date;
        }
        return null;
    }

    const dateString = String(dateValue);

    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1;
        const day = parseInt(dateString.substring(6, 8), 10);
        const utcDate = new Date(Date.UTC(year, month, day));
        if (utcDate.getUTCFullYear() === year && utcDate.getUTCMonth() === month && utcDate.getUTCDate() === day) {
            return utcDate;
        }
    }
    return null;
};

// Helper function to format date value (from report.DATE) for display
const formatDateForDisplay = (dateValue: string | number | null): string => {
    const date = parseReportDateStringToDate(dateValue);
    if (date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            timeZone: 'UTC'
        }).format(date);
    }
    if (dateValue === null || dateValue === undefined) return "N/A";
    return String(dateValue); 
};

// Función de ordenamiento alfabético personalizado mejorada
const customAlphabeticalSort = (a: string, b: string) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    const aStartsWithNumber = /^[0-9]/.test(aUpper);
    const bStartsWithNumber = /^[0-9]/.test(bUpper);
    if (aStartsWithNumber && !bStartsWithNumber) return -1;
    if (!aStartsWithNumber && bStartsWithNumber) return 1;
    return aUpper.localeCompare(bUpper, 'en', { numeric: true });
};

// === NUEVAS FUNCIONES PARA MOSTRAR LOS VALORES COMO TEXTO ===
const getAOGDisplay = (aog: string | null | undefined): string => {
    if (aog === "1") return "SI";
    if (aog === "2") return "NO";
    return aog ?? "";
};

const getAssistantTypeDisplay = (type: string | null | undefined): string => {
    if (type === "1") return "on call";
    if (type === "3") return "Routine";
    return type ?? "";
};
// ===========================================================

// Constantes para encabezados de exportación
const EXPORT_HEADERS_EXCEL_CSV = [
    'COMPANY', 'AIRLINE', 'DATE', 'STATION', 'AC REG', 'FLIGTH', 'DEST',
    'LOG BOOK', 'A/C TYPE', 'SERV PR', 'ASSISTANT TYPE', 'AOG', 'START TIME', 'END TIME', 
    'TOTAL TECHNICIAN TIME', 'SERV1', 'SERV2', 'SERV3', 'SERV4', 'SERV5', 'SERV6', 'REMARKS', 'TECHNICIAN'
];

const EXPORT_HEADERS_PDF = [
    'COMPANY', 'AIRLINE', 'DATE', 'STATION', 'AC REG', 'FLIGTH', 'DEST',
    'LOG BOOK', 'A/C TYPE', 'SERV PR', 'ASSISTANT TYPE', 'AOG', 'START TIME', 'END TIME',
    'TOTAL TECH TIME', 'SERV1', 'SERV2', 'SERV3', 'SERV4', 'SERV5', 'SERV6', 'REMARKS', 'TECHNICIAN'
];

// Helper para sanitizar campos para exportación
const getSanitizedReportField = (fieldValue: string | null | undefined): string => {
    return fieldValue === null || fieldValue === undefined ? '' : String(fieldValue);
};

// Helper para obtener una fila de reporte formateada para exportación
const getExportableReportRow = (report: OperationReportData): string[] => [
    getSanitizedReportField(report.COMPANY),
    getSanitizedReportField(report.AIRLINE),
    formatDateForDisplay(report.DATE),
    getSanitizedReportField(report.STATION),
    getSanitizedReportField(report.AC_REG),
    getSanitizedReportField(report.FLIGTH),
    getSanitizedReportField(report.DEST),
    getSanitizedReportField(report.LOG_BOOK),
    getSanitizedReportField(report.AC_TYPE),
    getSanitizedReportField(report.SERV_PR),
    getAssistantTypeDisplay(report.ASSISTANT_TYPE), // <--- CAMBIO
    getAOGDisplay(report.AOG), // <--- CAMBIO
    getSanitizedReportField(report.START_TIME),
    getSanitizedReportField(report.END_TIME),
    getSanitizedReportField(report.TOTAL_TECHNICIAN_TIME),
    getSanitizedReportField(report.SERV1),
    getSanitizedReportField(report.SERV2),
    getSanitizedReportField(report.SERV3),
    getSanitizedReportField(report.SERV4),
    getSanitizedReportField(report.SERV5),
    getSanitizedReportField(report.SERV6),
    getSanitizedReportField(report.REMARKS),
    getSanitizedReportField(report.TECHNICIAN)
];

const OperationReport: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "all",
        airline: "all",
        station: "all",
        startDate: "",
        endDate: "",
    });

    const [reports, setReports] = useState<OperationReportData[]>([]);
    const [allReports, setAllReports] = useState<OperationReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

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

    // Cargar todos los reportes al inicio
    useEffect(() => {
        loadAllReports();
    }, []);
    
    // Opciones para dropdowns calculadas con useMemo
    const companyOptions = useMemo<CompanyOption[]>(() => {
        if (allReports.length > 0) {
            const uniqueCompanyNames = new Set<string>();
            allReports.forEach(report => {
                if (report.COMPANY) {
                    uniqueCompanyNames.add(report.COMPANY);
                }
            });
            return Array.from(uniqueCompanyNames)
                .sort(customAlphabeticalSort)
                .map((name, index) => ({ llave: index, name }));
        }
        return [];
    }, [allReports]);

    const getFilteredAirlines = (selectedCompanyValue: string, currentAllReports: OperationReportData[]): string[] => {
        let reportsForAirlineExtraction = currentAllReports;
        if (selectedCompanyValue !== "all") {
            reportsForAirlineExtraction = currentAllReports.filter(report => report.COMPANY === selectedCompanyValue);
        }
        const uniqueAirlinesSet = new Set<string>();
        reportsForAirlineExtraction.forEach(report => {
            if (report.AIRLINE) {
                uniqueAirlinesSet.add(report.AIRLINE);
            }
        });
        return Array.from(uniqueAirlinesSet).sort(customAlphabeticalSort);
    };

    const airlineOptions = useMemo<string[]>(() => {
        return getFilteredAirlines(filters.company, allReports);
    }, [filters.company, allReports]);

    const getFilteredStations = (selectedCompanyValue: string, currentAllReports: OperationReportData[]): string[] => {
        let reportsForStationExtraction = currentAllReports;
        if (selectedCompanyValue !== "all") {
            reportsForStationExtraction = currentAllReports.filter(report => report.COMPANY === selectedCompanyValue);
        }
        const uniqueStationsSet = new Set<string>();
        reportsForStationExtraction.forEach(report => {
            if (report.STATION) {
                uniqueStationsSet.add(report.STATION);
            }
        });
        return Array.from(uniqueStationsSet).sort(customAlphabeticalSort);
    };

    const stationOptions = useMemo<string[]>(() => {
        return getFilteredStations(filters.company, allReports);
    }, [filters.company, allReports]);

    useEffect(() => {
        if (filters.airline !== "all" && airlineOptions.length > 0 && !airlineOptions.includes(filters.airline)) {
            setFilters(prev => ({ ...prev, airline: "all" }));
        }
        else if (filters.airline !== "all" && airlineOptions.length === 0 && allReports.length > 0) {
             setFilters(prev => ({ ...prev, airline: "all" }));
        }
    }, [filters.airline, airlineOptions, allReports.length]);

    useEffect(() => {
        if (filters.station !== "all" && stationOptions.length > 0 && !stationOptions.includes(filters.station)) {
            setFilters(prev => ({ ...prev, station: "all" }));
        }
        else if (filters.station !== "all" && stationOptions.length === 0 && allReports.length > 0) {
            setFilters(prev => ({ ...prev, station: "all" }));
        }
    }, [filters.station, stationOptions, allReports.length]);

    // ORDENAMIENTO DE LOS DATOS SEGÚN LAS COLUMNAS SOLICITADAS
    const sortReports = (data: OperationReportData[]): OperationReportData[] => {
        return [...data].sort((a, b) => {
            // Ordenar por: COMPANY, AIRLINE, DATE, STATION, AC_REG, FLIGTH, DEST, LOG_BOOK, AC_TYPE, SERV_PR, ASSISTANT_TYPE, AOG, START_TIME, END_TIME, TOTAL_TECHNICIAN_TIME, SERV1, SERV2, SERV3, SERV4, SERV5, SERV6, REMARKS, TECHNICIAN
            const fields: (keyof OperationReportData)[] = [
                "COMPANY", "AIRLINE", "DATE", "STATION", "AC_REG", "FLIGTH", "DEST", "LOG_BOOK", "AC_TYPE", "SERV_PR",
                "ASSISTANT_TYPE", "AOG", "START_TIME", "END_TIME", "TOTAL_TECHNICIAN_TIME", "SERV1", "SERV2", "SERV3",
                "SERV4", "SERV5", "SERV6", "REMARKS", "TECHNICIAN"
            ];
            for (const field of fields) {
                let aValue = a[field] ?? "";
                let bValue = b[field] ?? "";
                // Para la fecha, comparar como fecha real
                if (field === "DATE") {
                    const aDate = parseReportDateStringToDate(aValue);
                    const bDate = parseReportDateStringToDate(bValue);
                    if (aDate && bDate) {
                        if (aDate < bDate) return -1;
                        if (aDate > bDate) return 1;
                    } else if (aDate && !bDate) {
                        return -1;
                    } else if (!aDate && bDate) {
                        return 1;
                    }
                } else {
                    const cmp = customAlphabeticalSort(String(aValue), String(bValue));
                    if (cmp !== 0) return cmp;
                }
            }
            return 0;
        });
    };

    // Aplicar filtros automáticamente cuando cambian los datos o filtros (excepto para la carga inicial de allReports)
    useEffect(() => {
        if (!loading) {
            applyFilters();
        }
    }, [filters, allReports, loading]);

    // Función para cargar todos los datos del backend (sin parámetros)
    const loadAllReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/reports/operation-reports-v2');
            setAllReports(response.data || []);
        } catch (err) {
            setError("Could not load operation reports. Please try again.");
            setReports([]);
            setAllReports([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para aplicar filtros localmente en el frontend
    const applyFilters = () => {
        if (!validateDates(filters.startDate, filters.endDate)) {
            setReports([]);
            return;
        }

        let filteredReports = [...allReports];

        if (filters.company && filters.company !== "all") {
            filteredReports = filteredReports.filter(report => report.COMPANY === filters.company);
        }

        if (filters.airline && filters.airline !== "all") {
            const airlineName = filters.airline;
            filteredReports = filteredReports.filter(report =>
                report.AIRLINE && report.AIRLINE.toLowerCase() === airlineName.toLowerCase()
            );
        }

        if (filters.station && filters.station !== "all") {
            filteredReports = filteredReports.filter(report =>
                report.STATION && report.STATION.toLowerCase() === filters.station.toLowerCase()
            );
        }

        if (filters.startDate) {
            const startDateFilter = new Date(filters.startDate);
            filteredReports = filteredReports.filter(report => {
                const reportDate = parseReportDateStringToDate(report.DATE);
                return reportDate && reportDate >= startDateFilter;
            });
        }

        if (filters.endDate) {
            const endDateFilter = new Date(filters.endDate);
            filteredReports = filteredReports.filter(report => {
                const reportDate = parseReportDateStringToDate(report.DATE);
                return reportDate && reportDate <= endDateFilter;
            });
        }

        // ORDENAR LOS DATOS ANTES DE MOSTRAR
        setReports(sortReports(filteredReports));
    };

    // Función para manejar cambio de fecha de inicio
    const handleStartDateChange = (value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, startDate: value };
            if (prev.endDate && value && new Date(value) > new Date(prev.endDate)) {
                newFilters.endDate = "";
            }
            return newFilters;
        });
    };

    // Función para manejar cambio de fecha de fin
    const handleEndDateChange = (value: string) => {
        setFilters({ ...filters, endDate: value });
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        const dataToExport = reports.length > 0 
            ? reports.map(getExportableReportRow)
            : [['No data available']];

        const ws = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS_EXCEL_CSV, ...dataToExport]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operations Report');

        const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Función para exportar a CSV
    const exportToCSV = () => {
        const dataToExport = reports.length > 0
            ? reports.map(getExportableReportRow)
            : [['No data available']];

        const csvContent = [EXPORT_HEADERS_EXCEL_CSV, ...dataToExport]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
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

    // Función para exportar a PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(16);
            doc.text('Operations Report', 14, 15);
            doc.setFontSize(10);
            const generatedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            }).format(new Date());
            doc.text(`Generated on: ${generatedDate}`, 14, 25);

            const tableData = reports.length > 0 
                ? reports.map(getExportableReportRow)
                : [Array(EXPORT_HEADERS_PDF.length).fill('No data available')];

            autoTable(doc, {
                head: [EXPORT_HEADERS_PDF],
                body: tableData,
                startY: 35,
                styles: {
                    fontSize: 5, 
                    cellPadding: 1,
                    overflow: 'linebreak', 
                },
                headStyles: {
                    fillColor: [0, 33, 87],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                margin: { top: 35, left: 10, right: 10 }, 
                theme: 'striped',
                // columnStyles eliminado para que el ancho de columna sea automático
            });

            const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            const docFallback = new jsPDF('l', 'mm', 'a4');
            docFallback.setFontSize(20);
            docFallback.text('Operations Report', 14, 22);
            docFallback.setFontSize(12);
            const generatedDateFallback = new Intl.DateTimeFormat('en-US', {
                year: 'numeric', month: 'long', day: '2-digit'
            }).format(new Date());
            docFallback.text(`Generated on: ${generatedDateFallback}`, 14, 35);
            let yPosition = 50;
            docFallback.setFontSize(10);

            if (reports.length === 0) {
                docFallback.text('No data available', 14, yPosition);
            } else {
                docFallback.text('COMPANY | AIRLINE | DATE | STATION | FLIGTH', 14, yPosition);
                yPosition += 10;
                reports.slice(0, 15).forEach((report) => {
                    const rowData = getExportableReportRow(report);
                    const line = `${rowData[0]} | ${rowData[1]} | ${rowData[2]} | ${rowData[3]} | ${rowData[5]}`;
                    docFallback.text(line, 14, yPosition);
                    yPosition += 8;
                    if (yPosition > 180) { 
                        docFallback.addPage(); 
                        yPosition = 20; 
                    }
                });
            }
            const fileNameFallback = `operations_report_fallback_${new Date().toISOString().split('T')[0]}.pdf`;
            docFallback.save(fileNameFallback);
        }
    };

    return (
        <AISGBackground>
            <div className="flex flex-col min-h-screen font-['Montserrat'] text-white">
                <div className="flex-shrink-0 p-6 max-w-7xl mx-auto w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Operations Report</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">
                            Search and analyze operational data
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {dateError && (
                        <div className="bg-orange-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{dateError}</p>
                        </div>
                    )}

                    <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            {/* Company Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                                {loading && companyOptions.length === 0 ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.company} 
                                        onChange={(e) => {
                                            setFilters({ ...filters, company: e.target.value, airline: "all", station: "all" });
                                        }}
                                    >
                                        <option value="all">All Companies</option>
                                        {companyOptions.map((company) => (
                                            <option key={company.name} value={company.name}> 
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Airline Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                                {(loading && airlineOptions.length === 0 && filters.company === "all" && allReports.length === 0) ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.airline}
                                        onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                                        disabled={loading && airlineOptions.length === 0 && filters.company === "all" && allReports.length === 0}
                                    >
                                        <option value="all">All Airlines</option>
                                        {airlineOptions.map((airlineName) => (
                                            <option key={airlineName} value={airlineName}>
                                                {airlineName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Station Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                {(loading && stationOptions.length === 0 && filters.company === "all" && allReports.length === 0) ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.station}
                                        onChange={(e) => setFilters({ ...filters, station: e.target.value })}
                                        disabled={loading && stationOptions.length === 0 && filters.company === "all" && allReports.length === 0}
                                    >
                                        <option value="all">All Stations</option>
                                        {stationOptions.map((stationName) => (
                                            <option key={stationName} value={stationName}>
                                                {stationName}
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

                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                    onClick={exportToPDF}
                                    disabled={loading || reports.length === 0}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                                    </svg>
                                    Export PDF
                                </button>
                                <button
                                    className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                    onClick={exportToExcel}
                                    disabled={loading || reports.length === 0}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" clipRule="evenodd" />
                                    </svg>
                                    Export Excel
                                </button>
                                <button
                                    className="bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
                                    onClick={exportToCSV}
                                    disabled={loading || reports.length === 0}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Export CSV
                                </button>
                            </div>
                            {/* Botón de búsqueda eliminado porque la búsqueda es automática */}
                        </div>
                    </div>
                    
                    {(loading && reports.length === 0 && allReports.length === 0) && (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
                        </div>
                    )}

                    <div className="mb-4 text-white">
                        <p>Total records: {allReports.length} | Filtered records: {reports.length}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden px-6 pb-6 max-w-7xl mx-auto w-full">
                    <div className="h-full w-full overflow-auto">
                        <table className="border-collapse text-xs text-white" style={{ minWidth: 'max-content' }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-white text-[#002057]">
                                    {EXPORT_HEADERS_EXCEL_CSV.map(header => (
                                        <th key={header} className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {reports.length > 0 ? (
                                    reports.map((item, index) => {
                                        const rowData = getExportableReportRow(item);
                                        return (
                                            <tr key={`${item.COMPANY || 'comp'}-${item.AIRLINE || 'air'}-${String(item.DATE)}-${item.FLIGTH || 'flt'}-${index}`} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                                                {rowData.map((cellData, cellIndex) => (
                                                    <td key={cellIndex} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{cellData}</td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={EXPORT_HEADERS_EXCEL_CSV.length} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap text-center">
                                            {loading ? 'Loading data...' :
                                              (allReports.length === 0 && !error) ? 'No operation reports available.' : 
                                              'No operation reports match the current filters.'
                                            }
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

export default OperationReport;