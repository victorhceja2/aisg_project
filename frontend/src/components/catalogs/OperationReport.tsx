/**
 * Pantalla de consulta y exportación de reportes operativos para AISG.
 * Permite filtrar reportes por compañía, aerolínea, estación y rango de fechas.
 * Ofrece exportación a Excel, CSV y PDF.
 * Utiliza React, axiosInstance, XLSX y jsPDF/autotable.
 */

import React, { useState, useEffect, useMemo } from "react";
import AISGBackground from "./fondo";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OperationReportData {
    COMPANY: string | null;
    AIRLINE: string | null;
    DATE: string | null;
    STATION: string | null;
    AC_REG: string | null;
    FLIGTH: string | null;
    DEST: string | null;
    LOG_BOOK: string | null;
    AC_TYPE: string | null;
    START_TIME: string | null;
    END_TIME: string | null;
    SERV_PR: string | null;
    TOTAL_TECHNICIAN_TIME: string | null;
    ASSISTANT_TYPE: string | null;
    AOG: string | null;
    SERV1: string | null;
    SERV2: string | null;
    SERV3: string | null;
    SERV4: string | null;
    SERV5: string | null;
    SERV6: string | null;
    REMARKS: string | null;
    TECHNICIAN: string | null;
}

interface CompanyOption {
    llave: number;
    name: string;
}

const parseReportDateStringToDate = (dateValue: string | number | null): Date | null => {
    if (dateValue == null) return null;
    if (typeof dateValue === 'number') {
        const ms = (dateValue - 719162) * 86400000;
        const date = new Date(ms);
        return isNaN(date.getTime()) ? null : date;
    }
    const dateString = String(dateValue);
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    if (/^\d{8}$/.test(dateString)) {
        const y = +dateString.slice(0, 4), m = +dateString.slice(4, 6) - 1, d = +dateString.slice(6, 8);
        const utcDate = new Date(Date.UTC(y, m, d));
        return utcDate.getUTCFullYear() === y && utcDate.getUTCMonth() === m && utcDate.getUTCDate() === d ? utcDate : null;
    }
    return null;
};

const formatDateForDisplay = (dateValue: string | number | null): string => {
    const date = parseReportDateStringToDate(dateValue);
    return date
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit', timeZone: 'UTC' }).format(date)
        : dateValue == null ? "N/A" : String(dateValue);
};

const customAlphabeticalSort = (a: string, b: string) => {
    const A = a.toUpperCase(), B = b.toUpperCase();
    const aNum = /^[0-9]/.test(A), bNum = /^[0-9]/.test(B);
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    return A.localeCompare(B, 'en', { numeric: true });
};

const getAOGDisplay = (aog: string | null | undefined) => aog === "1" ? "SI" : aog === "2" ? "NO" : aog ?? "";
const getAssistantTypeDisplay = (type: string | null | undefined) => type === "1" ? "on call" : type === "3" ? "Routine" : type ?? "";

const EXPORT_HEADERS = [
    'COMPANY', 'AIRLINE', 'DATE', 'STATION', 'AC REG', 'FLIGTH', 'DEST',
    'LOG BOOK', 'A/C TYPE', 'SERV PR', 'ASSISTANT TYPE', 'AOG', 'START TIME', 'END TIME', 
    'TOTAL TECHNICIAN TIME', 'SERV1', 'SERV2', 'SERV3', 'SERV4', 'SERV5', 'SERV6', 'REMARKS', 'TECHNICIAN'
];

const EXPORT_HEADERS_PDF = [
    ...EXPORT_HEADERS.slice(0, 14), 'TOTAL TECH TIME', ...EXPORT_HEADERS.slice(15)
];

const getSanitized = (v: string | null | undefined) => v == null ? '' : String(v);

const getExportableReportRow = (r: OperationReportData): string[] => [
    getSanitized(r.COMPANY), getSanitized(r.AIRLINE), formatDateForDisplay(r.DATE), getSanitized(r.STATION),
    getSanitized(r.AC_REG), getSanitized(r.FLIGTH), getSanitized(r.DEST), getSanitized(r.LOG_BOOK),
    getSanitized(r.AC_TYPE), getSanitized(r.SERV_PR), getAssistantTypeDisplay(r.ASSISTANT_TYPE),
    getAOGDisplay(r.AOG), getSanitized(r.START_TIME), getSanitized(r.END_TIME),
    getSanitized(r.TOTAL_TECHNICIAN_TIME), getSanitized(r.SERV1), getSanitized(r.SERV2),
    getSanitized(r.SERV3), getSanitized(r.SERV4), getSanitized(r.SERV5), getSanitized(r.SERV6),
    getSanitized(r.REMARKS), getSanitized(r.TECHNICIAN)
];

