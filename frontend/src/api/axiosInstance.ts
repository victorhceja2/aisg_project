import axios from 'axios';

// Establecer URLs para diferentes entornos
const LOCAL_URL = 'http://localhost:8000';
const SERVER_URL = 'http://82.165.213.124:8000';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || LOCAL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intentar cargar la configuración desde server_ip.txt si estamos en producción
if (import.meta.env.PROD) {
  fetch('/server_ip.txt')
    .then((res) => res.text())
    .then((text) => {
      if (text.trim()) {
        axiosInstance.defaults.baseURL = text.trim();
        console.log('API URL configurada desde server_ip.txt:', text.trim());
      }
    })
    .catch((err) => {
      console.error('Error al cargar server_ip.txt, usando URL alternativa:', err);
      // Si falla, usar la URL del servidor
      axiosInstance.defaults.baseURL = SERVER_URL;
    });
}

// Interceptor para eliminar barras "/" al final de cada ruta
axiosInstance.interceptors.request.use((config) => {
  if (config.url) {
    // Quitar todos los "/" al final de la URL (pero no dejarla vacía)
    config.url = config.url.replace(/\/+$/, '') || config.url;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Función auxiliar para obtener la URL base actual (útil para debugging)
export const getBaseUrl = () => axiosInstance.defaults.baseURL;

export default axiosInstance;