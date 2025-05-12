import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  // Estados y configuración actual...
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    // Agregar verificación para evitar el bucle infinito
    const checkSession = () => {
      const user = sessionStorage.getItem("user");
      if (user && window.location.pathname === '/') {
        // Solo redirigir si estamos en la página de inicio y hay una sesión
        navigate("/dashboard", { replace: true });
      }
    };
    
    checkSession();
    // La función solo se ejecuta una vez al montar el componente
  }, [navigate]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${apiURL}/login`, {
        username: username.trim().toLowerCase(),
        password: password.trim(),
      });

      // Guardar datos de sesión
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("userName", response.data.userName);
      sessionStorage.setItem("perfil", response.data.perfil);
      sessionStorage.setItem("user", JSON.stringify({
        userId: response.data.userId,
        userName: response.data.userName,
        perfil: response.data.perfil
      }));

      // Disparar evento personalizado para notificar cambio en sessionStorage
      window.dispatchEvent(new Event('storageChange'));

      // Redirigir al dashboard después de guardar en sessionStorage
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      
      // Para pruebas: login con credenciales fijas
      if (username === "admin" && password === "admin123") {
        const mockUserData = {
          userId: "1",
          userName: "Administrador",
          perfil: "ADMIN"
        };
        
        sessionStorage.setItem("userId", mockUserData.userId);
        sessionStorage.setItem("userName", mockUserData.userName);
        sessionStorage.setItem("perfil", mockUserData.perfil);
        sessionStorage.setItem("user", JSON.stringify(mockUserData));
        
        // Disparar evento personalizado para notificar cambio en sessionStorage
        window.dispatchEvent(new Event('storageChange'));
        
        // Redirigir al dashboard
        navigate("/dashboard", { replace: true });
        return;
      }
      
      setError("Credenciales inválidas. Por favor verifique su usuario y contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#1A1A2E] font-['Montserrat'] px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-4 sm:p-6 rounded-t-xl shadow-lg">
          <div className="flex flex-col items-center justify-center text-white">
            {/* Logo de AISG con fondo blanco removido */}
            <div className="mb-3 sm:mb-4">
              <div className="bg-white p-3 sm:p-4 rounded-full shadow-md inline-flex">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[#0033A0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AISG Portal</h1>
            <p className="text-sm sm:text-base text-gray-200 mt-1 font-light">Sistema de Gestión de Servicios Aeronáuticos</p>
          </div>
        </div>
        
        <div className="bg-[#16213E] p-4 sm:p-8 rounded-b-xl shadow-lg border-l border-r border-b border-[#0033A0]/20">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-400 text-red-100 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 sm:mb-6 flex items-start">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4 sm:mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1E2A45] text-white pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1E2A45] text-white pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-md border border-gray-700 focus:border-[#4D70B8] focus:ring-1 focus:ring-[#4D70B8] focus:outline-none text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0033A0] to-[#00B140] hover:from-[#002D8A] hover:to-[#009935] text-white font-medium py-2 sm:py-3 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-l-2 border-white mr-2 sm:mr-3"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            © 2025 AISG - Aeronautical Industrial Support Group
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            Desarrollo por Walook
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;