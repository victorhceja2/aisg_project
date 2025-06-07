import axios from 'axios';

// URLs para diferentes entornos
const LOCAL_URL = 'http://localhost:8000';
const SERVER_URL = 'http://82.165.213.124:8000';
const PROD_URL = 'https://api-portal.aisg.com.mx';

// Variable para guardar el protocolo que funciona
let workingProtocol: 'http' | 'https' | null = null;

// Función para determinar qué URL usar
const determineBaseURL = (): string => {
  // 1. Priorizar variable de entorno si existe
  if (import.meta.env.VITE_API_URL) {
    console.log(`🔧 Usando URL de variable de entorno: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // 2. En desarrollo, usar siempre localhost
  if (import.meta.env.DEV) {
    console.log(`🔧 Modo desarrollo detectado - usando localhost: ${LOCAL_URL}`);
    return LOCAL_URL;
  }

  // 3. Para verificación/testing, usar localhost si está disponible
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`🔧 Localhost detectado - usando: ${LOCAL_URL}`);
    return LOCAL_URL;
  }

  // 4. En producción, usar URL de producción
  if (import.meta.env.PROD) {
    console.log(`🔧 Modo producción - usando: ${PROD_URL}`);
    return PROD_URL;
  }

  // 5. Fallback al servidor de desarrollo
  console.log(`🔧 Fallback - usando servidor de desarrollo: ${SERVER_URL}`);
  return SERVER_URL;
};

// Usar la URL determinada
const baseURL = determineBaseURL();

// Imprimir en consola la URL base configurada
console.log(`🌐 URL base configurada: ${baseURL}`);

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para probar conectividad con ambos protocolos
const testProtocol = async (url: string, protocol: 'http' | 'https'): Promise<boolean> => {
  try {
    const testUrl = url.replace(/^https?:/, `${protocol}:`);
    console.log(`🔍 Probando ${protocol.toUpperCase()}: ${testUrl}`);
    
    // Probar con una ruta que sabemos que existe (usando rutas centralizadas)
    const response = await axios.get(`${testUrl}/catalog/service-classification`, { 
      timeout: 5000,
      validateStatus: (status) => status < 500 // Aceptar 200, 404, etc, pero no 500+
    });
    console.log(`✅ ${protocol.toUpperCase()} funciona! Status: ${response.status}`);
    return true;
  } catch (error: any) {
    console.log(`❌ ${protocol.toUpperCase()} falló:`, error.message);
    return false;
  }
};

// Función para determinar el protocolo que funciona
const determineWorkingProtocol = async (baseUrl: string) => {
  if (workingProtocol) {
    console.log(`🚀 Usando protocolo ya determinado: ${workingProtocol.toUpperCase()}`);
    return workingProtocol;
  }

  console.log('🔍 Determinando protocolo que funciona...');
  
  // Para localhost, usar HTTP directamente
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    workingProtocol = 'http';
    console.log('🏠 Localhost detectado - usando HTTP directamente');
    return 'http';
  }

  // Para otras URLs, probar HTTPS primero
  const httpsWorks = await testProtocol(baseUrl, 'https');
  if (httpsWorks) {
    workingProtocol = 'https';
    console.log('🔒 HTTPS seleccionado como protocolo de trabajo');
    return 'https';
  }

  // Si HTTPS falla, probar HTTP
  const httpWorks = await testProtocol(baseUrl, 'http');
  if (httpWorks) {
    workingProtocol = 'http';
    console.log('🔓 HTTP seleccionado como protocolo de trabajo');
    return 'http';
  }

  // Si ninguno funciona, usar HTTP para localhost, HTTPS para otros
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    console.log('⚠️ Ningún protocolo respondió para localhost, usando HTTP por defecto');
    workingProtocol = 'http';
    return 'http';
  } else {
    console.log('⚠️ Ningún protocolo respondió, usando HTTPS por defecto');
    workingProtocol = 'https';
    return 'https';
  }
};

// Interceptor para usar el protocolo correcto y eliminar barras finales
axiosInstance.interceptors.request.use(
  async (config) => {
    // Determinar el protocolo correcto si no se ha hecho antes
    if (!workingProtocol && config.baseURL) {
      const protocol = await determineWorkingProtocol(config.baseURL);
      config.baseURL = config.baseURL.replace(/^https?:/, `${protocol}:`);
      axiosInstance.defaults.baseURL = config.baseURL;
      console.log(`🔧 Base URL actualizada a: ${config.baseURL}`);
    } else if (workingProtocol && config.baseURL) {
      config.baseURL = config.baseURL.replace(/^https?:/, `${workingProtocol}:`);
    }

    if (config.url) {
      console.log('🔍 Antes de normalizar URL:', config.url);
      // Quitar todos los "/" al final de la URL (pero no dejarla vacía)
      config.url = config.url.replace(/\/+$/, '') || config.url;
      console.log('✅ Después de normalizar URL:', config.url);
      console.log('🌐 Base URL actual:', config.baseURL || axiosInstance.defaults.baseURL);
      console.log('🚀 URL final:', `${config.baseURL || axiosInstance.defaults.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Solo cargar configuración desde server_ip.txt si NO estamos en localhost y estamos en producción
if (import.meta.env.PROD && !baseURL.includes('localhost')) {
  fetch('/server_ip.txt')
    .then((res) => res.text())
    .then(async (text) => {
      if (text.trim()) {
        const urlFromFile = text.trim();
        console.log('📁 URL desde server_ip.txt:', urlFromFile);
        
        // Determinar protocolo correcto para la nueva URL
        workingProtocol = null; // Reset para nueva URL
        const protocol = await determineWorkingProtocol(urlFromFile);
        const finalUrl = urlFromFile.replace(/^https?:/, `${protocol}:`);
        
        axiosInstance.defaults.baseURL = finalUrl;
        console.log('📁 API URL final configurada desde server_ip.txt:', finalUrl);
      }
    })
    .catch((err) => {
      console.error('❌ Error al cargar server_ip.txt, usando URL de fallback:', err);
      // No cambiar a SERVER_URL si estamos usando localhost
      if (!baseURL.includes('localhost')) {
        axiosInstance.defaults.baseURL = SERVER_URL;
      }
    });
}

// Función auxiliar para obtener la URL base actual (útil para debugging)
export const getBaseUrl = () => axiosInstance.defaults.baseURL;

// Función auxiliar para forzar el uso de localhost (útil para testing)
export const forceLocalhost = () => {
  workingProtocol = 'http';
  axiosInstance.defaults.baseURL = LOCAL_URL;
  console.log('🏠 Forzado a usar localhost:', LOCAL_URL);
};

// Función auxiliar para verificar si estamos usando localhost
export const isUsingLocalhost = () => {
  const currentBaseURL = axiosInstance.defaults.baseURL || '';
  return currentBaseURL.includes('localhost') || currentBaseURL.includes('127.0.0.1');
};

export default axiosInstance;