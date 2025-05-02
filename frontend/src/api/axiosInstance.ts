import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Ajusta si el puerto cambia
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;