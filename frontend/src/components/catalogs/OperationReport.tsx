// ...existing code...
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
    const [error, setError] = useState<string | null>(null);

    // ...existing export functions...

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
        setError(null);
        try {
            // Usar el endpoint correcto para obtener ejecuciones de servicio
            const response = await axiosInstance.get('/reports/service-executions');
            setAllData(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching service executions:", error);
            setError("No se pudieron cargar las ejecuciones de servicio. Intente nuevamente.");
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
                        <h1 className="text-3xl font-bold text-white">Reporte de Ejecuciones de Servicio</h1>
                        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
                        <p className="text-gray-200 mt-2 font-light">
                            Buscar y analizar ejecuciones de servicios
                        </p>
                    </div>

                    {/* Mensajes de error */}
                    {error && (
                        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {/* Filtros de búsqueda */}
                    <form onSubmit={handleSearch} className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6">
                        {/* Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">ID Servicio</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="ID Servicio"
                                    value={filters.id_service}
                                    onChange={e => setFilters({ ...filters, id_service: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">ID Cliente</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="ID Cliente"
                                    value={filters.id_client}
                                    onChange={e => setFilters({ ...filters, id_client: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">ID Compañía</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="ID Compañía"
                                    value={filters.id_company}
                                    onChange={e => setFilters({ ...filters, id_company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Fuselaje</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Tipo de Fuselaje"
                                    value={filters.fuselage_type}
                                    onChange={e => setFilters({ ...filters, fuselage_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Orden de Trabajo</label>
                                <input
                                    className="w-full bg-[#1E2A45] text-white px-3 py-2 rounded-md border border-gray-700"
                                    placeholder="Orden de Trabajo"
                                    value={filters.work_order}
                                    onChange={e => setFilters({ ...filters, work_order: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            {/* Botones de exportación - mantener los existentes */}
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
                                    Limpiar Filtros
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchData}
                                    className="bg-[#00B140] hover:bg-[#009935] text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? "Cargando..." : "Actualizar"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Información de resultados y paginación */}
                    {(data.length > 0 || filteredCount > 0) && (
                        <div className="mb-4 flex justify-between items-center text-white">
                            <p className="text-sm">
                                Mostrando {startIndex}-{endIndex} de {filteredCount} registros
                                {filteredCount < allData.length && ` (filtrados de ${allData.length} totales)`}
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="bg-[#16213E] hover:bg-[#1E2A45] text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <span className="bg-[#16213E] text-white px-3 py-1 rounded-md">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="bg-[#16213E] hover:bg-[#1E2A45] text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
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
                                    <th className="p-2">ID Servicio</th>
                                    <th className="p-2">ID Cliente</th>
                                    <th className="p-2">ID Compañía</th>
                                    <th className="p-2">Tipo de Fuselaje</th>
                                    <th className="p-2">ID Avión</th>
                                    <th className="p-2">ID Usuario</th>
                                    <th className="p-2">Orden de Trabajo</th>
                                    <th className="p-2">Creado Por</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {data.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-gray-400">
                                            {allData.length === 0 ? "No se encontraron datos." : "No hay registros que coincidan con los filtros actuales."}
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-gray-400">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-2"></div>
                                                Cargando datos...
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