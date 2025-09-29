// src/services/api.js
import axios from "axios";

// Base da sua API .NET
const api = axios.create({
  baseURL: "http://localhost:5183/api", // ajuste se precisar
  timeout: 5000,
});

// ------------ Motos ------------
export const getMotos = async () => {
  const response = await api.get("/motos");
  return response.data;
};

export const createMoto = async (moto) => {
  const response = await api.post("/motos", moto);
  return response.data;
};

export const updateMoto = async (id, moto) => {
  const response = await api.put(`/motos/${id}`, moto);
  return response.data;
};

export const deleteMoto = async (id) => {
  await api.delete(`/motos/${id}`);
  return true;
};

// ------------ Patios ------------
export const getPatios = async () => {
  const response = await api.get("/patios");
  return response.data;
};

export const createPatio = async (patio) => {
  const response = await api.post("/patios", patio);
  return response.data;
};

export const updatePatio = async (id, patio) => {
  const response = await api.put(`/patios/${id}`, patio);
  return response.data;
};

export const deletePatio = async (id) => {
  await api.delete(`/patios/${id}`);
  return true;
};

export default api;
