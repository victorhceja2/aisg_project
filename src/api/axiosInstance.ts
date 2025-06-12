import axios from 'axios';

// Crear una instancia de Axios que utilice la URL base desde .env
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

if (!import.meta.env.VITE_API_URL) {
  // Mensaje de error si la variable de entorno no está definida
  console.error(
    "CRITICAL ERROR: No se encontró la variable de entorno VITE_API_URL. Por favor, configúrala en tu archivo .env."
  );
}

export default axiosInstance;