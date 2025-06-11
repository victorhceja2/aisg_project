import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import AISGBackground from "../catalogs/fondo";

interface OperationRow {
    COMPANY: string | null;
    LLAVE: number | string | null; // Usado para filtrar por compañía
    AIRLINE: string | null;
    DATE: string | null; // Se asume formato "YYYY-MM-DD" o compatible con new Date()
    STATION: string | null;
    AC_REG: string | null;
    FLIGHT: string | null;
    AC_TYPE: string | null;
    START_TIME: string | null;
    END_TIME: string | null;
    ON_GND: string | null;
    SERVICE: string | null;
    WORK_REFERENCE: string | null;
    TECHNICIAN: string | null;
}

interface CompanyOption {
    llave: string;
    companyCode: string;
    companyName: string;
}

const OperationService: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "all",
        airline: "all",
        station: "all",
        startDate: "",
        endDate: "",
    });

    const [displayedData, setDisplayedData] = useState<OperationRow[]>([]); // Datos mostrados en la tabla
    const [allRawData, setAllRawData] = useState<OperationRow[]>([]); // Todos los datos cargados del backend

    const [loading, setLoading] = useState(true); // Estado de carga general (para datos iniciales y opciones)
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
    const [airlineOptions, setAirlineOptions] = useState<string[]>([]);
    const [stationOptions, setStationOptions] = useState<string[]>([]);

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

    const customAlphabeticalSort = (a: string | undefined | null, b: string | undefined | null) => {
        const valA = typeof a === 'string' ? a : '';
        const valB = typeof b === 'string' ? b : '';
        const aUpper = valA.toUpperCase();
        const bUpper = valB.toUpperCase();
        const aStartsWithNumber = /^[0-9]/.test(aUpper);
        const bStartsWithNumber = /^[0-9]/.test(bUpper);
        if (aStartsWithNumber && !bStartsWithNumber) return -1;
        if (!aStartsWithNumber && bStartsWithNumber) return 1;
        return aUpper.localeCompare(bUpper, 'en', { numeric: true });
    };

    // Cargar todos los datos y poblar opciones de dropdowns
    const loadInitialDataAndOptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/reports/services-reports');
            console.log("Initial data response:", response);
            const rawData = Array.isArray(response.data) ? response.data : [];
            if (rawData.length > 0) {
                console.log("First item of raw data:", rawData[0]);
            }
            setAllRawData(rawData);

            // Poblar Compañías
            const uniqueCompaniesMap = new Map<string, CompanyOption>();
            rawData.forEach(report => {
                if (report.LLAVE !== null && report.COMPANY) {
                    const llaveStr = String(report.LLAVE);
                    if (!uniqueCompaniesMap.has(llaveStr)) {
                        uniqueCompaniesMap.set(llaveStr, {
                            llave: llaveStr,
                            companyCode: report.COMPANY,
                            companyName: report.COMPANY
                        });
                    }
                }
            });
            const companies = Array.from(uniqueCompaniesMap.values())
                .sort((a, b) => customAlphabeticalSort(a.companyCode, b.companyCode));
            setCompanyOptions(companies);

            // Las aerolíneas y estaciones se poblarán en los useEffect que dependen de allRawData y filters.company

        } catch (err) {
            console.error("Could not load initial data:", err);
            setError("Could not load data or options. Please try again.");
            setAllRawData([]);
            setDisplayedData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialDataAndOptions();
    }, [loadInitialDataAndOptions]);

    // Actualizar opciones de aerolínea cuando cambian los datos crudos o el filtro de compañía
    useEffect(() => {
        if (allRawData.length > 0) {
            updateAirlineOptionsUI(filters.company, allRawData);
        } else {
            setAirlineOptions([]);
        }
    }, [allRawData, filters.company]);

    // Actualizar opciones de estación cuando cambian los datos crudos o el filtro de compañía
    useEffect(() => {
        if (allRawData.length > 0) {
            updateStationOptionsUI(filters.company, allRawData);
        } else {
            setStationOptions([]);
        }
    }, [allRawData, filters.company]);


    const getFilteredAirlinesForUI = (selectedCompanyLlave: string, sourceData: OperationRow[]): string[] => {
        let reportsForAirlineExtraction = sourceData;
        if (selectedCompanyLlave !== "all") {
            reportsForAirlineExtraction = sourceData.filter(report =>
                String(report.LLAVE) === selectedCompanyLlave
            );
        }
        const uniqueAirlinesSet = new Set<string>();
        reportsForAirlineExtraction.forEach(report => {
            if (report.AIRLINE) uniqueAirlinesSet.add(report.AIRLINE);
        });
        return Array.from(uniqueAirlinesSet).sort(customAlphabeticalSort);
    };

    const updateAirlineOptionsUI = (selectedCompanyLlave: string, sourceData: OperationRow[]) => {
        setAirlineOptions(getFilteredAirlinesForUI(selectedCompanyLlave, sourceData));
    };

    const getFilteredStationsForUI = (selectedCompanyLlave: string, sourceData: OperationRow[]): string[] => {
        let reportsForStationExtraction = sourceData;
        if (selectedCompanyLlave !== "all") {
            reportsForStationExtraction = sourceData.filter(report =>
                String(report.LLAVE) === selectedCompanyLlave
            );
        }
        const uniqueStationsSet = new Set<string>();
        reportsForStationExtraction.forEach(report => {
            if (report.STATION) uniqueStationsSet.add(report.STATION);
        });
        return Array.from(uniqueStationsSet).sort(customAlphabeticalSort);
    };

    const updateStationOptionsUI = (selectedCompanyLlave: string, sourceData: OperationRow[]) => {
        setStationOptions(getFilteredStationsForUI(selectedCompanyLlave, sourceData));
    };


    // Resetear filtro de aerolínea y estación si la seleccionada ya no es válida para la compañía actual
    useEffect(() => {
        if (allRawData.length > 0) {
            const currentFilteredAirlines = getFilteredAirlinesForUI(filters.company, allRawData);
            if (filters.airline !== "all" && !currentFilteredAirlines.includes(filters.airline)) {
                setFilters(prev => ({ ...prev, airline: "all" }));
            }

            const currentFilteredStations = getFilteredStationsForUI(filters.company, allRawData);
            if (filters.station !== "all" && !currentFilteredStations.includes(filters.station)) {
                setFilters(prev => ({ ...prev, station: "all" }));
            }
        }
    }, [filters.company, allRawData]);

    // Aplicar filtros localmente cuando cambian los filtros o los datos crudos
    const applyFiltersAndSetData = useCallback(() => {
        if (loading) return; // No aplicar filtros si los datos iniciales aún están cargando

        if (!validateDates(filters.startDate, filters.endDate)) {
            setDisplayedData([]);
            return;
        }

        let filteredData = [...allRawData];

        // Filtrar por Compañía (usando LLAVE)
        if (filters.company !== "all") {
            filteredData = filteredData.filter(row => String(row.LLAVE) === filters.company);
        }

        // Filtrar por Aerolínea
        if (filters.airline !== "all") {
            filteredData = filteredData.filter(row => row.AIRLINE === filters.airline);
        }

        // Filtrar por Estación
        if (filters.station !== "all") {
            filteredData = filteredData.filter(row => row.STATION === filters.station);
        }

        // Filtrar por Fecha de Inicio
        if (filters.startDate) {
            const startDateFilter = new Date(filters.startDate);
            startDateFilter.setUTCHours(0, 0, 0, 0);
        
            filteredData = filteredData.filter(row => {
                if (!row.DATE) return false;
                // Asumimos que row.DATE es "YYYY-MM-DD" y lo parseamos como UTC
                const [year, month, day] = (row.DATE).split('-').map(Number);
                const rowDate = new Date(Date.UTC(year, month - 1, day));
                return rowDate >= startDateFilter;
            });
        }
        
        // Filtrar por Fecha de Fin
        if (filters.endDate) {
            const endDateFilter = new Date(filters.endDate);
            endDateFilter.setUTCHours(0,0,0,0); // Comparar con el inicio del día final
        
            filteredData = filteredData.filter(row => {
                if (!row.DATE) return false;
                 // Asumimos que row.DATE es "YYYY-MM-DD" y lo parseamos como UTC
                const [year, month, day] = (row.DATE).split('-').map(Number);
                const rowDate = new Date(Date.UTC(year, month - 1, day));
                return rowDate <= endDateFilter;
            });
        }

        console.log("Applied filters. Resulting data count:", filteredData.length);
        setDisplayedData(filteredData);

    }, [filters, allRawData, loading]);

    useEffect(() => {
        applyFiltersAndSetData();
    }, [applyFiltersAndSetData]);


    const handleStartDateChange = (value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, startDate: value };
            if (prev.endDate && value && new Date(value) > new Date(prev.endDate)) {
                newFilters.endDate = "";
            }
            return newFilters;
        });
    };

    const handleEndDateChange = (value: string) => {
        setFilters({ ...filters, endDate: value });
    };

    const getDisplayValue = (value: string | number | null | undefined): string => {
        return value === null || value === undefined || String(value).trim() === '' ? '' : String(value);
    };

    // Helper function to format date string (YYYY-MM-DD) for display
    const formatDateForDisplay = (dateString: string | null): string => {
        if (!dateString) return '';
        try {
            // Asumimos que dateString es "YYYY-MM-DD" y lo tratamos como UTC
            const [year, month, day] = dateString.split('-').map(Number);
            if (isNaN(year) || isNaN(month) || isNaN(day)) return dateString; // Fallback si el formato no es el esperado
            
            const date = new Date(Date.UTC(year, month - 1, day)); // Mes es 0-indexado
            
            return new Intl.DateTimeFormat('en-US', { // Changed to 'en-US'
                year: 'numeric',
                month: 'long', // 'long' for full month name e.g., "June"
                day: '2-digit',
                timeZone: 'UTC' // Importante para formatear los componentes de fecha UTC como son
            }).format(date);
        } catch (e) {
            console.warn("Error formatting date:", dateString, e);
            return dateString; // Fallback al string original en caso de error
        }
    };


    const exportToExcel = () => {
        const headers = ['Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'];
        const exportData = displayedData.length > 0 ? displayedData.map(row => [
            getDisplayValue(row.COMPANY), getDisplayValue(row.AIRLINE), formatDateForDisplay(row.DATE), getDisplayValue(row.STATION), getDisplayValue(row.AC_REG), getDisplayValue(row.FLIGHT),
            getDisplayValue(row.AC_TYPE), getDisplayValue(row.START_TIME), getDisplayValue(row.END_TIME), getDisplayValue(row.ON_GND), getDisplayValue(row.SERVICE), getDisplayValue(row.WORK_REFERENCE), getDisplayValue(row.TECHNICIAN)
        ]) : [['']];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operation Services');
        XLSX.writeFile(wb, `operation_services_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToCSV = () => {
        const headers = ['Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'];
        const csvData = displayedData.length > 0 ? displayedData.map(row => [
            getDisplayValue(row.COMPANY), getDisplayValue(row.AIRLINE), formatDateForDisplay(row.DATE), getDisplayValue(row.STATION), getDisplayValue(row.AC_REG), getDisplayValue(row.FLIGHT),
            getDisplayValue(row.AC_TYPE), getDisplayValue(row.START_TIME), getDisplayValue(row.END_TIME), getDisplayValue(row.ON_GND), getDisplayValue(row.SERVICE), getDisplayValue(row.WORK_REFERENCE), getDisplayValue(row.TECHNICIAN)
        ]) : [['']];
        const csvContent = [headers, ...csvData].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
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

    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(16); doc.text('Operation Services Report', 14, 15);
            doc.setFontSize(10);
            // Format "Generated on" date to American English
            const generatedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            }).format(new Date());
            doc.text(`Generated on: ${generatedDate}`, 14, 25);

            const columns = ['Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 'Work Reference', 'Technician'];
            const tableData = displayedData.length > 0 ? displayedData.map(row => [
                getDisplayValue(row.COMPANY), getDisplayValue(row.AIRLINE), formatDateForDisplay(row.DATE), getDisplayValue(row.STATION), getDisplayValue(row.AC_REG), getDisplayValue(row.FLIGHT),
                getDisplayValue(row.AC_TYPE), getDisplayValue(row.START_TIME), getDisplayValue(row.END_TIME), getDisplayValue(row.ON_GND), getDisplayValue(row.SERVICE), getDisplayValue(row.WORK_REFERENCE), getDisplayValue(row.TECHNICIAN)
            ]) : [['', '', '', '', '', '', '', '', '', '', '', '', '']];
            autoTable(doc, {
                head: [columns], body: tableData, startY: 35,
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: [0, 33, 87], textColor: [255, 255, 255], fontStyle: 'bold' },
                margin: { top: 35, left: 14, right: 14 }, theme: 'striped',
                columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 25 }, 2: { cellWidth: 22 }, 3: { cellWidth: 15 }, 4: { cellWidth: 18 }, 5: { cellWidth: 18 }, 6: { cellWidth: 15 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 }, 9: { cellWidth: 15 }, 10: { cellWidth: 20 }, 11: { cellWidth: 20 }, 12: { cellWidth: 25 } } // Adjusted Date column width
            });
            doc.save(`operation_services_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            const docFallback = new jsPDF('l', 'mm', 'a4');
            docFallback.setFontSize(12); docFallback.text('Error generating PDF. Please check console.', 14, 22);
            docFallback.save(`operation_services_error_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    };

    console.log("State before render - displayedData:", displayedData);
    console.log("State before render - loading:", loading);
    console.log("State before render - error:", error);
    console.log("State before render - dateError:", dateError);

    return (
        <AISGBackground>
            <div className="flex flex-col min-h-screen font-['Montserrat'] text-white">
                <div className="flex-shrink-0 p-6 max-w-7xl mx-auto w-full"> {/* Changed from py-8 px-4 and max-w-7xl mx-auto */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Operation Services Report</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">Search and analyze operational services</p>
                    </div>

                    {error && <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse"><p className="font-medium">{error}</p></div>}
                    {dateError && <div className="bg-orange-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse"><p className="font-medium">{dateError}</p></div>}

                    <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                                {(loading && companyOptions.length === 0) ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">Loading...</div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.company}
                                        onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value, airline: "all", station: "all" }))}
                                        disabled={loading && companyOptions.length === 0}
                                    >
                                        <option value="all">All Companies</option>
                                        {companyOptions.map((company) => (
                                            <option key={company.llave} value={company.llave}>{company.companyCode}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                                {(loading && airlineOptions.length === 0 && filters.company === "all") ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">Loading...</div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.airline}
                                        onChange={(e) => setFilters(prev => ({ ...prev, airline: e.target.value }))}
                                        disabled={(loading && airlineOptions.length === 0 && filters.company === "all") || (filters.company !== "all" && airlineOptions.length === 0 && !allRawData.some(d => String(d.LLAVE) === filters.company && d.AIRLINE))}
                                    >
                                        <option value="all">All Airlines</option>
                                        {airlineOptions.map((airlineName) => (
                                            <option key={airlineName} value={airlineName}>{airlineName}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                {(loading && stationOptions.length === 0 && filters.company === "all") ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">Loading...</div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.station}
                                        onChange={(e) => setFilters(prev => ({ ...prev, station: e.target.value }))}
                                        disabled={(loading && stationOptions.length === 0 && filters.company === "all") || (filters.company !== "all" && stationOptions.length === 0 && !allRawData.some(d => String(d.LLAVE) === filters.company && d.STATION))}
                                    >
                                        <option value="all">All Stations</option>
                                        {stationOptions.map((station) => (<option key={station} value={station}>{station}</option>))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input type="date" className={`w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border ${dateError ? 'border-red-500' : 'border-gray-700'} focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none`}
                                    value={filters.startDate} onChange={e => handleStartDateChange(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input type="date" className={`w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border ${dateError ? 'border-red-500' : 'border-gray-700'} focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none`}
                                    value={filters.endDate} min={filters.startDate || undefined} onChange={e => handleEndDateChange(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-start items-center gap-4"> {/* Changed from justify-between */}
                            <div className="flex flex-wrap gap-2">
                                <button type="button" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2" onClick={exportToPDF} disabled={loading || displayedData.length === 0}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>Export PDF
                                </button>
                                <button type="button" className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2" onClick={exportToExcel} disabled={loading || displayedData.length === 0}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L4.414 9H17a1 1 0 100-2H4.414l1.879-1.879z" clipRule="evenodd" /></svg>Export Excel
                                </button>
                                <button type="button" className="bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center gap-2" onClick={exportToCSV} disabled={loading || displayedData.length === 0}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export CSV
                                </button>
                            </div>
                            {/* Search button was removed in OperationReport, assuming it's not needed here either as filters apply automatically */}
                        </div>
                    </div>

                    {(loading && displayedData.length === 0 && allRawData.length === 0) && (
                        <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div></div>
                    )}

                    <div className="mb-4 text-white">
                        <p>Filtered records: {displayedData.length}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden px-6 pb-6 max-w-7xl mx-auto w-full"> {/* New div for table scroll */}
                    <div className="h-full w-full overflow-auto"> {/* New div for table scroll */}
                        <table className="border-collapse text-xs text-white" style={{ minWidth: 'max-content' }}> {/* Changed from min-w-full table-auto */}
                            <thead className="sticky top-0 z-10"> {/* Added sticky header */}
                                <tr className="bg-white text-[#002057]">
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Company</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Airline</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Date</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Station</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">AC REG</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Flight</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">A/C Type</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Start Time</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">End Time</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">On GND</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Service</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Work Reference</th>
                                    <th className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">Technician</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {displayedData.length > 0 ? (
                                    displayedData.map((row, idx) => (
                                        <tr key={`${getDisplayValue(row.LLAVE)}-${getDisplayValue(row.DATE)}-${getDisplayValue(row.FLIGHT)}-${idx}`} className="bg-transparent hover:bg-[#1E2A45] transition-colors"> {/* Changed from border-b border-[#233554] hover:bg-[#233554] */}
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.COMPANY)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.AIRLINE)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{formatDateForDisplay(row.DATE)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.STATION)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.AC_REG)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.FLIGHT)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.AC_TYPE)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.START_TIME)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.END_TIME)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.ON_GND)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.SERVICE)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.WORK_REFERENCE)}</td>
                                            <td className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{getDisplayValue(row.TECHNICIAN)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap text-center"> {/* Changed from text-center py-8 text-gray-400 */}
                                            {loading ? 'Loading data...' :
                                                (allRawData.length === 0 && !error) ? 'No operation services available.' :
                                                    'No operation services match the current filters.'
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

export default OperationService;