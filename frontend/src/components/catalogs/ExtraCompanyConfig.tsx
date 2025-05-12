// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// // Definición de la URL base para la API
// const API_BASE_URL = "http://82.165.213.124:8000";

// interface ExtraCompanyConfig {
//   id_xtra_company: number;
//   id_company: number;
//   applies_detail: boolean;
//   status: boolean;
// }

// const ExtraCompanyConfiguration: React.FC = () => {
//   // Colores AISG según el manual de identidad corporativa
//   const colors = {
//     aisgBlue: "#0033A0",
//     aisgGreen: "#00B140",
//     aisgLightBlue: "#4D70B8",
//     aisgLightGreen: "#4DC970",
//     darkBg: "#1A1A2E",
//     darkBgSecondary: "#16213E",
//     darkBgTertiary: "#0D1B2A",
//     darkBgPanel: "#1E2A45",
//   };

//   const navigate = useNavigate();
//   const [configs, setConfigs] = useState<ExtraCompanyConfig[]>([]);
//   const [search, setSearch] = useState("");
//   const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

//   const fetchConfigs = async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/catalog/extra-company-configuration${search ? `?id_company=${encodeURIComponent(search)}` : ""}`
//       );
//       setConfigs(res.data);
//     } catch (err) {
//       console.error("Error al obtener configuraciones", err);
//     }
//   };

//   // BORRAR
//   const handleDeleteConfirm = (id: number) => {
//     setDeleteConfirm(id);
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await axios.delete(`${API_BASE_URL}/catalog/extra-company-configuration/${id}`);
//       fetchConfigs();
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.error("Error al eliminar configuración", err);
//     }
//   };

//   const handleCancelDelete = () => {
//     setDeleteConfirm(null);
//   };

//   useEffect(() => {
//     fetchConfigs();
//   }, [search]);

//   // Navegar a la página de edición
//   const handleEdit = (id: number) => {
//     navigate(`/catalogs/company/edit/${id}`);
//   };

//   // Navegar a la página de creación
//   const handleAdd = () => {
//     navigate("/catalogs/company/add");
//   };

//   return (
//     <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
//       <div className="max-w-6xl mx-auto">
//         {/* Cabecera */}
//         <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
//           <h1 className="text-2xl font-bold text-center text-white">
//             Configuración Extra por Compañía
//           </h1>
//           <p className="text-gray-200 mt-2 font-light text-center">
//             Administra parámetros adicionales por compañía
//           </p>
//         </div>

//         {/* Barra de acciones */}
//         <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6 flex flex-wrap justify-between items-center gap-4">
//           {/* Búsqueda */}
//           <div className="flex-grow max-w-md">
//             <label className="block text-sm font-medium text-gray-300 mb-2">Buscar por ID de Compañía</label>
//             <input
//               type="number"
//               className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
//               placeholder="Buscar por ID de Compañía..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
          
//           {/* Botón Agregar */}
//           <div>
//             <button
//               onClick={handleAdd}
//               className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
//             >
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
//               </svg>
//               Agregar Configuración
//             </button>
//           </div>
//         </div>

//         {/* Confirmación de Eliminación */}
//         {deleteConfirm && (
//           <div className="bg-[#16213E] p-6 rounded-lg shadow-lg mb-6 border-2 border-red-500">
//             <h2 className="text-xl font-semibold mb-4 text-white">Confirmar Eliminación</h2>
//             <p className="text-gray-300 mb-4">
//               ¿Estás seguro de que deseas eliminar la configuración #{deleteConfirm}? Esta acción no se puede deshacer.
//             </p>
//             <div className="flex justify-end gap-2">
//               <button
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
//                 onClick={handleCancelDelete}
//               >
//                 Cancelar
//               </button>
//               <button
//                 className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
//                 onClick={() => handleDelete(deleteConfirm)}
//               >
//                 Eliminar
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Tabla */}
//         <div className="bg-[#16213E] rounded-lg shadow-lg overflow-hidden">
//           <table className="w-full table-auto">
//             <thead>
//               <tr className="bg-[#0D1B2A]">
//                 <th className="p-3 text-left font-semibold">ID</th>
//                 <th className="p-3 text-left font-semibold">Compañía</th>
//                 <th className="p-3 text-left font-semibold">Detalle</th>
//                 <th className="p-3 text-left font-semibold">Estatus</th>
//                 <th className="p-3 text-center font-semibold">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {configs.length > 0 ? (
//                 configs.map((c) => (
//                   <tr key={c.id_xtra_company} className="border-t border-[#0D1B2A] hover:bg-[#1E2A45]">
//                     <td className="p-3">{c.id_xtra_company}</td>
//                     <td className="p-3">{c.id_company}</td>
//                     <td className="p-3">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         c.applies_detail 
//                           ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]" 
//                           : "bg-gray-600 bg-opacity-20 text-gray-400"
//                       }`}>
//                         {c.applies_detail ? "Sí" : "No"}
//                       </span>
//                     </td>
//                     <td className="p-3">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         c.status 
//                           ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]" 
//                           : "bg-red-600 bg-opacity-20 text-red-400"
//                       }`}>
//                         {c.status ? "Activo" : "Inactivo"}
//                       </span>
//                     </td>
//                     <td className="p-3 text-center">
//                       <div className="flex justify-center gap-2">
//                         <button
//                           onClick={() => handleEdit(c.id_xtra_company)}
//                           className="text-[#4D70B8] hover:text-[#00B140] transition-colors duration-200"
//                           title="Editar"
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => handleDeleteConfirm(c.id_xtra_company)}
//                           className="text-red-500 hover:text-red-400 transition-colors duration-200"
//                           title="Eliminar"
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="p-4 text-center text-gray-400">
//                     No se encontraron configuraciones
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExtraCompanyConfiguration;