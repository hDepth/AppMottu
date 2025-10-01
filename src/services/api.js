// src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Para Android emulador use 10.0.2.2
// Para iOS simulador pode ser localhost
// Para celular físico use o IP da sua máquina
const api = axios.create({
  baseURL: "http://10.0.2.2:5183", // 🔹 sem /api
  timeout: 5000,
});

// ------------ Helpers ------------
const STATUS_MAP = {
  0: "Indefinido",
  1: "Disponível",
  2: "Em Manutenção",
  3: "Alugada",
  4: "Aguardando Revisão",
};

// ------------ Motos ------------
export const getMotos = async () => {
  try {
    const response = await api.get("/Moto");
    const apiMotos = response.data;

    // 🔹 Mapeia para o formato que o app espera
    return apiMotos.map((m) => ({
      id: m.motoId,
      modelId: m.modelo, // ainda não temos ID real, usamos nome
      model: m.modelo,
      licensePlate: m.placa,
      patio: null, // API não retorna ainda
      status: STATUS_MAP[m.status] || "Indefinido",
      location: m.localizacao || "",
    }));
  } catch (err) {
    console.error("Erro API (Moto), usando AsyncStorage:", err.message);
    try {
      const stored = await AsyncStorage.getItem("@mottuApp:motorcycles");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
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
  try {
    const response = await api.get("/Patio");
    const apiPatios = response.data;

    // 🔹 Mapeia também os pátios
    return apiPatios.map((p) => ({
      id: p.id,
      name: p.nome,
      capacidade: p.capacidade,
      endereco: `${p.endereco.rua}, ${p.endereco.cidade} - ${p.endereco.cep}`,
    }));
  } catch (err) {
    console.error("Erro API (Patio), usando AsyncStorage:", err.message);
    try {
      const stored = await AsyncStorage.getItem("@mottuApp:patios");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
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
