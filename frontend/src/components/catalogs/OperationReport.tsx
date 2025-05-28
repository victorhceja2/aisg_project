import React, { useState, useEffect } from "react";
import AISGBackground from "./fondo";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the interface for operation reports based on the backend
interface OperationReportData {
    id: number;
    cliente: string;
    fuselage_type: string;
    servicio_principal: string;
    fecha: string;
    work_order: string;
    tecnico_asignado: string;
}

/**
 * Operation reports screen with filters and results table.
 * Applies consistent design with the rest of the system.
 */
const OperationReport: React.FC = () => {
    const [filters, setFilters] = useState({
        cliente: "",
        fuselage_type: "",
        servicio_principal: "",
        work_order: "",
        tecnico_asignado: "",
        fecha_inicio: "",
        fecha_fin: "",
    });
    
    const [reports, setReports] = useState<OperationReportData[]>([]);
    const [allReports, setAllReports] = useState<OperationReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exportLoading, setExportLoading] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);

    // Function to export to CSV
    const exportToCSV = async () => {
        setExportLoading('csv');
        try {
            const headers = [
                'ID', 'Customer', 'Fuselage Type', 'Main Service', 'Date', 'Work Order', 'Assigned Technician'
            ];
            
            const csvContent = [
                headers.join(','),
                ...reports.map(row => [
                    `"${row.id}"`,
                    `"${row.cliente}"`,
                    `"${row.fuselage_type}"`,
                    `"${row.servicio_principal}"`,
                    `"${row.fecha}"`,
                    `"${row.work_order || ''}"`,
                    `"${row.tecnico_asignado || ''}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `operation_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error('Error exporting CSV:', error);
            setError('Error exporting to CSV');
        } finally {
            setExportLoading(null);
        }
    };

    // Function to export to Excel
    const exportToExcel = async () => {
        setExportLoading('excel');
        try {
            const ws = XLSX.utils.json_to_sheet(reports.map(row => ({
                'ID': row.id,
                'Customer': row.cliente,
                'Fuselage Type': row.fuselage_type,
                'Main Service': row.servicio_principal,
                'Date': row.fecha,
                'Work Order': row.work_order || '',
                'Assigned Technician': row.tecnico_asignado || ''
            })));

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Operation Report');
            
            // Adjust column widths
            const colWidths = [
                { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, 
                { wch: 15 }, { wch: 20 }, { wch: 20 }
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `operation_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            setError('Error exporting to Excel');
        } finally {
            setExportLoading(null);
        }
    };

    // Function to export to PDF
    const exportToPDF = async () => {
        setExportLoading('pdf');
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Operation Report', 20, 20);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
            
            const tableColumn = [
                'ID', 'Customer', 'Fuselage Type', 'Main Service', 'Date', 'Work Order', 'Technician'
            ];
            
            const tableRows = reports.map(row => [
                row.id,
                row.cliente,
                row.fuselage_type,
                row.servicio_principal,
                new Date(row.fecha).toLocaleDateString(),
                row.work_order || '',
                row.tecnico_asignado || ''
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [0, 32, 87],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 45 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 35 },
                    6: { cellWidth: 35 },
                },
                margin: { top: 40, right: 20, bottom: 20, left: 20 },
            });

            doc.save(`operation_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            setError('Error exporting to PDF');
        } finally {
            setExportLoading(null);
        }
    };

    // Filter data locally
    const filteredData = (): OperationReportData[] => {
        return allReports.filter(item => {
            const itemDate = new Date(item.fecha);
            const startDate = filters.fecha_inicio ? new Date(filters.fecha_inicio) : null;
            const endDate = filters.fecha_fin ? new Date(filters.fecha_fin) : null;

            return (
                (filters.cliente === "" || item.cliente.toLowerCase().includes(filters.cliente.toLowerCase())) &&
                (filters.fuselage_type === "" || item.fuselage_type.toLowerCase().includes(filters.fuselage_type.toLowerCase())) &&
                (filters.servicio_principal === "" || item.servicio_principal.toLowerCase().includes(filters.servicio_principal.toLowerCase())) &&
                (filters.work_order === "" || (item.work_order && item.work_order.toLowerCase().includes(filters.work_order.toLowerCase()))) &&
                (filters.tecnico_asignado === "" || (item.tecnico_asignado && item.tecnico_asignado.toLowerCase().includes(filters.tecnico_asignado.toLowerCase()))) &&
                (!startDate || itemDate >= startDate) &&
                (!endDate || itemDate <= endDate)
            );
        });
    };

    // Get paginated data
    const getPaginatedData = () => {
        const filtered = filteredData();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    // Function to fetch data from backend
    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use the correct backend endpoint
            const response = await axiosInstance.get('/reports/operation-reports');
            console.log('Data received:', response.data);
            setAllReports(response.data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching operation reports:", err);
            setError("Could not load operation reports. Please try again.");
            setAllReports([]);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchReports();
    }, []);

    // Update displayed data when filters or page changes
    useEffect(() => {
        setReports(getPaginatedData());
        // eslint-disable-next-line
    }, [allReports, filters, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            cliente: "",
            fuselage_type: "",
            servicio_principal: "",
            work_order: "",
            tecnico_asignado: "",
            fecha_inicio: "",
            fecha_fin: "",
        });
        setCurrentPage(1);
    };

    // Pagination calculations
    const filteredCount = filteredData().length;
    const totalPages = Math.ceil(filteredCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredCount);

    return (
        <AISGBackground>
            <div className="min-h-screen py-8 px-4 font-['Montserrat'] text-white">
                <div className="max-w-7xl mx-auto">
                    {/* Main header with title and description */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Operation Report</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">
                            Search and analysis of operational data
                        </p>
                    </div>
                    
                    {/* Error messages */}
                    {error && (
                        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}
                    
                    {/* Search filters */}
                    <form onSubmit={handleSearch} className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Search by customer"
                                    value={filters.cliente}
                                    onChange={e => setFilters({ ...filters, cliente: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Fuselage Type</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Fuselage type"
                                    value={filters.fuselage_type}
                                    onChange={e => setFilters({ ...filters, fuselage_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Main Service</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Main service"
                                    value={filters.servicio_principal}
                                    onChange={e => setFilters({ ...filters, servicio_principal: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Work Order</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Work order"
                                    value={filters.work_order}
                                    onChange={e => setFilters({ ...filters, work_order: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Assigned Technician</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Assigned technician"
                                    value={filters.tecnico_asignado}
                                    onChange={e => setFilters({ ...filters, tecnico_asignado: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    value={filters.fecha_inicio}
                                    onChange={e => setFilters({ ...filters, fecha_inicio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    value={filters.fecha_fin}
                                    onChange={e => setFilters({ ...filters, fecha_fin: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            {/* Export buttons */}
                            <div className="flex space-x-2">
                                <button 
                                    type="button"
                                    className="bg-[#e6001f] hover:bg-[#c50017] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
                                    onClick={exportToCSV}
                                    disabled={reports.length === 0 || exportLoading === 'csv'}
                                >
                                    {exportLoading === 'csv' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    CSV
                                </button>
                                <button 
                                    type="button"
                                    className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
                                    onClick={exportToExcel}
                                    disabled={reports.length === 0 || exportLoading === 'excel'}
                                >
                                    {exportLoading === 'excel' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    Excel
                                </button>
                                <button 
                                    type="button"
                                    className="bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
                                    onClick={exportToPDF}
                                    disabled={reports.length === 0 || exportLoading === 'pdf'}
                                >
                                    {exportLoading === 'pdf' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                    PDF
                                </button>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="bg-[#6B7280] hover:bg-[#4B5563] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200"
                                >
                                    Clear Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchReports}
                                    className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
                        </div>
                    )}
                    
                    {/* Results information and pagination */}
                    {(reports.length > 0 || filteredCount > 0) && (
                        <div className="mb-4 flex justify-between items-center text-white">
                            <p className="text-sm">
                                Showing {startIndex}-{endIndex} of {filteredCount} records
                                {filteredCount < allReports.length && ` (filtered from ${allReports.length} total)`}
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="bg-[#16213E] hover:bg-[#1E2A45] text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="bg-[#16213E] text-white px-3 py-1 rounded-md">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="bg-[#16213E] hover:bg-[#1E2A45] text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Results table */}
                    <div className="rounded-lg shadow-lg overflow-x-auto bg-[#1E2A45]">
                        <table className="min-w-full table-auto text-xs">
                            <thead>
                                <tr className="bg-white text-[#002057]">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Fuselage Type</th>
                                    <th className="p-3">Main Service</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Work Order</th>
                                    <th className="p-3">Assigned Technician</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {reports.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-400">
                                            {allReports.length === 0 ? "No data found." : "No records match the current filters."}
                                        </td>
                                    </tr>
                                )}
                                {reports.map((item) => (
                                    <tr key={item.id} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                        <td className="p-3">{item.id}</td>
                                        <td className="p-3">{item.cliente}</td>
                                        <td className="p-3">{item.fuselage_type}</td>
                                        <td className="p-3">{item.servicio_principal}</td>
                                        <td className="p-3">{new Date(item.fecha).toLocaleDateString()}</td>
                                        <td className="p-3">{item.work_order || '-'}</td>
                                        <td className="p-3">{item.tecnico_asignado || '-'}</td>
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

export default OperationReport;