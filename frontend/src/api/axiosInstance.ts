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
    const response = await fetch("/config/server.txt");
    if (response.ok) {
      const serverUrl = await response.text();
      const trimmedUrl = serverUrl.trim();

      if (trimmedUrl) {
        axiosInstance.defaults.baseURL = trimmedUrl;
        configLoaded = true;
        return;
      }
    }
    throw new Error("Archivo de configuración vacío o inválido");
  } catch (error) {
    console.error("Error: No se pudo cargar config/server.txt:", error.message);
    throw error;
  }
};

const ensureConfigLoaded = async (): Promise<void> => {
  if (!configPromise) {
    configPromise = loadServerConfig();
  }
  await configPromise;
};

axiosInstance.interceptors.request.use(async (config) => {
  await ensureConfigLoaded();
  return config;
});

export const setServerUrl = (url: string) => {
  axiosInstance.defaults.baseURL = url;
  configLoaded = true;
};

export const reloadServerConfig = async () => {
  configLoaded = false;
  configPromise = null;
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

export default axiosInstance;