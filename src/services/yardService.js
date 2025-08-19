import api from './api';

export const getYardById = async (yardId) => {
  try {
    const response = await api.get(`/api/yards/${yardId}`);
    return response.data.data; // Retorna apenas o objeto do pátio
  } catch (error) {
    console.error(`Erro ao buscar o pátio ${yardId}:`, error);
    throw error; // Propaga o erro para a tela lidar com ele
  }
};