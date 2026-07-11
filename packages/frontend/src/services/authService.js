import api from './api-client.js';

export const register = async ({
  dni,
  email,
  password,
  nombreUsuario,
  numTel,
  direccion,
  fechaNacimiento,
}) => {
  const response = await api.post('/auth/register', {
    dni,
    email,
    password,
    nombreUsuario,
    numTel,
    direccion,
    fechaNacimiento,
  });
  return response.data;
};

export const login_back = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response;
};
