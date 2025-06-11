/**
 * Pantalla de consulta y exportación de servicios operativos para AISG.
 * Permite filtrar servicios por compañía, aerolínea, estación y rango de fechas.
 * Ofrece exportación a Excel, CSV y PDF.
 * Utiliza React, axiosInstance, XLSX y jsPDF/autotable.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AISGBackground from "../catalogs/fondo";

interface OperationRow {
    COMPANY: string | null;
    LLAVE: number | string | null;
    AIRLINE: string | null;
    DATE: string | null;
    STATION: string | null;
    AC_REG: string | null;
    FLIGHT: string | null;
    AC_TYPE: string | null;
    ASSISTANT_TYPE?: string | null;
    AOG?: string | null;
    START_TIME: string | null;
    END_TIME: string | null;
    TOTAL_TECHNICIAN_TIME?: string | null;
    ON_GND?: string | null;
    SERVICE: string | null;
    WORK_REFERENCE: string | null;
    TECHNICIAN: string | null;
}

interface CompanyOption {
    llave: string;
    companyCode: string;
    companyName: string;
}

const EXPORT_HEADERS = [
    'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Fligth', 'A/C Type', 'Assistant Type', 'AOG',
    'Start Time', 'End Time', 'Total Technician Time', 'Service', 'Work Reference', 'Technician'
];

const getDisplayValue = (value: string | number | null | undefined): string =>
    value == null || String(value).trim() === '' ? '' : String(value);

const getAOGDisplay = (aog: string | null | undefined): string =>
    aog === "1" ? "SI" : aog === "2" ? "NO" : aog ?? "";

const getAssistantTypeDisplay = (type: string | null | undefined): string =>
    type === "1" ? "on call" : type === "3" ? "Routine" : type ?? "";

const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    if ([year, month, day].some(isNaN)) return dateString;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: '2-digit', timeZone: 'UTC'
    }).format(new Date(Date.UTC(year, month - 1, day)));
};

const getExportableServiceRow = (row: OperationRow): string[] => [
    getDisplayValue(row.COMPANY),
    getDisplayValue(row.AIRLINE),
    formatDateForDisplay(row.DATE),
    getDisplayValue(row.STATION),
    getDisplayValue(row.AC_REG),
    getDisplayValue(row.FLIGHT),
    getDisplayValue(row.AC_TYPE),
    getAssistantTypeDisplay(row.ASSISTANT_TYPE),
    getAOGDisplay(row.AOG),
    getDisplayValue(row.START_TIME),
    getDisplayValue(row.END_TIME),
    getDisplayValue(row.ON_GND ?? row.TOTAL_TECHNICIAN_TIME),
    getDisplayValue(row.SERVICE),
    getDisplayValue(row.WORK_REFERENCE),
    getDisplayValue(row.TECHNICIAN)
];

const customAlphabeticalSort = (a: string | undefined | null, b: string | undefined | null) => {
    const valA = typeof a === 'string' ? a : '';
    const valB = typeof b === 'string' ? b : '';
    const aUpper = valA.toUpperCase(), bUpper = valB.toUpperCase();
    const aNum = /^[0-9]/.test(aUpper), bNum = /^[0-9]/.test(bUpper);
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    return aUpper.localeCompare(bUpper, 'en', { numeric: true });
};

const sortOperationRows = (data: OperationRow[]): OperationRow[] => {
    const fields: (keyof OperationRow)[] = [
        "COMPANY", "AIRLINE", "DATE", "STATION", "AC_REG", "FLIGHT", "AC_TYPE", "ASSISTANT_TYPE", "AOG",
        "START_TIME", "END_TIME", "ON_GND", "SERVICE", "WORK_REFERENCE", "TECHNICIAN"
    ];
    return [...data].sort((a, b) => {
        for (const field of fields) {
            let aValue = a[field] ?? "", bValue = b[field] ?? "";
            if (field === "DATE") {
                if (!aValue && !bValue) continue;
                if (!aValue) return -1;
                if (!bValue) return 1;
                const [ay, am, ad] = String(aValue).split('-').map(Number);
                const [by, bm, bd] = String(bValue).split('-').map(Number);
                const aDate = new Date(Date.UTC(ay, am - 1, ad));
                const bDate = new Date(Date.UTC(by, bm - 1, bd));
                if (aDate < bDate) return -1;
                if (aDate > bDate) return 1;
            } else {
                const cmp = customAlphabeticalSort(aValue as string, bValue as string);
                if (cmp !== 0) return cmp;
            }
        }
        return 0;
    });
};

const OperationService: React.FC = () => {
    const [filters, setFilters] = useState({ company: "all", airline: "all", station: "all", startDate: "", endDate: "" });
    const [displayedData, setDisplayedData] = useState<OperationRow[]>([]);
    const [allRawData, setAllRawData] = useState<OperationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    const validateDates = (startDate: string, endDate: string): boolean => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setDateError("Start date cannot be greater than end date.");
            return false;
        }
        setDateError(null);
        return true;
    };

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/reports/services-reports');
            setAllRawData(Array.isArray(response.data) ? response.data : []);
        } catch {
            setError("Could not load data. Please try again.");
            setAllRawData([]);
            setDisplayedData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);

    const companyOptions = useMemo<CompanyOption[]>(() => {
        const map = new Map<string, CompanyOption>();
        allRawData.forEach(r => {
            if (r.LLAVE != null && r.COMPANY) {
                const llaveStr = String(r.LLAVE);
                if (!map.has(llaveStr)) map.set(llaveStr, { llave: llaveStr, companyCode: r.COMPANY, companyName: r.COMPANY });
            }
        });
        return Array.from(map.values()).sort((a, b) => customAlphabeticalSort(a.companyCode, b.companyCode));
    }, [allRawData]);

    const getOptions = (key: keyof OperationRow) => {
        let arr = allRawData;
        if (filters.company !== "all") arr = arr.filter(r => String(r.LLAVE) === filters.company);
        const set = new Set<string>();
        arr.forEach(r => r[key] && set.add(r[key]!));
        return Array.from(set).sort(customAlphabeticalSort);
    };

    const airlineOptions = useMemo(() => getOptions("AIRLINE"), [allRawData, filters.company]);
    const stationOptions = useMemo(() => getOptions("STATION"), [allRawData, filters.company]);

    useEffect(() => {
        if (filters.airline !== "all" && !airlineOptions.includes(filters.airline)) setFilters(f => ({ ...f, airline: "all" }));
    }, [filters.airline, airlineOptions]);
    useEffect(() => {
        if (filters.station !== "all" && !stationOptions.includes(filters.station)) setFilters(f => ({ ...f, station: "all" }));
    }, [filters.station, stationOptions]);

    const applyFiltersAndSetData = useCallback(() => {
        if (loading && allRawData.length === 0) return;
        if (!validateDates(filters.startDate, filters.endDate)) { setDisplayedData([]); return; }
        let filtered = allRawData;
        if (filters.company !== "all") filtered = filtered.filter(r => String(r.LLAVE) === filters.company);
        if (filters.airline !== "all") filtered = filtered.filter(r => r.AIRLINE === filters.airline);
        if (filters.station !== "all") filtered = filtered.filter(r => r.STATION === filters.station);
        if (filters.startDate) {
            const start = new Date(filters.startDate); start.setUTCHours(0, 0, 0, 0);
            filtered = filtered.filter(r => {
                if (!r.DATE) return false;
                const [y, m, d] = r.DATE.split('-').map(Number);
                return new Date(Date.UTC(y, m - 1, d)) >= start;
            });
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate); end.setUTCHours(0, 0, 0, 0);
            filtered = filtered.filter(r => {
                if (!r.DATE) return false;
                const [y, m, d] = r.DATE.split('-').map(Number);
                return new Date(Date.UTC(y, m - 1, d)) <= end;
            });
        }
        setDisplayedData(sortOperationRows(filtered));
    }, [filters, allRawData, loading]);

    useEffect(() => {
        if (!loading || allRawData.length > 0) applyFiltersAndSetData();
    }, [filters, allRawData, loading, applyFiltersAndSetData]);

    const handleStartDateChange = (v: string) => setFilters(f => {
        const nf = { ...f, startDate: v };
        if (f.endDate && v && new Date(v) > new Date(f.endDate)) nf.endDate = "";
        return nf;
    });
    const handleEndDateChange = (v: string) => setFilters(f => ({ ...f, endDate: v }));

    const exportToExcel = () => {
        const data = displayedData.length ? displayedData.map(getExportableServiceRow) : [['']];
        const ws = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operation Services');
        XLSX.writeFile(wb, `operation_services_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToCSV = () => {
        const data = displayedData.length ? displayedData.map(getExportableServiceRow) : [['']];
        const csv = [EXPORT_HEADERS, ...data].map(row => row.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `operation_services_${new Date().toISOString().split('T')[0]}.csv`;
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
            doc.text(`Generated on: ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date())}`, 14, 25);
            const tableData = displayedData.length ? displayedData.map(getExportableServiceRow) : [Array(EXPORT_HEADERS.length).fill('')];
            autoTable(doc, {
                head: [EXPORT_HEADERS], body: tableData, startY: 35,
                styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
                headStyles: { fillColor: [0, 33, 87], textColor: [255, 255, 255], fontStyle: 'bold' },
                margin: { top: 35, left: 10, right: 10 }, theme: 'striped',
                columnStyles: {
                    0: { cellWidth: 18 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 }, 3: { cellWidth: 15 },
                    4: { cellWidth: 15 }, 5: { cellWidth: 15 }, 6: { cellWidth: 15 }, 7: { cellWidth: 15 },
                    8: { cellWidth: 15 }, 9: { cellWidth: 15 }, 10: { cellWidth: 15 }, 11: { cellWidth: 15 },
                    12: { cellWidth: 20 }, 13: { cellWidth: 20 }, 14: { cellWidth: 22 }
                }
            });
            doc.save(`operation_services_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            const docFallback = new jsPDF('l', 'mm', 'a4');
            docFallback.setFontSize(12);
            docFallback.text('Error generating PDF. Please check console.', 14, 22);
            docFallback.save(`operation_services_error_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    };

    return (
        <AISGBackground>
            <div className="flex flex-col min-h-screen font-['Montserrat'] text-white">
                <div className="flex-shrink-0 p-6 max-w-7xl mx-auto w-full">
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
                                {(loading && companyOptions.length === 0 && allRawData.length === 0) ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">Loading...</div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.company}
                                        onChange={e => setFilters(f => ({ ...f, company: e.target.value, airline: "all", station: "all" }))}
                                        disabled={loading && companyOptions.length === 0 && allRawData.length === 0}
                                    >
                                        <option value="all">All Companies</option>
                                        {companyOptions.map(c => (
                                            <option key={c.llave} value={c.llave}>{c.companyCode}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                                {(loading && airlineOptions.length === 0 && filters.company === "all" && allRawData.length === 0) ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">Loading...</div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.airline}
                                        onChange={e => setFilters(f => ({ ...f, airline: e.target.value }))}
                                        disabled={loading && airlineOptions.length === 0 && filters.company === "all" && allRawData.length === 0}
                                    >
                                        <option value="all">All Airlines</option>
                                        {airlineOptions.map(a => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                {(loading && stationOptions.length === 0 && filters.company === "all" && allRawData.length === 0) ? (
                                    <div className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 animate-pulse text-center">Loading...</div>
                                ) : (
                                    <select
                                        className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none"
                                        value={filters.station}
                                        onChange={e => setFilters(f => ({ ...f, station: e.target.value }))}
                                        disabled={loading && stationOptions.length === 0 && filters.company === "all" && allRawData.length === 0}
                                    >
                                        <option value="all">All Stations</option>
                                        {stationOptions.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
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
                        <div className="flex flex-wrap justify-start items-center gap-4">
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
                        </div>
                    </div>
                    {(loading && displayedData.length === 0 && allRawData.length === 0) && (
                        <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div></div>
                    )}
                    <div className="mb-4 text-white">
                        <p>Total records: {allRawData.length} | Filtered records: {displayedData.length}</p>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden px-6 pb-6 max-w-7xl mx-auto w-full">
                    <div className="h-full w-full overflow-auto">
                        <table className="border-collapse text-xs text-white" style={{ minWidth: 'max-content' }}>
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-white text-[#002057]">
                                    {EXPORT_HEADERS.map(header => (
                                        <th key={header} className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {displayedData.length > 0 ? (
                                    displayedData.map((row, idx) => {
                                        const rowData = getExportableServiceRow(row);
                                        return (
                                            <tr key={`${getDisplayValue(row.LLAVE)}-${getDisplayValue(row.DATE)}-${getDisplayValue(row.FLIGHT)}-${idx}`} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                                                {rowData.map((cellData, cellIdx) => (
                                                    <td key={cellIdx} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{cellData}</td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={EXPORT_HEADERS.length} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap text-center">
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