import React, { useEffect, useState } from "react";
import axiosInstance from '../../api/axiosInstance';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import AISGBackground from "../catalogs/fondo";

interface ServiceExecutionRow {
    id: number;
    id_service: number;
    id_client: number;
    id_company: number;
    fuselage_type: string;
    id_avion: number;
    id_user: number;
    work_order: string;
    whonew: string;
    create_at: string;
    updated_at: string;
    service_name?: string;
    client_name?: string;
    company_name?: string;
    aircraft_model?: string;
}

/**
 * Pantalla de reporte de ejecuciones de servicios con filtros y tabla de resultados.
 * Aplica diseño consistente con el resto del sistema.
 */
const OperationService: React.FC = () => {
    const [filters, setFilters] = useState({
        id_service: "",
        id_client: "",
        id_company: "",
        fuselage_type: "",
        work_order: "",
    });
    const [data, setData] = useState<ServiceExecutionRow[]>([]);
    const [allData, setAllData] = useState<ServiceExecutionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);

    // Función para exportar a CSV
    const exportToCSV = async () => {
        setExportLoading('csv');
        try {
            const headers = [
                'ID', 'Service ID', 'Client ID', 'Company ID', 'Fuselage Type', 
                'Aircraft ID', 'User ID', 'Work Order', 'Created By'
            ];
            
            const csvContent = [
                headers.join(','),
                ...data.map(row => [
                    `"${row.id}"`, `"${row.id_service}"`, `"${row.id_client}"`, `"${row.id_company}"`,
                    `"${row.fuselage_type}"`, `"${row.id_avion}"`, `"${row.id_user}"`, `"${row.work_order}"`,
                    `"${row.whonew}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `service_executions_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error('Error exporting CSV:', error);
        } finally {
            setExportLoading(null);
        }
    };

    // Función para exportar a Excel
    const exportToExcel = async () => {
        setExportLoading('excel');
        try {
            const ws = XLSX.utils.json_to_sheet(data.map(row => ({
                'ID': row.id,
                'Service ID': row.id_service,
                'Client ID': row.id_client,
                'Company ID': row.id_company,
                'Fuselage Type': row.fuselage_type,
                'Aircraft ID': row.id_avion,
                'User ID': row.id_user,
                'Work Order': row.work_order,
                'Created By': row.whonew
            })));

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Service Executions Report');
            
            // Ajustar anchos de columna
            const colWidths = [
                { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
                { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 }
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `service_executions_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error exporting Excel:', error);
        } finally {
            setExportLoading(null);
        }
    };

    // Función para exportar a PDF
    const exportToPDF = async () => {
        setExportLoading('pdf');
        try {
            const doc = new jsPDF('l', 'mm', 'a4'); // Paisaje para mejor ajuste
            
            // Título
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Service Executions Report', 20, 20);
            
            // Fecha de generación
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
            
            // Configurar tabla
            const tableColumn = [
                'ID', 'Service ID', 'Client ID', 'Company ID', 'Fuselage Type',
                'Aircraft ID', 'User ID', 'Work Order', 'Created By'
            ];
            
            const tableRows = data.map(row => [
                row.id, row.id_service, row.id_client, row.id_company, row.fuselage_type,
                row.id_avion, row.id_user, row.work_order, row.whonew
            ]);

            // Usar autoTable importado directamente
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [0, 32, 87], // Color azul del tema
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { cellWidth: 20 }, // ID
                    1: { cellWidth: 25 }, // Service ID
                    2: { cellWidth: 25 }, // Client ID
                    3: { cellWidth: 25 }, // Company ID
                    4: { cellWidth: 30 }, // Fuselage Type
                    5: { cellWidth: 25 }, // Aircraft ID
                    6: { cellWidth: 20 }, // User ID
                    7: { cellWidth: 40 }, // Work Order
                    8: { cellWidth: 25 }, // Created By
                },
                margin: { top: 40, right: 20, bottom: 20, left: 20 },
            });

            doc.save(`service_executions_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        } finally {
            setExportLoading(null);
        }
    };

    // Filtrar los datos localmente
    const filteredData = (): ServiceExecutionRow[] => {
        return allData.filter(item => {
            return (
                (filters.id_service === "" || item.id_service.toString().includes(filters.id_service)) &&
                (filters.id_client === "" || item.id_client.toString().includes(filters.id_client)) &&
                (filters.id_company === "" || item.id_company.toString().includes(filters.id_company)) &&
                (filters.fuselage_type === "" || item.fuselage_type.toLowerCase().includes(filters.fuselage_type.toLowerCase())) &&
                (filters.work_order === "" || item.work_order.toLowerCase().includes(filters.work_order.toLowerCase()))
            );
        });
    };

    // Obtener datos paginados
    const getPaginatedData = () => {
        const filtered = filteredData();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener datos con el límite máximo permitido por el backend
            const response = await axiosInstance.get('/reports/service-executions', {
                params: { skip: 0, limit: 1000 }
            });
            setAllData(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching service executions:", error);
            setAllData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Actualizar datos mostrados cuando cambian los filtros o la página
    useEffect(() => {
        setData(getPaginatedData());
        // eslint-disable-next-line
    }, [allData, filters, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            id_service: "",
            id_client: "",
            id_company: "",
            fuselage_type: "",
            work_order: "",
        });
        setCurrentPage(1);
    };

    // Cálculos de paginación
    const filteredCount = filteredData().length;
    const totalPages = Math.ceil(filteredCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredCount);

    return (
        <AISGBackground>
            <div className="min-h-screen py-8 px-4 font-['Montserrat'] text-white">
                <div className="max-w-7xl mx-auto">
                    {/* Cabecera principal con título y descripción */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Service Executions Report</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">
                            Search and analyze service executions
                        </p>
                    </div>

                    {/* Filtros de búsqueda */}
                    <form onSubmit={handleSearch} className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        {/* Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Service ID</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Service ID"
                                    value={filters.id_service}
                                    onChange={e => setFilters({ ...filters, id_service: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Client ID</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Client ID"
                                    value={filters.id_client}
                                    onChange={e => setFilters({ ...filters, id_client: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Company ID</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Company ID"
                                    value={filters.id_company}
                                    onChange={e => setFilters({ ...filters, id_company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Fuselage Type</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Fuselage Type"
                                    value={filters.fuselage_type}
                                    onChange={e => setFilters({ ...filters, fuselage_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Work Order</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Work Order"
                                    value={filters.work_order}
                                    onChange={e => setFilters({ ...filters, work_order: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            {/* Botones de exportación */}
                            <div className="flex space-x-2">
                                <button 
                                    type="button"
                                    className="bg-[#e6001f] hover:bg-[#c50017] text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
                                    onClick={exportToCSV}
                                    disabled={data.length === 0 || exportLoading === 'csv'}
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
                                    disabled={data.length === 0 || exportLoading === 'excel'}
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
                                    disabled={data.length === 0 || exportLoading === 'pdf'}
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
                            
                            {/* Botones de acción */}
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
                                    onClick={fetchData}
                                    className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Refresh"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Información de resultados y paginación */}
                    {(data.length > 0 || filteredCount > 0) && (
                        <div className="mb-4 flex justify-between items-center text-white">
                            <p className="text-sm">
                                Showing {startIndex}-{endIndex} of {filteredCount} records
                                {filteredCount < allData.length && ` (filtered from ${allData.length} total)`}
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

                    {/* Tabla de resultados */}
                    <div className="rounded-lg shadow-lg overflow-x-auto bg-[#1E2A45]">
                        <table className="min-w-full table-auto text-xs">
                            <thead>
                                <tr className="bg-white text-[#002057]">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Service ID</th>
                                    <th className="p-2">Client ID</th>
                                    <th className="p-2">Company ID</th>
                                    <th className="p-2">Fuselage Type</th>
                                    <th className="p-2">Aircraft ID</th>
                                    <th className="p-2">User ID</th>
                                    <th className="p-2">Work Order</th>
                                    <th className="p-2">Created By</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {data.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-gray-400">
                                            {allData.length === 0 ? "No data found." : "No records match the current filters."}
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-gray-400">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-2"></div>
                                                Loading data...
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {data.map((row) => (
                                    <tr key={row.id} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                        <td className="p-2">{row.id}</td>
                                        <td className="p-2">{row.id_service}</td>
                                        <td className="p-2">{row.id_client}</td>
                                        <td className="p-2">{row.id_company}</td>
                                        <td className="p-2">{row.fuselage_type}</td>
                                        <td className="p-2">{row.id_avion}</td>
                                        <td className="p-2">{row.id_user}</td>
                                        <td className="p-2">{row.work_order}</td>
                                        <td className="p-2">{row.whonew}</td>
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