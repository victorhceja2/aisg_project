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

/**
 * Pantalla de reporte de servicios operativos con filtros y tabla de resultados.
 * Aplica diseño consistente con el resto del sistema.
 */
const OperationService: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "",
        airline: "",
        station: "GDL", // Valor por defecto
        startDate: "",
        endDate: "",
    });
    const [data, setData] = useState<OperationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [useStaticData, setUseStaticData] = useState(true); // Temporalmente usamos datos estáticos
    const [exportLoading, setExportLoading] = useState<string | null>(null);

    // Datos estáticos para usar mientras no haya conexión a la BD
    const staticData: OperationRow[] = [
        {
            company: "A&P",
            airline: "Alaska",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N251AK",
            fligth: "1419.142",
            ac_type: "737",
            start_time: "21:30",
            end_time: "23:35",
            on_gnd: "02:05",
            service: "Transit",
            work_reference: "",
            technician: "RAMIREZ A"
        },
        {
            company: "A&P",
            airline: "Alaska",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N251AK",
            fligth: "1419.142",
            ac_type: "737",
            start_time: "21:30",
            end_time: "23:35",
            on_gnd: "02:05",
            service: "EngOilServ",
            work_reference: "2020",
            technician: "RAMIREZ A"
        },
        {
            company: "A&P",
            airline: "American",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N959NN",
            fligth: "1212.0",
            ac_type: "737",
            start_time: "02:35",
            end_time: "03:35",
            on_gnd: "01:00",
            service: "RonIn",
            work_reference: "",
            technician: "RODRIGUEZ J"
        },
        {
            company: "A&P",
            airline: "American",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N959NN",
            fligth: "0.1213",
            ac_type: "737",
            start_time: "10:00",
            end_time: "11:00",
            on_gnd: "01:00",
            service: "RonOut",
            work_reference: "",
            technician: "VARGAS A"
        },
        {
            company: "A&P",
            airline: "American",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N935AN",
            fligth: "1174.1175",
            ac_type: "737",
            start_time: "16:20",
            end_time: "17:20",
            on_gnd: "01:00",
            service: "Transit",
            work_reference: "",
            technician: "RAMIREZ A"
        },
        {
            company: "A&P",
            airline: "American",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N753US",
            fligth: "387.288",
            ac_type: "A319",
            start_time: "21:00",
            end_time: "21:55",
            on_gnd: "00:55",
            service: "Transit",
            work_reference: "",
            technician: "RODRIGUEZ J"
        },
        {
            company: "A&P",
            airline: "Atlas Air",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N472MC",
            fligth: "8366.8267",
            ac_type: "747",
            start_time: "16:00",
            end_time: "18:05",
            on_gnd: "02:05",
            service: "Transit",
            work_reference: "",
            technician: "CALDERON M"
        },
        {
            company: "A&P",
            airline: "Atlas Air",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N472MC",
            fligth: "8366.8267",
            ac_type: "747",
            start_time: "16:30",
            end_time: "17:30",
            on_gnd: "01:00",
            service: "Transit",
            work_reference: "",
            technician: "RAMIREZ A"
        },
        {
            company: "A&P",
            airline: "Atlas Air",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N472MC",
            fligth: "8366.8267",
            ac_type: "747",
            start_time: "16:30",
            end_time: "17:30",
            on_gnd: "01:00",
            service: "Daily",
            work_reference: "",
            technician: "RAMIREZ A"
        },
        {
            company: "A&P",
            airline: "Cargojet Airways",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "C-FCAE",
            fligth: "920.921",
            ac_type: "767",
            start_time: "14:35",
            end_time: "15:35",
            on_gnd: "01:00",
            service: "Transit",
            work_reference: "",
            technician: "VARGAS A"
        },
        {
            company: "A&P",
            airline: "Cargojet Airways",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "C-FCAE",
            fligth: "920.921",
            ac_type: "767",
            start_time: "14:35",
            end_time: "15:35",
            on_gnd: "01:00",
            service: "Brake Cooling",
            work_reference: "3030",
            technician: "VARGAS A"
        },
        {
            company: "A&P",
            airline: "Cargojet Airways",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "C-FCAE",
            fligth: "919.92",
            ac_type: "767",
            start_time: "00:01",
            end_time: "01:31",
            on_gnd: "01:30",
            service: "Transit",
            work_reference: "",
            technician: "URIETA R"
        },
        {
            company: "A&P",
            airline: "Cargolux",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "LX-VCI",
            fligth: "5164.5165",
            ac_type: "747",
            start_time: "16:10",
            end_time: "18:00",
            on_gnd: "01:50",
            service: "Transit",
            work_reference: "",
            technician: "BENAVIDEZ J"
        },
        {
            company: "A&P",
            airline: "Cargolux",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "LX-VCI",
            fligth: "5164.5165",
            ac_type: "747",
            start_time: "16:10",
            end_time: "18:00",
            on_gnd: "01:50",
            service: "EngOilServ",
            work_reference: "FGD4354",
            technician: "BENAVIDEZ J"
        },
        {
            company: "A&P",
            airline: "Cargolux",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "LX-LCL",
            fligth: "6694.6695",
            ac_type: "747",
            start_time: "23:15",
            end_time: "01:10",
            on_gnd: "01:55",
            service: "Transit",
            work_reference: "",
            technician: "LOPEZ O"
        },
        {
            company: "A&P",
            airline: "Cathay Pacific",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "B-LJN",
            fligth: "87.88",
            ac_type: "747",
            start_time: "19:50",
            end_time: "21:35",
            on_gnd: "01:45",
            service: "Transit",
            work_reference: "",
            technician: "BENAVIDEZ J"
        },
        {
            company: "A&P",
            airline: "Cathay Pacific",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "B-LJN",
            fligth: "87.88",
            ac_type: "747",
            start_time: "19:50",
            end_time: "20:50",
            on_gnd: "01:00",
            service: "Transit",
            work_reference: "",
            technician: "MARTINEZ A"
        },
        {
            company: "A&P",
            airline: "Korean Air",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "HL8076",
            fligth: "278.279",
            ac_type: "777",
            start_time: "11:50",
            end_time: "13:45",
            on_gnd: "01:55",
            service: "Transit",
            work_reference: "",
            technician: "BENAVIDEZ J"
        },
        {
            company: "A&P",
            airline: "Lufthansa Cargo",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "D-ALFA",
            fligth: "8225.8226",
            ac_type: "777",
            start_time: "03:01",
            end_time: "05:40",
            on_gnd: "02:39",
            service: "Transit",
            work_reference: "",
            technician: "RAMIREZ L"
        },
        {
            company: "A&P",
            airline: "Mas Air",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "EI-MAE",
            fligth: "6845.6846",
            ac_type: "A330",
            start_time: "10:00",
            end_time: "11:40",
            on_gnd: "01:40",
            service: "Transit",
            work_reference: "",
            technician: "MARTINEZ A"
        },
        {
            company: "A&P",
            airline: "Mesa",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N86336",
            fligth: "1212.0",
            ac_type: "ERJ175",
            start_time: "03:25",
            end_time: "04:25",
            on_gnd: "01:00",
            service: "RonIn",
            work_reference: "",
            technician: "RODRIGUEZ J"
        },
        {
            company: "A&P",
            airline: "Mesa",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N86336",
            fligth: "1212.0",
            ac_type: "ERJ175",
            start_time: "03:25",
            end_time: "04:25",
            on_gnd: "01:00",
            service: "EngOilServ",
            work_reference: "ER453R",
            technician: "RODRIGUEZ J"
        },
        {
            company: "A&P",
            airline: "Mesa",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N86336",
            fligth: "0.1213",
            ac_type: "ERJ175",
            start_time: "11:40",
            end_time: "12:40",
            on_gnd: "01:00",
            service: "RonOut",
            work_reference: "",
            technician: "VARGAS A"
        },
        {
            company: "A&P",
            airline: "Skywest",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N516SY",
            fligth: "1212.0",
            ac_type: "ERJ175",
            start_time: "04:50",
            end_time: "05:50",
            on_gnd: "01:00",
            service: "RonIn",
            work_reference: "",
            technician: "RODRIGUEZ J"
        },
        {
            company: "A&P",
            airline: "Skywest",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N516SY",
            fligth: "0.1213",
            ac_type: "ERJ175",
            start_time: "11:45",
            end_time: "12:46",
            on_gnd: "01:01",
            service: "RonOut",
            work_reference: "",
            technician: "MARTINEZ A"
        },
        {
            company: "A&P",
            airline: "Skywest",
            date: "02-may-24",
            station: "GDL",
            ac_reg: "N508SY",
            fligth: "3253.3254",
            ac_type: "ERJ175",
            start_time: "18:40",
            end_time: "19:30",
            on_gnd: "00:50",
            service: "Transit",
            work_reference: "",
            technician: "RAMIREZ A"
        }
    ];

    // Función para exportar a CSV
    const exportToCSV = async () => {
        setExportLoading('csv');
        try {
            const headers = [
                'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight', 
                'A/C Type', 'Start Time', 'End Time', 'On GND', 'Service', 
                'Work Reference', 'Technician'
            ];
            
            const csvContent = [
                headers.join(','),
                ...data.map(row => [
                    `"${row.company}"`, `"${row.airline}"`, `"${row.date}"`, `"${row.station}"`,
                    `"${row.ac_reg}"`, `"${row.fligth}"`, `"${row.ac_type}"`, `"${row.start_time}"`,
                    `"${row.end_time}"`, `"${row.on_gnd}"`, `"${row.service}"`,
                    `"${row.work_reference}"`, `"${row.technician}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `operation_service_report_${new Date().toISOString().split('T')[0]}.csv`;
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
                'Company': row.company,
                'Airline': row.airline,
                'Date': row.date,
                'Station': row.station,
                'AC REG': row.ac_reg,
                'Flight': row.fligth,
                'A/C Type': row.ac_type,
                'Start Time': row.start_time,
                'End Time': row.end_time,
                'On GND': row.on_gnd,
                'Service': row.service,
                'Work Reference': row.work_reference,
                'Technician': row.technician
            })));

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Operation Service Report');
            
            // Ajustar anchos de columna
            const colWidths = [
                { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
                { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
                { wch: 20 }, { wch: 20 }, { wch: 15 }
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `operation_service_report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
            doc.text('Operation Service Report', 20, 20);
            
            // Fecha de generación
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
            
            // Configurar tabla
            const tableColumn = [
                'Company', 'Airline', 'Date', 'Station', 'AC REG', 'Flight',
                'A/C Type', 'Start', 'End', 'On GND', 'Service', 'Work Ref', 'Technician'
            ];
            
            const tableRows = data.map(row => [
                row.company, row.airline, row.date, row.station, row.ac_reg,
                row.fligth, row.ac_type, row.start_time, row.end_time,
                row.on_gnd, row.service, row.work_reference, row.technician
            ]);

            // Usar autoTable importado directamente
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: {
                    fontSize: 7,
                    cellPadding: 1,
                },
                headStyles: {
                    fillColor: [0, 32, 87], // Color azul del tema
                    textColor: 255,
                    fontSize: 8,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { cellWidth: 18 }, // Company
                    1: { cellWidth: 18 }, // Airline
                    2: { cellWidth: 15 }, // Date
                    3: { cellWidth: 12 }, // Station
                    4: { cellWidth: 18 }, // AC REG
                    5: { cellWidth: 18 }, // Flight
                    6: { cellWidth: 15 }, // A/C Type
                    7: { cellWidth: 15 }, // Start
                    8: { cellWidth: 15 }, // End
                    9: { cellWidth: 15 }, // On GND
                    10: { cellWidth: 20 }, // Service
                    11: { cellWidth: 20 }, // Work Ref
                    12: { cellWidth: 18 }, // Technician
                },
                margin: { top: 40, right: 20, bottom: 20, left: 20 },
            });

            doc.save(`operation_service_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        } finally {
            setExportLoading(null);
        }
    };

    // Filtrar los datos según los criterios de búsqueda
    const filteredData = (): OperationRow[] => {
        return staticData.filter(item => {
            return (
                (filters.company === "" || item.company.toLowerCase().includes(filters.company.toLowerCase())) &&
                (filters.airline === "" || filters.airline.toLowerCase() === "all" || item.airline.toLowerCase().includes(filters.airline.toLowerCase())) &&
                (filters.station === "" || item.station.toLowerCase().includes(filters.station.toLowerCase())) &&
                (filters.startDate === "" || new Date(convertDateFormat(item.date)) >= new Date(filters.startDate)) &&
                (filters.endDate === "" || new Date(convertDateFormat(item.date)) <= new Date(filters.endDate))
            );
        });
    };

    // Convertir formato de fecha dd-mmm-yy a yyyy-mm-dd para comparaciones
    const convertDateFormat = (dateString: string): string => {
        const months: { [key: string]: string } = {
            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
            'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString; // en caso de formato inválido
        
        const day = parts[0].padStart(2, '0');
        const month = months[parts[1].toLowerCase()];
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        
        return `${year}-${month}-${day}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (useStaticData) {
                setData(filteredData());
            } else {
                const params = {
                    company: filters.company,
                    airline: filters.airline !== "All" ? filters.airline : "",
                    station: filters.station,
                    start_date: filters.startDate,
                    end_date: filters.endDate,
                };
                const res = await axiosInstance.get(`/operations/report`, { params });
                setData(res.data);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            if (useStaticData) {
                setData(filteredData());
            } else {
                setData([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <AISGBackground>
            <div className="min-h-screen py-8 px-4 font-['Montserrat'] text-white">
                <div className="max-w-7xl mx-auto">
                    {/* Cabecera principal con título y descripción */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Operations Service Report</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">
                            Search and analyze operational services
                        </p>
                    </div>

                    {/* Filtros de búsqueda */}
                    <form onSubmit={handleSearch} className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Company"
                                    value={filters.company}
                                    onChange={e => setFilters({ ...filters, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Airline</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Airline (or All)"
                                    value={filters.airline}
                                    onChange={e => setFilters({ ...filters, airline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Station"
                                    value={filters.station}
                                    onChange={e => setFilters({ ...filters, station: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    value={filters.startDate}
                                    onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    value={filters.endDate}
                                    onChange={e => setFilters({ ...filters, endDate: e.target.value })}
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
                            
                            {/* Botón de búsqueda */}
                            <button
                                type="submit"
                                className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Search"}
                            </button>
                        </div>
                    </form>

                    {/* Información de resultados */}
                    {data.length > 0 && (
                        <div className="mb-4 text-white">
                            <p className="text-sm">
                                Showing {data.length} record{data.length !== 1 ? 's' : ''}
                            </p>
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
                                {data.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={13} className="text-center py-8 text-gray-400">
                                            No data found.
                                        </td>
                                    </tr>
                                )}
                                {data.map((row, idx) => (
                                    <tr key={idx} className="border-b border-[#233554] hover:bg-[#233554] transition-colors">
                                        <td className="p-2">{row.company}</td>
                                        <td className="p-2">{row.airline}</td>
                                        <td className="p-2">{row.date}</td>
                                        <td className="p-2">{row.station}</td>
                                        <td className="p-2">{row.ac_reg}</td>
                                        <td className="p-2">{row.fligth}</td>
                                        <td className="p-2">{row.ac_type}</td>
                                        <td className="p-2">{row.start_time}</td>
                                        <td className="p-2">{row.end_time}</td>
                                        <td className="p-2">{row.on_gnd}</td>
                                        <td className="p-2">{row.service}</td>
                                        <td className="p-2">{row.work_reference}</td>
                                        <td className="p-2">{row.technician}</td>
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