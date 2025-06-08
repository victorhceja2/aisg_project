import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

let configLoaded = false;
let configPromise: Promise<void> | null = null;

const loadServerConfig = async (): Promise<void> => {
  if (configLoaded) return; // Evita recargas si ya está configurado (p. ej., por setServerUrl)

  let urlFromConfigFile: string | null = null;

  try {
    // Siempre intentar leer el archivo de configuración primero
    const response = await fetch("/config/server.txt"); // Asume que server.txt está en la carpeta public/config
    if (response.ok) {
      const serverUrlText = await response.text();
      const trimmedUrl = serverUrlText.trim();
      if (trimmedUrl) {
        urlFromConfigFile = trimmedUrl;
      } else {
        console.warn("El archivo config/server.txt está vacío.");
      }
    } else {
      console.warn(`No se pudo cargar config/server.txt. Status: ${response.status}`);
    }
  } catch (error: any) {
    console.warn("Error al intentar leer config/server.txt:", error.message);
  }

  const urlFromLocalStorage = localStorage.getItem("serverBaseUrl");

  if (urlFromConfigFile) {
    // Prioridad 1: Usar la URL del archivo si se pudo leer y no está vacía
    if (urlFromConfigFile !== urlFromLocalStorage) {
      localStorage.setItem("serverBaseUrl", urlFromConfigFile); // Actualizar localStorage
      console.log("URL base establecida/actualizada desde config/server.txt:", urlFromConfigFile);
    } else {
      console.log("URL base confirmada desde config/server.txt (coincide con localStorage):", urlFromConfigFile);
    }
    axiosInstance.defaults.baseURL = urlFromConfigFile;
    configLoaded = true;
    return;
  }
  
  // Prioridad 2: Si el archivo no se pudo leer o estaba vacío, usar localStorage si existe
  if (urlFromLocalStorage) {
    axiosInstance.defaults.baseURL = urlFromLocalStorage;
    configLoaded = true;
    console.log("URL base cargada desde localStorage (config/server.txt no disponible o vacío):", urlFromLocalStorage);
    return;
  }

  // Error: Ni el archivo ni localStorage proporcionaron una URL
  const errorMessage = "CRITICAL ERROR: Server configuration (config/server.txt) could not be loaded, and no cached configuration was found in localStorage. The application cannot contact the server. Please contact your system administrator to ensure 'public/config/server.txt' is correctly configured and accessible.";
  console.error(errorMessage);
  alert(errorMessage); 
  throw new Error("Server configuration not available.");
};

const ensureConfigLoaded = async (): Promise<void> => {
  if (!configPromise) {
    configPromise = loadServerConfig();
  }
  try {
    await configPromise;
  } catch (error: any) {
    console.error("Error al cargar la configuración:", error.message);
    throw error; // Asegúrate de que el error se propague si la configuración falla
  }
};

// Bloquea solicitudes hasta que la configuración esté cargada
const waitForConfig = async (): Promise<void> => {
  if (!configLoaded) {
    console.log("Esperando a que se cargue la configuración...");
    await ensureConfigLoaded();
  }
};

axiosInstance.interceptors.request.use(async (config) => {
  await waitForConfig(); // Asegúrate de que la configuración esté cargada antes de cada solicitud
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setServerUrl = (url: string) => {
  const trimmedUrl = url.trim();
  axiosInstance.defaults.baseURL = trimmedUrl;
  localStorage.setItem("serverBaseUrl", trimmedUrl); // Actualizar en localStorage
  configLoaded = true; // Marcar como cargado para que loadServerConfig no intente sobrescribir
                       // inmediatamente si se llama después. Si la app se recarga,
                       // loadServerConfig volverá a leer el archivo.
  console.log("URL base establecida manualmente:", trimmedUrl);
};

export const reloadServerConfig = async () => {
  configLoaded = false; // Permitir que loadServerConfig se ejecute de nuevo
  configPromise = null; // Forzar la re-ejecución de loadServerConfig
  localStorage.removeItem("serverBaseUrl"); // Limpiar la caché para forzar la lectura desde el archivo
  console.log("Recargando configuración del servidor...");
  return await ensureConfigLoaded(); // Esto llamará a loadServerConfig
};

export const getBaseUrl = () => axiosInstance.defaults.baseURL;

export const testServerConnection = async (url?: string): Promise<boolean> => {
  const testUrl = url || axiosInstance.defaults.baseURL;
  if (!testUrl) {
    console.warn("testServerConnection: No hay URL base configurada.");
    return false;
  }
  try {
    // Asumimos que el endpoint de health no requiere que la config esté completamente cargada
    // por axiosInstance, por eso usamos axios.get directamente con la URL de prueba.
    await axios.get(`${testUrl}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

// Cargar la configuración automáticamente al iniciar la aplicación
(async () => {
  try {
    await ensureConfigLoaded();
    console.log("Configuración cargada automáticamente al iniciar la aplicación.");
  } catch (error: any) {
    console.error("Error al cargar la configuración al iniciar la aplicación:", error.message);
    // El alert y el error ya se manejan dentro de loadServerConfig/ensureConfigLoaded
  }
})();

export default axiosInstance;