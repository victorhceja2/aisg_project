import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

let configLoaded = false;
let configPromise: Promise<void> | null = null;

const loadServerConfig = async (): Promise<void> => {
  if (configLoaded) return;

  try {
    // Verificar si la URL base ya está almacenada en localStorage
    const cachedBaseUrl = localStorage.getItem("serverBaseUrl");
    if (cachedBaseUrl) {
      axiosInstance.defaults.baseURL = cachedBaseUrl;
      console.log("URL base cargada desde localStorage:", cachedBaseUrl);
      configLoaded = true;
      return;
    }

    // Si no está en localStorage, cargar desde el archivo server.txt
    const response = await fetch("/config/server.txt");
    if (response.ok) {
      const serverUrl = await response.text();
      const trimmedUrl = serverUrl.trim();

      if (trimmedUrl) {
        axiosInstance.defaults.baseURL = trimmedUrl;
        localStorage.setItem("serverBaseUrl", trimmedUrl); // Guardar en localStorage
        console.log("URL base cargada desde el archivo de configuración:", trimmedUrl);
        configLoaded = true;
        return;
      }
    }
    throw new Error("Archivo de configuración vacío o inválido");
  } catch (error) {
    console.error("Error: No se pudo cargar config/server.txt:", error.message);
    alert("Error: No se encontró el archivo de configuración o es inválido. Contacte al administrador.");
    throw new Error("No se encontró el archivo de configuración o es inválido.");
  }
};

const ensureConfigLoaded = async (): Promise<void> => {
  if (!configPromise) {
    configPromise = loadServerConfig();
  }
  try {
    await configPromise;
  } catch (error) {
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
  axiosInstance.defaults.baseURL = url;
  localStorage.setItem("serverBaseUrl", url); // Actualizar en localStorage
  configLoaded = true;
};

export const reloadServerConfig = async () => {
  configLoaded = false;
  configPromise = null;
  localStorage.removeItem("serverBaseUrl"); // Limpiar localStorage
  return await loadServerConfig();
};

export const getBaseUrl = () => axiosInstance.defaults.baseURL;

export const testServerConnection = async (url?: string): Promise<boolean> => {
  const testUrl = url || axiosInstance.defaults.baseURL;
  try {
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
  } catch (error) {
    console.error("Error al cargar la configuración al iniciar la aplicación:", error.message);
  }
})();

export default axiosInstance;