const OperationReport: React.FC = () => {
    const [filters, setFilters] = useState({ company: "all", airline: "all", station: "all", startDate: "", endDate: "" });
    const [reports, setReports] = useState<OperationReportData[]>([]);
    const [allReports, setAllReports] = useState<OperationReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    const validateDates = (start: string, end: string) => {
        if (start && end && new Date(start) > new Date(end)) {
            setDateError("Start date cannot be greater than end date."); return false;
        }
        setDateError(null); return true;
    };

    useEffect(() => { loadAllReports(); }, []);

    const companyOptions = useMemo<CompanyOption[]>(() => {
        const set = new Set<string>();
        allReports.forEach(r => r.COMPANY && set.add(r.COMPANY));
        return Array.from(set).sort(customAlphabeticalSort).map((name, i) => ({ llave: i, name }));
    }, [allReports]);

    const getFiltered = (key: keyof OperationReportData) => {
        let arr = allReports;
        if (filters.company !== "all") arr = arr.filter(r => r.COMPANY === filters.company);
        const set = new Set<string>();
        arr.forEach(r => r[key] && set.add(r[key]!));
        return Array.from(set).sort(customAlphabeticalSort);
    };

    const airlineOptions = useMemo(() => getFiltered("AIRLINE"), [filters.company, allReports]);
    const stationOptions = useMemo(() => getFiltered("STATION"), [filters.company, allReports]);

    useEffect(() => {
        if (filters.airline !== "all" && !airlineOptions.includes(filters.airline)) setFilters(f => ({ ...f, airline: "all" }));
    }, [filters.airline, airlineOptions]);
    useEffect(() => {
        if (filters.station !== "all" && !stationOptions.includes(filters.station)) setFilters(f => ({ ...f, station: "all" }));
    }, [filters.station, stationOptions]);

    const sortReports = (data: OperationReportData[]) => {
        const fields: (keyof OperationReportData)[] = [
            "COMPANY", "AIRLINE", "DATE", "STATION", "AC_REG", "FLIGTH", "DEST", "LOG_BOOK", "AC_TYPE", "SERV_PR",
            "ASSISTANT_TYPE", "AOG", "START_TIME", "END_TIME", "TOTAL_TECHNICIAN_TIME", "SERV1", "SERV2", "SERV3",
            "SERV4", "SERV5", "SERV6", "REMARKS", "TECHNICIAN"
        ];
        return [...data].sort((a, b) => {
            for (const field of fields) {
                let av = a[field] ?? "", bv = b[field] ?? "";
                if (field === "DATE") {
                    const ad = parseReportDateStringToDate(av), bd = parseReportDateStringToDate(bv);
                    if (ad && bd) { if (ad < bd) return -1; if (ad > bd) return 1; }
                    else if (ad) return -1; else if (bd) return 1;
                } else {
                    const cmp = customAlphabeticalSort(String(av), String(bv));
                    if (cmp !== 0) return cmp;
                }
            }
            return 0;
        });
    };

    useEffect(() => { if (!loading) applyFilters(); }, [filters, allReports, loading]);

    const loadAllReports = async () => {
        setLoading(true); setError(null);
        try {
            const res = await axiosInstance.get('/reports/operation-reports-v2');
            setAllReports(res.data || []);
        } catch {
            setError("Could not load operation reports. Please try again.");
            setReports([]); setAllReports([]);
        } finally { setLoading(false); }
    };

    const applyFilters = () => {
        if (!validateDates(filters.startDate, filters.endDate)) { setReports([]); return; }
        let filtered = allReports;
        if (filters.company !== "all") filtered = filtered.filter(r => r.COMPANY === filters.company);
        if (filters.airline !== "all") filtered = filtered.filter(r => r.AIRLINE?.toLowerCase() === filters.airline.toLowerCase());
        if (filters.station !== "all") filtered = filtered.filter(r => r.STATION?.toLowerCase() === filters.station.toLowerCase());
        if (filters.startDate) filtered = filtered.filter(r => {
            const d = parseReportDateStringToDate(r.DATE); return d && d >= new Date(filters.startDate);
        });
        if (filters.endDate) filtered = filtered.filter(r => {
            const d = parseReportDateStringToDate(r.DATE); return d && d <= new Date(filters.endDate);
        });
        setReports(sortReports(filtered));
    };

    const handleStartDateChange = (v: string) => setFilters(f => {
        const nf = { ...f, startDate: v }; if (f.endDate && v && new Date(v) > new Date(f.endDate)) nf.endDate = "";
        return nf;
    });
    const handleEndDateChange = (v: string) => setFilters(f => ({ ...f, endDate: v }));

    const exportToExcel = () => {
        const data = reports.length ? reports.map(getExportableReportRow) : [['No data available']];
        const ws = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Operations Report');
        XLSX.writeFile(wb, `operations_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToCSV = () => {
        const data = reports.length ? reports.map(getExportableReportRow) : [['No data available']];
        const csv = [EXPORT_HEADERS, ...data].map(row => row.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `operations_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(16);
            doc.text('Operations Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date())}`, 14, 25);
            const tableData = reports.length ? reports.map(getExportableReportRow) : [Array(EXPORT_HEADERS_PDF.length).fill('No data available')];
            autoTable(doc, {
                head: [EXPORT_HEADERS_PDF],
                body: tableData,
                startY: 35,
                styles: { fontSize: 5, cellPadding: 1, overflow: 'linebreak' },
                headStyles: { fillColor: [0, 33, 87], textColor: [255, 255, 255], fontStyle: 'bold' },
                margin: { top: 35, left: 10, right: 10 },
                theme: 'striped',
            });
            doc.save(`operations_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(20);
            doc.text('Operations Report', 14, 22);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date())}`, 14, 35);
            let y = 50;
            doc.setFontSize(10);
            if (!reports.length) doc.text('No data available', 14, y);
            else {
                doc.text('COMPANY | AIRLINE | DATE | STATION | FLIGTH', 14, y); y += 10;
                reports.slice(0, 15).forEach(r => {
                    const row = getExportableReportRow(r);
                    doc.text(`${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${row[5]}`, 14, y);
                    y += 8; if (y > 180) { doc.addPage(); y = 20; }
                });
            }
            doc.save(`operations_report_fallback_${new Date().toISOString().split('T')[0]}.pdf`);
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
                                        onChange={e => setFilters({ ...filters, company: e.target.value, airline: "all", station: "all" })}
                                    >
                                        <option value="all">All Companies</option>
                                        {companyOptions.map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
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
                                        onChange={e => setFilters({ ...filters, airline: e.target.value })}
                                        disabled={loading && airlineOptions.length === 0 && filters.company === "all" && allReports.length === 0}
                                    >
                                        <option value="all">All Airlines</option>
                                        {airlineOptions.map(a => (
                                            <option key={a} value={a}>{a}</option>
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
                                        onChange={e => setFilters({ ...filters, station: e.target.value })}
                                        disabled={loading && stationOptions.length === 0 && filters.company === "all" && allReports.length === 0}
                                    >
                                        <option value="all">All Stations</option>
                                        {stationOptions.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className={`w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border ${dateError ? 'border-red-500' : 'border-gray-700'} focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none`}
                                    value={filters.startDate}
                                    onChange={e => handleStartDateChange(e.target.value)}
                                />
                            </div>
                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className={`w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border ${dateError ? 'border-red-500' : 'border-gray-700'} focus:border-[#00B140] focus:ring-2 focus:ring-[#00B140] focus:outline-none`}
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
                                    {EXPORT_HEADERS.map(header => (
                                        <th key={header} className="px-3 py-4 text-left font-semibold border border-[#cccccc] text-xs whitespace-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {reports.length > 0 ? (
                                    reports.map((item, idx) => {
                                        const rowData = getExportableReportRow(item);
                                        return (
                                            <tr key={`${item.COMPANY || 'comp'}-${item.AIRLINE || 'air'}-${String(item.DATE)}-${item.FLIGTH || 'flt'}-${idx}`} className="bg-transparent hover:bg-[#1E2A45] transition-colors">
                                                {rowData.map((cell, i) => (
                                                    <td key={i} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap">{cell}</td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={EXPORT_HEADERS.length} className="px-3 py-4 border border-[#1e3462] text-white text-xs whitespace-nowrap text-center">
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