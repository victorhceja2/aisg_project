import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '', // Se sobrescribirá después de cargar la IP
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sobrescribe baseURL dinámicamente desde /server_ip.txt
fetch('/server_ip.txt')
  .then((res) => res.text())
  .then((text) => {
    axiosInstance.defaults.baseURL = text.trim();
  })
  .catch((err) => {
    console.error('No se pudo cargar la IP desde server_ip.txt:', err);
  });

export default axiosInstance;