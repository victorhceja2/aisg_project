import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddSPConsumer: React.FC = () => {
  // Colores AISG según el manual de identidad corporativa
  const colors = {
    aisgBlue: "#0033A0",
    aisgGreen: "#00B140",
    aisgLightBlue: "#4D70B8",
    aisgLightGreen: "#4DC970",
    darkBg: "#1A1A2E",
    darkBgSecondary: "#16213E",
    darkBgTertiary: "#0D1B2A",
    darkBgPanel: "#1E2A45",
  };

  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    id_service: "",
    id_client: "",
    id_company: "",
    minutes_included: 0,
    minutes_minimum: 0,
    fuselage_type: "",
    technicians_included: 0,
  });
  
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        id_service: parseInt(form.id_service),
        id_client: parseInt(form.id_client),
        id_company: parseInt(form.id_company),
        minutes_included: form.minutes_included,
        minutes_minimum: form.minutes_minimum,
        fuselage_type: form.fuselage_type,
        technicians_included: form.technicians_included,
      };

      // Creamos el nuevo registro
      await axios.post("http://localhost:8000/catalog/service-per-customer", data);

      // Redireccionamos a la lista
      navigate("/catalogs/customer");
    } catch (err) {
      console.error("Error al guardar el registro", err);
      setError("No se pudo guardar el registro. Verifique los datos e intente nuevamente.");
    }
  };

  const handleCancel = () => {
    navigate("/catalogs/customer");
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] py-8 px-4 sm:px-6 lg:px-8 font-['Montserrat'] text-white">
      <div className="max-w-2xl mx-auto">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Agregar Servicio por Cliente
          </h1>
          <p className="text-gray-200 mt-2 font-light text-center">
            Asignación de servicios específicos por cliente
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[#16213E] p-6 rounded-lg shadow-lg">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ID Servicio</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="ID Servicio"
                  value={form.id_service}
                  onChange={(e) => setForm({ ...form, id_service: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ID Cliente</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="ID Cliente"
                  value={form.id_client}
                  onChange={(e) => setForm({ ...form, id_client: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ID Empresa</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="ID Empresa"
                  value={form.id_company}
                  onChange={(e) => setForm({ ...form, id_company: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minutos Incluidos</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="Minutos Incluidos"
                  type="number"
                  value={form.minutes_included}
                  onChange={(e) => setForm({ ...form, minutes_included: +e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minutos Mínimos</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="Minutos Mínimos"
                  type="number"
                  value={form.minutes_minimum}
                  onChange={(e) => setForm({ ...form, minutes_minimum: +e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Técnicos Incluidos</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="Técnicos Incluidos"
                  type="number"
                  value={form.technicians_included}
                  onChange={(e) => setForm({ ...form, technicians_included: +e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Fuselaje</label>
                <input
                  className="w-full bg-[#1E2A45] text-white px-4 py-2 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none"
                  placeholder="Tipo de Fuselaje"
                  value={form.fuselage_type}
                  onChange={(e) => setForm({ ...form, fuselage_type: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 px-6 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSPConsumer;