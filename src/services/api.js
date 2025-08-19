import axios from 'axios';

// Use '10.0.2.2' para o emulador Android se o seu backend estiver rodando no mesmo PC.
const API_URL = 'http://10.0.2.2:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;