import api from './api';

export const listMotorcycles = async ({ yardId }) => {
  try {
    const response = await api.get('/api/motorcycles', {
      params: { yardId }
    });
    return response.data.data.motorcycles; // Retorna o array de motocicletas
  } catch (error) {
    console.error('Erro ao buscar motocicletas:', error);
    throw error;
  }
};