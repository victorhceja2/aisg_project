import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

let configLoaded = false;
let configPromise: Promise<void> | null = null;

const loadServerConfig = async (): Promise<void> => {
  if (configLoaded && axiosInstance.defaults.baseURL) {
    // Si ya está cargada Y la baseURL está establecida (p.ej. por setServerUrl o una carga previa exitosa),
    // no hacer nada más en esta llamada.
    // Esto previene re-procesamiento innecesario si ensureConfigLoaded es llamado múltiples veces
    // después de una carga exitosa dentro de la misma sesión de página.
    return;
  }

  // Al reiniciar la app (recarga de página), configLoaded será false.
  // Primero, intentar cargar desde localStorage.
  const urlFromLocalStorage = localStorage.getItem("serverBaseUrl");

  if (urlFromLocalStorage) {
    axiosInstance.defaults.baseURL = urlFromLocalStorage;
    configLoaded = true;
    console.log("URL base cargada desde localStorage:", urlFromLocalStorage);
    // Con esta lógica, si localStorage tiene un valor, no se consulta el archivo server.txt
    // a menos que se llame a reloadServerConfig().
    return;
  }

  // Si localStorage está vacío, intentar leer el archivo de configuración.
  let urlFromConfigFile: string | null = null;
  console.log("localStorage vacío para serverBaseUrl, intentando leer config/server.txt...");

  try {
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

  if (urlFromConfigFile) {
    // Si el archivo se pudo leer y tiene contenido, usarlo y guardarlo en localStorage.
    axiosInstance.defaults.baseURL = urlFromConfigFile;
    localStorage.setItem("serverBaseUrl", urlFromConfigFile);
    configLoaded = true;
    console.log("URL base establecida desde config/server.txt y guardada en localStorage:", urlFromConfigFile);
    return;
  }
  
  // Error: Ni localStorage ni el archivo proporcionaron una URL.
  const errorMessage = "CRITICAL ERROR: Server configuration (localStorage and config/server.txt) could not be loaded. The application cannot contact the server. Please configure the server URL or contact your system administrator to ensure 'public/config/server.txt' is correctly configured and accessible if localStorage is empty.";
  console.error(errorMessage);
  // alert(errorMessage); // Alert puede ser intrusivo; el error en consola es prioritario.
  // Considerar un mecanismo de UI más amigable para este error si es necesario.
  throw new Error("Server configuration not available.");
};

const ensureConfigLoaded = async (): Promise<void> => {
  if (!configPromise) {
    configPromise = loadServerConfig();
  }
  try {
    await configPromise;
  } catch (error: any) {
    console.error("Error al asegurar la carga de la configuración:", error.message);
    // Limpiar configPromise para permitir un nuevo intento si es relevante
    configPromise = null; 
    configLoaded = false; // Asegurar que se intente recargar si hay un nuevo ensureConfigLoaded
    throw error; // Asegúrate de que el error se propague si la configuración falla
  }
};

// Bloquea solicitudes hasta que la configuración esté cargada
const waitForConfig = async (): Promise<void> => {
  // No solo verificar configLoaded, sino también que baseURL esté realmente establecida.
  if (!configLoaded || !axiosInstance.defaults.baseURL) {
    console.log("Esperando a que se cargue la configuración (baseURL no establecida o config no cargada)...");
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
  if (!trimmedUrl) {
    console.warn("setServerUrl: Se intentó establecer una URL vacía.");
    // Opcionalmente, manejar este caso de error más estrictamente.
    // Por ahora, no cambiaremos la config si la URL es vacía.
    return;
  }
  axiosInstance.defaults.baseURL = trimmedUrl;
  localStorage.setItem("serverBaseUrl", trimmedUrl); 
  configLoaded = true; 
  configPromise = Promise.resolve(); // Marcar la promesa de config como resuelta.
  console.log("URL base establecida manualmente y guardada en localStorage:", trimmedUrl);
};

export const reloadServerConfig = async () => {
  console.log("Iniciando recarga de configuración del servidor...");
  configLoaded = false; 
  configPromise = null; 
  localStorage.removeItem("serverBaseUrl"); // Crucial: Limpiar la caché para forzar la lectura desde el archivo.
  console.log("localStorage 'serverBaseUrl' eliminado para forzar lectura de archivo.");
  try {
    await ensureConfigLoaded(); // Esto llamará a loadServerConfig, que ahora leerá el archivo.
    console.log("Configuración del servidor recargada exitosamente desde el archivo (si está disponible).");
  } catch (error: any) {
    console.error("Error durante reloadServerConfig:", error.message);
    // El error ya se maneja y propaga en ensureConfigLoaded.
    // Aquí solo se logea adicionalmente si es necesario.
    throw error; // Re-lanzar para que el llamador sepa que falló.
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

// Cargar la configuración automáticamente al iniciar la aplicación
(async () => {
  try {
    console.log("Iniciando carga automática de configuración de la aplicación...");
    await ensureConfigLoaded();
    if (axiosInstance.defaults.baseURL) {
      console.log("Configuración cargada automáticamente. URL base:", axiosInstance.defaults.baseURL);
    } else {
      // Esto no debería ocurrir si ensureConfigLoaded no lanzó un error.
      console.error("Configuración supuestamente cargada, pero baseURL sigue sin estar definida.");
    }
  } catch (error: any) {
    // El error ya se maneja y logea dentro de loadServerConfig/ensureConfigLoaded.
    // No es necesario un alert() aquí a menos que se desee explícitamente.
    // console.error("Fallo crítico al cargar la configuración al iniciar la aplicación:", error.message);
  }
})();

export default axiosInstance;