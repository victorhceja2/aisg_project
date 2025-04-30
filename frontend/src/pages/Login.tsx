// frontend/src/pages/Login.tsx

import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });

      // Guardar datos en sessionStorage
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("userName", response.data.userName);
      sessionStorage.setItem("perfil", response.data.perfil);

      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err); // Log error real en consola
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-96">
        <h1 className="text-3xl text-center text-white mb-6">AISG Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
          >
            Iniciar sesión
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Login;