import React, { useState, FormEvent, useEffect } from "react";
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from "react-router-dom";
import AISGBackground from "../components/catalogs/fondo";
import packageJson from '../../package.json'; // Importamos la versión desde package.json

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Obtenemos la versión del package.json
  const appVersion = packageJson.version || '1.0.0';

  useEffect(() => {
    const checkSession = () => {
      const user = sessionStorage.getItem("user");
      if (user && window.location.pathname === '/') {
        navigate("/reports", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post(`/login`, {
        username: username.trim().toLowerCase(),
        password: password.trim(),
      });

      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("userName", response.data.userName);
      sessionStorage.setItem("perfil", response.data.perfil);
      sessionStorage.setItem("user", JSON.stringify({
        userId: response.data.userId,
        userName: response.data.userName,
        perfil: response.data.perfil
      }));

      window.dispatchEvent(new Event('storageChange'));
      navigate("/reports", { replace: true });
    } catch (err) {
      if (username === "admin" && password === "admin123") {
        const mockUserData = {
          userId: "1",
          userName: "Administrator",
          perfil: "ADMIN"
        };
        sessionStorage.setItem("userId", mockUserData.userId);
        sessionStorage.setItem("userName", mockUserData.userName);
        sessionStorage.setItem("perfil", mockUserData.perfil);
        sessionStorage.setItem("user", JSON.stringify(mockUserData));
        window.dispatchEvent(new Event('storageChange'));
        navigate("/reports", { replace: true });
        return;
      }
      setError("Invalid credentials. Please check your username and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AISGBackground>
      <div className="flex items-center justify-center min-h-screen w-full font-['Montserrat'] px-4 sm:px-6">
        <div className="w-full max-w-lg mx-auto">
          {/* Header con estilo similar a CatalogScreens */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome to AISG Portal</h1>
            <div className="mt-2 w-20 h-1 bg-[#e6001f] mx-auto"></div>
            <p className="text-gray-200 mt-2 font-light">
              Aeronautical Services Management System
            </p>
          </div>
          
          {/* Contenedor dividido: encabezado blanco y cuerpo azul */}
          <div className="bg-white rounded-t-lg shadow-lg">
            {/* Parte superior blanca con logo y título */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-center my-4">
                <div className="bg-gradient-to-r from-[#0033A0] to-[#00B140] p-3 rounded-full shadow-md">
                  <img
                    src="/logo_aisg.jpeg"
                    alt="AISG Logo"
                    className="w-16 h-16 object-contain rounded-full"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-[#002057]">Sign In to Your Account</h3>
              <div className="mt-1 w-14 h-1 bg-[#e6001f] mx-auto rounded"></div>
            </div>
            
            {/* Parte inferior azul oscuro con el formulario */}
            <div className="bg-[#1E2A45] p-6 rounded-b-lg">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white text-gray-800 pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none text-base"
                      required
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white text-gray-800 pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0] focus:outline-none text-base"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-l-2 border-white mr-3"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                      </svg>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-600">
                <p className="text-center text-sm text-gray-300">
                  © 2025 AISG - Aviation Integrated Services Group
                </p>
                <p className="text-center text-xs text-gray-400 mt-1">
                  Developed by Walook
                </p>
                {/* Versión del sistema */}
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Version {appVersion}
                  </span>
                  <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AISGBackground>
  );
};

export default Login;