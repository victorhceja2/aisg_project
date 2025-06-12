import React, { useEffect, useState, useRef } from "react";
import axiosInstance from '../../api/axiosInstance';

import { Link, useNavigate } from "react-router-dom";

// Definición de la estructura de datos para una asignación extra de servicio a venta
interface ExtraServiceAssignment {
  id_xtra_sale_employee: number;
  id_service_per_customer: number;
  id_sale_flight: number;
  id_sale_employee: number;
  work_order: string;
  status: boolean;
}

const ExtraServiceSaleAssignment: React.FC = () => {
  // Hook para navegación programática
  const navigate = useNavigate();
  // Estado para la lista de asignaciones extra obtenidas del backend
  const [assignments, setAssignments] = useState<ExtraServiceAssignment[]>([]);
  // Estado para el valor del campo de búsqueda (por orden de trabajo)
  const [search, setSearch] = useState("");
  // Estado para mostrar spinner de carga
  const [isLoading, setIsLoading] = useState(true);
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);
  // Estado para mensajes de éxito
  const [success, setSuccess] = useState<string | null>(null);
  // Estado para controlar el id de la asignación a eliminar (para mostrar el modal)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string>("");

  // Estados para modales de eliminación
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deletedAssignmentInfo, setDeletedAssignmentInfo] = useState<{id: number, workOrder: string} | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [dependentRecords, setDependentRecords] = useState<any[]>([]);

  // Referencias para manejar el foco
  const deleteSuccessOkButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteErrorOkButtonRef = useRef<HTMLButtonElement>(null);

  // Efecto para enfocar el botón OK del popup de éxito de eliminación
  useEffect(() => {
    if (showDeleteSuccess && deleteSuccessOkButtonRef.current) {
      setTimeout(() => {
        deleteSuccessOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteSuccess]);

  // Efecto para enfocar el botón Delete del popup de confirmación
  useEffect(() => {
    if (deleteConfirm && deleteConfirmButtonRef.current) {
      setTimeout(() => {
        deleteConfirmButtonRef.current?.focus();
      }, 100);
    }
  }, [deleteConfirm]);

  // Efecto para enfocar el botón OK del popup de error
  useEffect(() => {
    if (showDeleteError && deleteErrorOkButtonRef.current) {
      setTimeout(() => {
        deleteErrorOkButtonRef.current?.focus();
      }, 100);
    }
  }, [showDeleteError]);

  // Efecto para manejar Enter en los popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showDeleteSuccess) {
          e.preventDefault();
          closeSuccessModal();
        } else if (deleteConfirm && !deletingAssignment) {
          e.preventDefault();
          handleDelete();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      } else if (e.key === 'Escape') {
        if (deleteConfirm && !deletingAssignment) {
          e.preventDefault();
          handleCancelDelete();
        } else if (showDeleteSuccess) {
          e.preventDefault();
          closeSuccessModal();
        } else if (showDeleteError) {
          e.preventDefault();
          closeDeleteErrorModal();
        }
      }
    };

    if (deleteConfirm || showDeleteSuccess || showDeleteError) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [deleteConfirm, showDeleteSuccess, showDeleteError, deletingAssignment]);

  /**
   * Obtiene la lista de asignaciones desde el backend.
   * Si hay un valor en el campo de búsqueda, filtra por work_order.
   */
  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/catalog/extra-service-sale-assignment${
          search ? `?work_order=${encodeURIComponent(search)}` : ""
        }`
      );
      setAssignments(res.data);
    } catch (err: any) {
      console.error("Error al obtener asignaciones", err);
      setError("No se pudieron cargar las asignaciones. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verificar si una asignación está siendo utilizada por otros módulos
   */
  const checkAssignmentUsage = async (assignmentId: number): Promise<{ inUse: boolean; records: any[] }> => {
    try {
      // Verificar en diferentes módulos que puedan usar esta asignación
      
      // Ejemplo: verificar en work orders
      const workOrdersRes = await axiosInstance.get('/work-orders');
      const workOrdersUsingAssignment = workOrdersRes.data.filter((wo: any) => 
        wo.id_xtra_sale_employee === assignmentId
      );

      // Ejemplo: verificar en billing/invoices
      const billingRes = await axiosInstance.get('/billing/invoices');
      const billingUsingAssignment = billingRes.data.filter((invoice: any) => 
        invoice.id_xtra_sale_employee === assignmentId
      );

      // Ejemplo: verificar en reports o timesheets
      const timesheetsRes = await axiosInstance.get('/timesheets');
      const timesheetsUsingAssignment = timesheetsRes.data.filter((ts: any) => 
        ts.id_xtra_sale_employee === assignmentId
      );

      const allDependentRecords = [
        ...workOrdersUsingAssignment.map((wo: any) => ({
          type: 'Work Order',
          name: `Work Order: ${wo.work_order_number || wo.id}`,
          id: wo.id
        })),
        ...billingUsingAssignment.map((invoice: any) => ({
          type: 'Invoice',
          name: `Invoice: ${invoice.invoice_number || invoice.id}`,
          id: invoice.id
        })),
        ...timesheetsUsingAssignment.map((ts: any) => ({
          type: 'Timesheet',
          name: `Timesheet: ${ts.date || ts.id} - Employee: ${ts.employee_name || ts.id_employee}`,
          id: ts.id
        }))
      ];
      
      return {
        inUse: allDependentRecords.length > 0,
        records: allDependentRecords
      };
    } catch (err) {
      console.error("Error checking assignment usage:", err);
      return { inUse: false, records: [] };
    }
  };

  /**
   * Navega a la pantalla de alta de una nueva asignación extra.
   */
  const handleAddNewClick = () => {
    navigate("/catalog/extra-service/add");
  };

  /**
   * Cuando el usuario hace clic en eliminar, se verifica si está en uso y luego se muestra el modal correspondiente.
   */
  const handleDeleteConfirm = async (id: number, workOrder: string) => {
    // Verificar si la asignación está siendo utilizada
    const { inUse, records } = await checkAssignmentUsage(id);
    
    if (inUse) {
      // Mostrar popup de error con la lista de registros que lo utilizan
      setDependentRecords(records);
      setDeleteErrorMessage(
        `Cannot delete assignment for work order "${workOrder}" (ID: ${id}) because it is being used by ${records.length} record(s) in the system.`
      );
      setShowDeleteError(true);
      return;
    }

    // Si no está en uso, proceder con la confirmación de eliminación
    setDeleteConfirm(id);
    setItemToDeleteName(workOrder);
  };

  /**
   * Si el usuario confirma la eliminación, se hace la petición DELETE al backend y se actualiza la lista.
   */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      setDeletingAssignment(true);
      
      // Verificar una vez más antes de eliminar
      const { inUse, records } = await checkAssignmentUsage(deleteConfirm);
      
      if (inUse) {
        // Si ahora está en uso, mostrar error
        setDependentRecords(records);
        setDeleteErrorMessage(
          `Cannot delete assignment for work order "${itemToDeleteName}" (ID: ${deleteConfirm}) because it is being used by ${records.length} record(s) in the system.`
        );
        setDeleteConfirm(null);
        setItemToDeleteName("");
        setShowDeleteError(true);
        return;
      }

      await axiosInstance.delete(`/catalog/extra-service-sale-assignment/${deleteConfirm}`);
      setDeletedAssignmentInfo({ id: deleteConfirm, workOrder: itemToDeleteName });
      setDeleteConfirm(null);
      setItemToDeleteName("");
      await fetchAssignments();
      setError(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      console.error("Error al eliminar asignación", err);
      
      // Verificar si el error es por dependencias
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("constraint")) {
        setDeleteErrorMessage(
          `Cannot delete assignment for work order "${itemToDeleteName}" (ID: ${deleteConfirm}) because it is being used by other records in the system.`
        );
        setDeleteConfirm(null);
        setItemToDeleteName("");
        setShowDeleteError(true);
      } else {
        if (err.response) {
          setError(`Error (${err.response.status}): ${err.response.data.detail || "No se pudo eliminar la asignación"}`);
        } else {
          setError("No se pudo eliminar la asignación. Intente nuevamente.");
        }
        setDeleteConfirm(null);
        setItemToDeleteName("");
      }
    } finally {
      setDeletingAssignment(false);
    }
  };

  /**
   * Si el usuario cancela la eliminación, se oculta el modal y se limpia el id.
   */
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setItemToDeleteName("");
  };

  const closeSuccessModal = () => {
    setShowDeleteSuccess(false);
    setDeletedAssignmentInfo(null);
  };

  const closeDeleteErrorModal = () => {
    setShowDeleteError(false);
    setDeleteErrorMessage("");
    setDependentRecords([]);
  };

  // Cada vez que cambia el valor de búsqueda, se vuelve a cargar la lista de asignaciones
  useEffect(() => {
    fetchAssignments();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto p-6 font-['Montserrat']">
      {/* Cabecera principal con título y descripción */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Asignación Extra de Servicios
        </h1>
        <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
        <p className="text-gray-200 mt-2 font-light">
          Gestión de asignaciones de servicios adicionales a vuelos y empleados
        </p>
      </div>

      {/* Mensajes de error o éxito */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md animate-pulse">
          <p className="font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg mb-6 shadow-md">
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* Barra de acciones: búsqueda y botón para agregar nuevo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-2/3 relative">
          <input
            type="text"
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-[#002057] focus:border-[#002057] focus:ring-2 focus:ring-[#002057] focus:outline-none transition-all"
            placeholder="Buscar por orden de trabajo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleAddNewClick}
          className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#002057] font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Asignación
        </button>
      </div>

      {/* Tabla de datos con la lista de asignaciones */}
      <div className="overflow-x-auto">
        {isLoading && !deleteConfirm ? (
          <div className="flex justify-center py-12 bg-transparent">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B140]"></div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white text-[#002057]">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Servicio Cliente ID</th>
                <th className="px-4 py-3 text-left font-semibold">Vuelo ID</th>
                <th className="px-4 py-3 text-left font-semibold">Empleado ID</th>
                <th className="px-4 py-3 text-left font-semibold">Orden de Trabajo</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-[#1E2A45]">
              {assignments.length > 0 ? (
                assignments.map((a) => (
                  <tr key={a.id_xtra_sale_employee} className="hover:bg-[#1E2A45] transition-colors">
                    <td className="px-4 py-3 text-white">{a.id_xtra_sale_employee}</td>
                    <td className="px-4 py-3 text-white">{a.id_service_per_customer}</td>
                    <td className="px-4 py-3 text-white">{a.id_sale_flight}</td>
                    <td className="px-4 py-3 text-white">{a.id_sale_employee}</td>
                    <td className="px-4 py-3 text-white font-medium">{a.work_order}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.status
                          ? "bg-[#00B140] bg-opacity-20 text-[#4DC970]"
                          : "bg-red-600 bg-opacity-20 text-red-400"
                      }`}>
                        {a.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/catalog/extra-service/edit/${a.id_xtra_sale_employee}`}
                          className="p-1.5 bg-white text-[#002057] rounded hover:bg-gray-100 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(a.id_xtra_sale_employee, a.work_order)}
                          className="p-1.5 bg-[#e6001f] text-white rounded hover:bg-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white">
                    No se encontraron asignaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Confirmar Eliminación
              </h2>
              <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
            </div>

            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] py-8 px-6">
              <div className="flex items-start gap-3">
                <div className="bg-red-600 rounded-full p-2 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white text-lg mt-1">
                  ¿Estás seguro de que deseas eliminar la asignación para la orden de trabajo "{itemToDeleteName}" (ID: {deleteConfirm})? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                {deletingAssignment ? (
                  <div className="w-full flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleCancelDelete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCancelDelete();
                        }
                      }}
                      className="w-1/2 bg-[#4D70B8] hover:bg-[#3A5A9F] text-white font-medium py-3 px-4 rounded transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      ref={deleteConfirmButtonRef}
                      onClick={handleDelete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDelete();
                        }
                      }}
                      className="w-1/2 bg-[#e6001f] hover:bg-red-700 text-white font-medium py-3 px-4 rounded transition-all"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito después de eliminar */}
      {showDeleteSuccess && deletedAssignmentInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md overflow-hidden rounded-lg shadow-xl">
            <div className="bg-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                Éxito
              </h2>
              <div className="mt-1 w-24 h-1 bg-[#e6001f] mx-auto"></div>
            </div>

            <div className="bg-[#1E2A45] py-8 px-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white text-lg">
                  La asignación para la orden de trabajo "{deletedAssignmentInfo.workOrder}" (ID: {deletedAssignmentInfo.id}) ha sido eliminada exitosamente!
                </p>
              </div>

              <div className="mt-8">
                <button
                  ref={deleteSuccessOkButtonRef}
                  onClick={closeSuccessModal}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      closeSuccessModal();
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup de error de eliminación (registro en uso) */}
      {showDeleteError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-hidden max-w-lg w-full mx-4 rounded-lg shadow-xl">
            {/* Encabezado blanco con texto azul */}
            <div className="bg-white rounded-t-lg px-6 py-4 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-[#002057]">
                No se puede eliminar
              </h2>
              <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Cuerpo con fondo azul oscuro */}
            <div className="bg-[#1E2A45] rounded-b-lg shadow-lg px-8 py-8">
              <div className="flex items-start mb-4">
                <div className="bg-[#f59e0b] rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg mb-4">
                    {deleteErrorMessage}
                  </p>
                  {dependentRecords.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white text-sm font-medium mb-2">Registros que utilizan esta asignación:</p>
                      <div className="bg-[#0D1423] rounded-lg p-3 max-h-32 overflow-y-auto">
                        {dependentRecords.map((record, index) => (
                          <div key={index} className="text-gray-300 text-sm py-1">
                            • {record.type}: {record.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  ref={deleteErrorOkButtonRef}
                  onClick={closeDeleteErrorModal}
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraServiceSaleAssignment;