import React, { useState, useEffect, useMemo } from "react";
import AISGBackground from "./fondo";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definir las interfaces según el schema del backend OperationReportV2Response
interface OperationReportData {
    COMPANY: string;
    LLAVE: number | null; // Campo agregado para búsqueda, NO se muestra en la tabla
    AIRLINE: string;
    DATE: string | number; // Puede ser "YYYY-MM-DD", "YYYYMMDD" (string), o un número de días (ej. TO_DAYS)
    STATION: string;
    AC_REG: string;
    FLIGTH: string;
    DEST: string;
    LOG_BOOK: string;
    AC_TYPE: string;
    START_TIME: string;
    END_TIME: string;
    SERV_PR: string;
    ON_GND: string;
    SERV1: string;
    SERV2: string;
    SERV3: string;
    SERV4: string;
    SERV5: string;
    SERV6: string;
    REMARKS: string;
    TECHNICIAN: string;
}

// Interfaces para las opciones de los dropdowns derivadas de OperationReportData
interface CompanyOption {
    llave: number;
    name: string; // COMPANY (companyCode)
}

// AirlineOption será simplemente un string (nombre de la aerolínea)
// StationOption será simplemente un string (nombre de la estación)

// Helper function to parse date string or number (YYYY-MM-DD, YYYYMMDD, or days since 0001-01-01) to Date object (UTC)
const parseReportDateStringToDate = (dateValue: string | number | null): Date | null => {
    if (dateValue === null || dateValue === undefined) return null;

    if (typeof dateValue === 'number') {
        // Assuming dateValue is days since 0001-01-01 (like .NET ToOADate() or SQL Server date integer).
        // The Unix epoch (1970-01-01) is 719163 days after 0000-00-00.
        // The .NET epoch (0001-01-01) is 1 day after 0000-00-00.
        // So, Unix epoch is 719163 - 1 = 719162 days after .NET epoch (0001-01-01).
        // Or, more directly:
        // Days from 0001-01-01 to 1970-01-01 (Unix epoch):
        // Excel/OADate considers 1900-01-01 as day 1 (with a bug for 1900 being a leap year).
        // .NET DateTime.ToOADate() uses 1899-12-30 as day 0.
        // SQL Server integer for date often means days since 1900-01-01.
        // Given the example 739423 -> 22-jun-2025, this implies days from 0001-01-01.
        // Number of days from 0001-01-01 to 1970-01-01 is 719162.
        // (Year 0 doesn't exist in Gregorian calendar, starts with year 1)
        // (1969 years * 365 days/year) + (number of leap years between 1 and 1969)
        // Number of leap years: floor(1969/4) - floor(1969/100) + floor(1969/400) = 492 - 19 + 4 = 477
        // Total days = 1969 * 365 + 477 = 718685 + 477 = 719162
        
        // So, if dateValue is days since 0001-01-01:
        // dateValue = 739423 (example for June 22, 2025)
        // daysSinceUnixEpoch = dateValue - 719162 (days from 0001-01-01 to 1970-01-01)
        const daysSinceUnixEpoch = dateValue - 719162;
        const millisecondsSinceUnixEpoch = daysSinceUnixEpoch * 24 * 60 * 60 * 1000;
        const date = new Date(millisecondsSinceUnixEpoch);
        
        if (!isNaN(date.getTime())) {
            // The Date object created from a timestamp is inherently UTC.
            return date;
        }
        return null; // Invalid number or calculation resulted in NaN
    }

    // If it's a string, proceed with existing string parsing logic
    const dateString = String(dateValue); // Ensure dateValue is treated as a string

    // Attempt 1: Standard ISO parsing (handles "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ssZ", etc.)
    // "YYYY-MM-DD" is parsed as UTC midnight by new Date().
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Attempt 2: Parse "YYYYMMDD" string
    if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1; // Month is 0-indexed in JS Date
        const day = parseInt(dateString.substring(6, 8), 10);
        
        // Construct as UTC date
        const utcDate = new Date(Date.UTC(year, month, day));
        // Validate if the constructed date is correct
        if (utcDate.getUTCFullYear() === year && utcDate.getUTCMonth() === month && utcDate.getUTCDate() === day) {
            return utcDate;
        }
    }
    return null; // Return null if parsing failed
};

