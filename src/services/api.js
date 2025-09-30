// src/services/api.js
import axios from "axios";

// ⚠️ Para Android emulador use 10.0.2.2
// Para iOS simulador pode ser localhost
// Para celular físico use o IP da sua máquina
const api = axios.create({
  baseURL: "http://10.0.2.2:5183", // 🔹 sem /api
  timeout: 5000,
});

// ------------ Motos ------------
export const getMotos = async () => {
  const response = await api.get("/Moto");
  return response.data;
};

export const createMoto = async (moto) => {
  const response = await api.post("/Moto", moto);
  return response.data;
};

export const updateMoto = async (id, moto) => {
  const response = await api.put(`/Moto/${id}`, moto);
  return response.data;
};

export const deleteMoto = async (id) => {
  await api.delete(`/Moto/${id}`);
  return true;
};

// ------------ Patios ------------
export const getPatios = async () => {
  const response = await api.get("/Patio");
  return response.data;
};

export const createPatio = async (patio) => {
  const response = await api.post("/Patio", patio);
  return response.data;
};

export const updatePatio = async (id, patio) => {
  const response = await api.put(`/Patio/${id}`, patio);
  return response.data;
};

export const deletePatio = async (id) => {
  await api.delete(`/Patio/${id}`);
  return true;
};

export default api;
