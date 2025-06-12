import axios from "axios";

const axiosInstance = axios.create({
  headers: { "Content-Type": "application/json" },
});

let configLoaded = false;
let configPromise: Promise<void> | null = null;

const loadServerConfig = async (): Promise<void> => {
  if (configLoaded && axiosInstance.defaults.baseURL) return;

  const urlFromLocalStorage = localStorage.getItem("serverBaseUrl");
  if (urlFromLocalStorage) {
    axiosInstance.defaults.baseURL = urlFromLocalStorage;
    configLoaded = true;
    console.log("URL base cargada desde localStorage:", urlFromLocalStorage);
    return;
  }

  let urlFromConfigFile: string | null = null;
  console.log("localStorage vacío para serverBaseUrl, intentando leer config/server.txt...");
  try {
    const response = await fetch("/config/server.txt");
    if (response.ok) {
      const trimmedUrl = (await response.text()).trim();
      if (trimmedUrl) urlFromConfigFile = trimmedUrl;
      else console.warn("El archivo config/server.txt está vacío.");
    } else {
      console.warn(`No se pudo cargar config/server.txt. Status: ${response.status}`);
    }
  } catch (error: any) {
    console.warn("Error al intentar leer config/server.txt:", error.message);
  }

  if (urlFromConfigFile) {
    axiosInstance.defaults.baseURL = urlFromConfigFile;
    localStorage.setItem("serverBaseUrl", urlFromConfigFile);
    configLoaded = true;
    console.log("URL base establecida desde config/server.txt y guardada en localStorage:", urlFromConfigFile);
    return;
  }

  const errorMessage = "CRITICAL ERROR: Server configuration (localStorage and config/server.txt) could not be loaded. The application cannot contact the server. Please configure the server URL or contact your system administrator to ensure 'public/config/server.txt' is correctly configured and accessible if localStorage is empty.";
  console.error(errorMessage);
  throw new Error("Server configuration not available.");
};

const ensureConfigLoaded = async (): Promise<void> => {
  if (!configPromise) configPromise = loadServerConfig();
  try {
    await configPromise;
  } catch (error: any) {
    console.error("Error al asegurar la carga de la configuración:", error.message);
    configPromise = null;
    configLoaded = false;
    throw error;
  }
};

const waitForConfig = async (): Promise<void> => {
  if (!configLoaded || !axiosInstance.defaults.baseURL) {
    console.log("Esperando a que se cargue la configuración (baseURL no establecida o config no cargada)...");
    await ensureConfigLoaded();
  }
};

axiosInstance.interceptors.request.use(async (config) => {
  await waitForConfig();
  return config;
}, Promise.reject);

export const setServerUrl = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    console.warn("setServerUrl: Se intentó establecer una URL vacía.");
    return;
  }
  axiosInstance.defaults.baseURL = trimmedUrl;
  localStorage.setItem("serverBaseUrl", trimmedUrl);
  configLoaded = true;
  configPromise = Promise.resolve();
  console.log("URL base establecida manualmente y guardada en localStorage:", trimmedUrl);
};

export const reloadServerConfig = async () => {
  console.log("Iniciando recarga de configuración del servidor...");
  configLoaded = false;
  configPromise = null;
  localStorage.removeItem("serverBaseUrl");
  console.log("localStorage 'serverBaseUrl' eliminado para forzar lectura de archivo.");
  try {
    await ensureConfigLoaded();
    console.log("Configuración del servidor recargada exitosamente desde el archivo (si está disponible).");
  } catch (error: any) {
    console.error("Error durante reloadServerConfig:", error.message);
    throw error;
  }
};

export const getBaseUrl = () => axiosInstance.defaults.baseURL;

export const testServerConnection = async (url?: string): Promise<boolean> => {
  const testUrl = url || axiosInstance.defaults.baseURL;
  if (!testUrl) {
    console.warn("testServerConnection: No hay URL base configurada.");
    return false;
  }
  try {
    await axios.get(`${testUrl}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

(async () => {
  try {
    console.log("Iniciando carga automática de configuración de la aplicación...");
    await ensureConfigLoaded();
    if (axiosInstance.defaults.baseURL) {
      console.log("Configuración cargada automáticamente. URL base:", axiosInstance.defaults.baseURL);
    } else {
      console.error("Configuración supuestamente cargada, pero baseURL sigue sin estar definida.");
    }
  } catch { }
})();

export default axiosInstance;