// Helper function to format date value (from report.DATE) for display
const formatDateForDisplay = (dateValue: string | number | null): string => {
    const date = parseReportDateStringToDate(dateValue);
    if (date) {
        // Using Intl.DateTimeFormat for a localized format
        return new Intl.DateTimeFormat('en-US', { // Changed to 'en-US'
            year: 'numeric',
            month: 'long', // 'long' for full month name e.g., "June"
            day: '2-digit',
            timeZone: 'UTC' // Important to format the UTC date components as is
        }).format(date);
    }
    // Fallback to original string representation or N/A if null/undefined
    if (dateValue === null || dateValue === undefined) return "N/A";
    return String(dateValue); 
};


const OperationReport: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "all", // "all" o LLAVE (string)
        airline: "all", // "all" o nombre de la aerolínea (string)
        station: "all", // "all" o nombre de la estación (string)
        startDate: "",
        endDate: "",
    });

    const [reports, setReports] = useState<OperationReportData[]>([]);
    const [allReports, setAllReports] = useState<OperationReportData[]>([]);
    const [loading, setLoading] = useState(true); // Estado de carga general
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    // Estados para las opciones de los dropdowns
    const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
    const [airlineOptions, setAirlineOptions] = useState<string[]>([]);
    const [stationOptions, setStationOptions] = useState<string[]>([]);

    // Función para validar fechas
    const validateDates = (startDate: string, endDate: string): boolean => {
        if (startDate && endDate) {
            // Input dates are "YYYY-MM-DD". new Date() parses them as UTC midnight.
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

    // Cargar todos los reportes al inicio
    useEffect(() => {
        loadAllReports();
    }, []);

    // Cuando allReports cambia, poblar las opciones de compañía
    useEffect(() => {
        if (allReports.length > 0) {
            // Poblar Compañías
            const uniqueCompaniesMap = new Map<number, string>();
            allReports.forEach(report => {
                if (report.LLAVE !== null && report.COMPANY) {
                    uniqueCompaniesMap.set(report.LLAVE, report.COMPANY);
                }
            });
            const companies = Array.from(uniqueCompaniesMap, ([llave, name]) => ({ llave, name }))
                .sort((a, b) => customAlphabeticalSort(a.name, b.name));
            setCompanyOptions(companies);
        } else {
            setCompanyOptions([]);
            setAirlineOptions([]); // Resetear si no hay reportes
            setStationOptions([]); // Resetear si no hay reportes
        }
    }, [allReports]);


    // Cuando filters.company cambia, o allReports/companyOptions se actualizan,
    // actualizar las opciones de aerolíneas y estaciones.
    useEffect(() => {
        if (allReports.length > 0 && companyOptions.length > 0) {
            updateAirlineOptions(filters.company, allReports, companyOptions);
            updateStationOptions(filters.company, allReports);

            // Si la aerolínea seleccionada ya no está en las nuevas opciones (excepto "all"), resetearla
            const currentFilteredAirlines = getFilteredAirlines(filters.company, allReports, companyOptions);
            if (filters.airline !== "all" && !currentFilteredAirlines.includes(filters.airline)) {
                 setFilters(prev => ({ ...prev, airline: "all" }));
            }

            // Si la estación seleccionada ya no está en las nuevas opciones (excepto "all"), resetearla
            const currentFilteredStations = getFilteredStations(filters.company, allReports);
            if (filters.station !== "all" && !currentFilteredStations.includes(filters.station)) {
                 setFilters(prev => ({ ...prev, station: "all" }));
            }
        } else if (allReports.length === 0) { // Si no hay reportes, limpiar opciones
            setAirlineOptions([]);
            setStationOptions([]);
        }
    }, [filters.company, allReports, companyOptions]);


    // Aplicar filtros automáticamente cuando cambian los datos o filtros (excepto para la carga inicial de allReports)
    useEffect(() => {
        if (!loading) { // Solo aplicar filtros si no estamos en la carga inicial
            applyFilters();
        }
    }, [filters, allReports, loading]); // allReports se incluye por si acaso, aunque el filtrado es sobre él


    const getFilteredAirlines = (selectedCompanyLlave: string, currentAllReports: OperationReportData[], currentCompanyOptions: CompanyOption[]): string[] => {
        let reportsForAirlineExtraction = currentAllReports;
        if (selectedCompanyLlave !== "all") {
            const companyLlaveNum = Number(selectedCompanyLlave);
            reportsForAirlineExtraction = currentAllReports.filter(report => report.LLAVE === companyLlaveNum);
        }

        const uniqueAirlinesSet = new Set<string>();
        reportsForAirlineExtraction.forEach(report => {
            if (report.AIRLINE) {
                uniqueAirlinesSet.add(report.AIRLINE);
            }
        });
        return Array.from(uniqueAirlinesSet).sort(customAlphabeticalSort);
    };

    const updateAirlineOptions = (selectedCompanyLlave: string, currentAllReports: OperationReportData[], currentCompanyOptions: CompanyOption[]) => {
        setAirlineOptions(getFilteredAirlines(selectedCompanyLlave, currentAllReports, currentCompanyOptions));
    };

    const getFilteredStations = (selectedCompanyLlave: string, currentAllReports: OperationReportData[]): string[] => {
        let reportsForStationExtraction = currentAllReports;
        if (selectedCompanyLlave !== "all") {
            const companyLlaveNum = Number(selectedCompanyLlave);
            reportsForStationExtraction = currentAllReports.filter(report => report.LLAVE === companyLlaveNum);
        }

        const uniqueStationsSet = new Set<string>();
        reportsForStationExtraction.forEach(report => {
            if (report.STATION) {
                uniqueStationsSet.add(report.STATION);
            }
        });
        return Array.from(uniqueStationsSet).sort(customAlphabeticalSort);
    };

    const updateStationOptions = (selectedCompanyLlave: string, currentAllReports: OperationReportData[]) => {
        setStationOptions(getFilteredStations(selectedCompanyLlave, currentAllReports));
    };


    // Función para cargar todos los datos del backend (sin parámetros)
    const loadAllReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/reports/operation-reports-v2');
            setAllReports(response.data || []); // Asegurar que sea un array
            // Los filtros se aplicarán a través del useEffect [filters, allReports]
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

        // Aplicar filtro de compañía usando LLAVE
        if (filters.company && filters.company !== "all") {
            const selectedCompanyLlaveNum = Number(filters.company);
            filteredReports = filteredReports.filter(report =>
                report.LLAVE === selectedCompanyLlaveNum
            );
        }

        // Aplicar filtro de aerolínea usando el nombre de la aerolínea
        if (filters.airline && filters.airline !== "all") {
            const airlineName = filters.airline;
            filteredReports = filteredReports.filter(report =>
                report.AIRLINE && report.AIRLINE.toLowerCase() === airlineName.toLowerCase()
            );
        }

        // Aplicar filtro de estación
        if (filters.station && filters.station !== "all") {
            filteredReports = filteredReports.filter(report =>
                report.STATION && report.STATION.toLowerCase() === filters.station.toLowerCase()
            );
        }

        // Aplicar filtro de fecha de inicio
        if (filters.startDate) {
            const startDateFilter = new Date(filters.startDate); // Parsed as UTC from "YYYY-MM-DD"
            filteredReports = filteredReports.filter(report => {
                const reportDate = parseReportDateStringToDate(report.DATE);
                return reportDate && reportDate >= startDateFilter;
            });
        }

        // Aplicar filtro de fecha de fin
        if (filters.endDate) {
            const endDateFilter = new Date(filters.endDate); // Parsed as UTC from "YYYY-MM-DD"
            filteredReports = filteredReports.filter(report => {
                const reportDate = parseReportDateStringToDate(report.DATE);
                return reportDate && reportDate <= endDateFilter;
            });
        }
        setReports(filteredReports);
    };

    // Función manual de búsqueda (para el botón)
    const searchReports = () => {
        if (!validateDates(filters.startDate, filters.endDate)) {
            return;
        }
        applyFilters(); // Los filtros ya se aplican en useEffect, pero esto asegura la aplicación al hacer clic
    };

    // Función para manejar cambio de fecha de inicio
    const handleStartDateChange = (value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, startDate: value };
            if (prev.endDate && value && new Date(value) > new Date(prev.endDate)) {
                newFilters.endDate = ""; // Resetear endDate si startDate es posterior
            }
            return newFilters;
        });
    };

    // Función para manejar cambio de fecha de fin
    const handleEndDateChange = (value: string) => {
        setFilters({ ...filters, endDate: value });
    };

    // Función para exportar a Excel (NO incluye LLAVE)
    const exportToExcel = () => {
        const headers = [
            'COMPANY', 'AIRLINE', 'DATE', 'STATION', 'AC REG', 'FLIGTH', 'DEST',
            'LOG BOOK', 'A/C TYPE', 'START TIME', 'END TIME', 'SERV PR', 'ON GND',
            'SERV1', 'SERV2', 'SERV3', 'SERV4', 'SERV5', 'SERV6', 'REMARKS', 'TECHNICIAN'
        ];

        const data = reports.length > 0 ? reports.map(report => [
            report.COMPANY, 
            report.AIRLINE,
            formatDateForDisplay(report.DATE), // Formatear fecha para exportación
            report.STATION,
            report.AC_REG,
            report.FLIGTH,
            report.DEST,
            report.LOG_BOOK,
            report.AC_TYPE,
            report.START_TIME,
            report.END_TIME,
            report.SERV_PR,
            report.ON_GND,
            report.SERV1,
            report.SERV2,
            report.SERV3,
            report.SERV4,
            report.SERV5,
            report.SERV6,
            report.REMARKS,
            report.TECHNICIAN
        ]) : [['No data available']];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operations Report');

        const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Función para exportar a CSV (NO incluye LLAVE)
    const exportToCSV = () => {
        const headers = [
            'COMPANY', 'AIRLINE', 'DATE', 'STATION', 'AC REG', 'FLIGTH', 'DEST',
            'LOG BOOK', 'A/C TYPE', 'START TIME', 'END TIME', 'SERV PR', 'ON GND',
            'SERV1', 'SERV2', 'SERV3', 'SERV4', 'SERV5', 'SERV6', 'REMARKS', 'TECHNICIAN'
        ];

        const csvData = reports.length > 0 ? reports.map(report => [
            report.COMPANY, 
            report.AIRLINE,
            formatDateForDisplay(report.DATE), // Formatear fecha para exportación
            report.STATION,
            report.AC_REG,
            report.FLIGTH,
            report.DEST,
            report.LOG_BOOK,
            report.AC_TYPE,
            report.START_TIME,
            report.END_TIME,
            report.SERV_PR,
            report.ON_GND,
            report.SERV1,
            report.SERV2,
            report.SERV3,
            report.SERV4,
            report.SERV5,
            report.SERV6,
            report.REMARKS,
            report.TECHNICIAN
        ]) : [['No data available']];

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${String(field === null || field === undefined ? '' : field).replace(/"/g, '""')}"`).join(','))
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

    // Función para exportar a PDF (NO incluye LLAVE)
    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(16);
            doc.text('Operations Report', 14, 15);
            doc.setFontSize(10);
            // Format "Generated on" date to American English
            const generatedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            }).format(new Date());
            doc.text(`Generated on: ${generatedDate}`, 14, 25);

            const columns = [
                'COMPANY', 'AIRLINE', 'DATE', 'STATION', 'AC REG', 'FLIGTH', 'DEST',
                'LOG BOOK', 'A/C TYPE', 'START TIME', 'END TIME', 'SERV PR', 'ON GND',
                'SERV1', 'SERV2', 'SERV3', 'SERV4', 'SERV5', 'SERV6', 'REMARKS', 'TECHNICIAN'
            ];

            const tableData = reports.length > 0 ? reports.map(report => [
                report.COMPANY || '', 
                report.AIRLINE || '',
                formatDateForDisplay(report.DATE), // Formatear fecha para exportación
                report.STATION || '',
                report.AC_REG || '',
                report.FLIGTH || '',
                report.DEST || '',
                report.LOG_BOOK || '',
                report.AC_TYPE || '',
                report.START_TIME || '',
                report.END_TIME || '',
                report.SERV_PR || '',
                report.ON_GND || '',
                report.SERV1 || '',
                report.SERV2 || '',
                report.SERV3 || '',
                report.SERV4 || '',
                report.SERV5 || '',
                report.SERV6 || '',
                report.REMARKS || '',
                report.TECHNICIAN || ''
            ]) : [['No data available', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];

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
                    0: { cellWidth: 15 },
                    1: { cellWidth: 15 },
                    2: { cellWidth: 18 }, // DATE column adjusted for new format
                    3: { cellWidth: 10 },
                    4: { cellWidth: 12 },
                    5: { cellWidth: 10 },
                    6: { cellWidth: 10 },
                    7: { cellWidth: 12 },
                    8: { cellWidth: 12 },
                    9: { cellWidth: 12 },
                    10: { cellWidth: 12 },
                    11: { cellWidth: 10 },
                    12: { cellWidth: 10 },
                    13: { cellWidth: 8 },
                    14: { cellWidth: 8 },
                    15: { cellWidth: 8 },
                    16: { cellWidth: 8 },
                    17: { cellWidth: 8 },
                    18: { cellWidth: 8 },
                    19: { cellWidth: 15 },
                    20: { cellWidth: 12 },
                }
            });

            const fileName = `operations_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            const docFallback = new jsPDF('l', 'mm', 'a4');
            docFallback.setFontSize(20);
            docFallback.text('Operations Report', 14, 22);
            docFallback.setFontSize(12);
            // Format "Generated on" date to American English for fallback PDF
            const generatedDateFallback = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            }).format(new Date());
            docFallback.text(`Generated on: ${generatedDateFallback}`, 14, 35);

            let yPosition = 50;
            docFallback.setFontSize(10);

            if (reports.length === 0) {
                docFallback.text('No data available', 14, yPosition);
            } else {
                docFallback.text('COMPANY | AIRLINE | DATE | STATION | FLIGTH', 14, yPosition);
                yPosition += 10;

                reports.forEach((report) => {
                    const companyDisplay = report.COMPANY; 
                    const line = `${companyDisplay || 'N/A'} | ${report.AIRLINE || 'N/A'} | ${formatDateForDisplay(report.DATE)} | ${report.STATION || 'N/A'} | ${report.FLIGTH || 'N/A'}`;
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
                                            setFilters({ ...filters, company: e.target.value, airline: "all", station: "all" }); // Reset airline and station when company changes
                                        }}
                                    >
                                        <option value="all">All Companies</option>
                                        {companyOptions.map((company) => (
                                            <option key={company.llave} value={String(company.llave)}>
                                                {company.name} {/* Muestra el código de compañía (COMPANY) */}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Airline Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                                {loading && airlineOptions.length === 0 && filters.company === "all" ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.airline}
                                        onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                                        disabled={loading && airlineOptions.length === 0 && filters.company === "all"}
                                    >
                                        <option value="all">All Airlines</option>
                                        {airlineOptions.map((airlineName) => (
                                            <option key={airlineName} value={airlineName}>
                                                {airlineName} {/* Muestra el nombre de la aerolínea (AIRLINE) */}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Station Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                {loading && stationOptions.length === 0 && filters.company === "all" ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.station}
                                        onChange={(e) => setFilters({ ...filters, station: e.target.value })}
                                        disabled={loading && stationOptions.length === 0 && filters.company === "all"}
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

                            <button
                                className={`${
                                    dateError || loading
                                        ? 'bg-gray-500 cursor-not-allowed' 
                                        : 'bg-[#00B140] hover:bg-[#009935]'
                                } text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200`}
                                onClick={searchReports} // La búsqueda ahora solo re-aplica filtros, no llama a API
                                disabled={loading || !!dateError}
                            >
                                {loading ? 'Loading Data...' : 'Search'}
                            </button>
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
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">COMPANY</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">AIRLINE</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">DATE</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">STATION</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">AC REG</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">FLIGTH</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">DEST</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">LOG BOOK</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">A/C TYPE</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">START TIME</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">END TIME</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV PR</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">ON GND</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV1</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV2</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV3</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV4</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV5</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">SERV6</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">REMARKS</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">TECHNICIAN</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {reports.length > 0 ? (
                                    reports.map((item, index) => (
                                        <tr key={`${item.LLAVE}-${String(item.DATE)}-${item.FLIGTH}-${index}`} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.COMPANY}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.AIRLINE}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{formatDateForDisplay(item.DATE)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.STATION}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.AC_REG}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.FLIGTH}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.DEST}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.LOG_BOOK}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.AC_TYPE}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.START_TIME}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.END_TIME}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV_PR}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.ON_GND}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV1}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV2}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV3}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV4}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV5}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.SERV6}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.REMARKS}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{item.TECHNICIAN}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={21} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap text-center">
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