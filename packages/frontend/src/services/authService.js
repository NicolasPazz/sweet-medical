import api from './api-client.js';

export const register = async ({ dni, email, password }) => {
  const response = await api.post('/auth/register', { dni, email, password });
  return response.data;
};
