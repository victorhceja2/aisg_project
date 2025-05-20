import React, { useState, useEffect } from "react";
import AISGBackground from "./fondo";
import axiosInstance from '../../api/axiosInstance';


// Definir la interfaz para los reportes de operación
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

/**
 * Pantalla de reporte de operaciones con filtros y tabla de resultados.
 * Aplica diseño consistente con el resto del sistema.
 */
const OperationReport: React.FC = () => {
    const [filters, setFilters] = useState({
        company: "",
        airline: "",
        station: "GDL", // Valor por defecto
        startDate: "",
        endDate: "",
    });
    
    const [reports, setReports] = useState<OperationReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useStaticData, setUseStaticData] = useState(true); // Temporalmente usamos datos estáticos
    // apiURL ya no es necesario, usando axiosInstance

    // Datos estáticos para usar mientras no haya conexión a la BD
    const staticData: OperationReportData[] = [
        {
            company: "A&P",
            airline: "Alaska",
            date: "02-may-24",
            station: "GDL",
            acReg: "N251AK",
            flight: "1419.142",
            dest: "LAX",
            logBook: "60903583",
            acType: "737",
            startTime: "21:30",
            endTime: "23:35",
            servPr: "TRANSIT CHECK",
            onGnd: "02:05",
            serv1: "Transit",
            serv2: "EngOilServ",
            serv3: "",
            serv4: "",
            serv5: "",
            serv6: "",
            remarks: "TRANSIT CHECK / FUELING ASSISTANCE / DEPARTURE SUPERVISION / OIL ADDED 0/0",
            technician: "RAMIREZ A"
        },
        {
            company: "A&P",
            airline: "American",
            date: "02-may-24",
            station: "GDL",
            acReg: "N959NN",
            flight: "1212.0",
            dest: "RON",
            logBook: "0",
            acType: "737",
            startTime: "02:35",
            endTime: "03:35",
            servPr: "RON IN",
            onGnd: "01:00",
            serv1: "RonIn",
            serv2: "",
            serv3: "",
            serv4: "",
            serv5: "",
            serv6: "",
            remarks: "RON IN / BATT SW OFF / CLOSED AIRCRAFT DOOR / OIL ADDED 0/0",
        },
        {
            company: "A&P",
            airline: "American",
            date: "02-may-24",
            station: "GDL",
            acReg: "N959NN",
            flight: "0.1213",
            dest: "DFW",
            logBook: "0",
            acType: "737",
            startTime: "10:00",
            endTime: "11:00",
            servPr: "RON OUT",
            onGnd: "01:00",
            serv1: "RonOut",
            serv2: "",
            serv3: "",
            serv4: "",
            serv5: "",
            serv6: "",
            remarks: "RON OUT / FUELING SUPERVISION / DEPARTURE SUPERVISION / OIL ADDED 0/0.",
        },
        {
            company: "A&P",
            airline: "Cargolux",
            date: "02-may-24",
            station: "GDL",
            acReg: "LX-VCI",
            flight: "5164.5165",
            dest: "LAX",
            logBook: "CV1219981",
            acType: "747",
            startTime: "16:10",
            endTime: "18:00",
            servPr: "TRANSIT CHECK",
            onGnd: "01:50",
            serv1: "Transit",
            serv2: "EngOilServ",
            serv3: "",
            serv4: "",
            serv5: "",
            serv6: "",
            remarks: "TRANSIT CHECK / PIREP 1, STS \"BODY GEAR SYS\" / PERFORMED PROCEDURE IAW IFIM TASK 32-53-00-810-805, STS MSG CLEARED, INTERMITTENT FAULT / PIREP 2, STATUS \"TRIM AIR PRSOV L\" / PERFORMED PROCEDURE IAW IFIM TASK 21-61-00-810-850, STS MSG CLEARED / FUELING ASSISTANCE / HEADSET DISPATCH / OIL ADDED 0/0/0/0",
        },
        // Agrego más datos del ejemplo proporcionado
        {
            company: "A&P",
            airline: "Cathay Pacific",
            date: "02-may-24",
            station: "GDL",
            acReg: "B-LJN",
            flight: "87.88",
            dest: "ANC",
            logBook: "TL2323",
            acType: "747",
            startTime: "19:50",
            endTime: "21:35",
            servPr: "TRANSIT CHECK",
            onGnd: "01:45",
            serv1: "Transit",
            serv2: "",
            serv3: "",
            serv4: "",
            serv5: "",
            serv6: "",
            remarks: "PREPARE DOCUMENTS FOR FLIGHT / DURING CRUISE STATUS MSG \"FLAP LEFI R2\" / PERFORMED PROCEDURE IAW IFIM TASK 27-89-00-810-806, NO DAMAGE NOTED, STS MSG CLEARED / TRANSIT CHECK / FUELING ASSISTANCE / HEADSET DISPATCH / OIL ADDED 0/0/0/0",
        },
        {
            company: "A&P",
            airline: "Skywest",
            date: "02-may-24",
            station: "GDL",
            acReg: "N508SY",
            flight: "3253.3254",
            dest: "PHX",
            logBook: "0",
            acType: "ERJ175",
            startTime: "18:40",
            endTime: "19:30",
            servPr: "TRANSIT CHECK",
            onGnd: "00:50",
            serv1: "Transit",
            serv2: "",
            serv3: "",
            serv4: "",
            serv5: "",
            serv6: "",
            remarks: "TRANSIT CHECK / FUELING ASSISTANCE / DEPARTURE SUPERVISION / OIL ADDED 0/0",
        },
    ];

    // Filtrar los datos según los criterios de búsqueda
    const filteredData = (): OperationReportData[] => {
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

    // Función para buscar datos desde la API
    const searchReports = async () => {
        if (useStaticData) {
            setReports(filteredData());
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Construir los parámetros de consulta
            const params = new URLSearchParams();
            if (filters.company) params.append('company', filters.company);
            if (filters.airline && filters.airline !== 'All') params.append('airline', filters.airline);
            if (filters.station) params.append('station', filters.station);
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            
            const response = await axiosInstance.get(`/api/operation-reports?${params}`);
            setReports(response.data);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("Could not load operation reports. Please try again.");
            // Si falla la API, usar datos estáticos por ahora
            setReports(filteredData());
        } finally {
            setLoading(false);
        }
    };
    
    // Cargar datos iniciales cuando se monta el componente
    useEffect(() => {
        if (useStaticData) {
            setReports(filteredData());
        } else {
            searchReports();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                    <div className="flex justify-end">
                        <button 
                            className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                            onClick={() => useStaticData ? setReports(filteredData()) : searchReports()}
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
                                        No operation reports found matching these criteria.
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