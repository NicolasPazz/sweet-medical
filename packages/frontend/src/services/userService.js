import axios from 'axios';
import { getApiBaseUrl } from '../lib/api-utils.js';
import { generateBasicAuthHeader } from './ParserB64.js';

export const getMe = async ({ email, password }) => {
  const authHeader = generateBasicAuthHeader(email, password);
  const response = await axios.get(`${getApiBaseUrl()}/usuarios/me`, {
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
  });

  const { usuario, perfil } = response.data.data;

  return {
    usuario: {
      id: usuario.id,
      email: usuario.email,
      dni: usuario.dni,
      roles: usuario.roles,
      activo: usuario.activo,
      nombreUsuario: usuario.nombreUsuario,
      numTel: usuario.numTel,
      direccion: usuario.direccion,
      fechaNacimiento: usuario.fechaNacimiento,
    },
    perfil,
  };
};
