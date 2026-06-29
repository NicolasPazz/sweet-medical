import axios from 'axios';
import { getApiBaseUrl } from '../lib/api-utils.js';
import { generateBasicAuthHeader } from './ParserB64.js';

const headers = (email, password) => ({
  Authorization: generateBasicAuthHeader(email, password),
  'Content-Type': 'application/json',
});

export const getMe = async ({ email, password }) => {
  const response = await axios.get(`${getApiBaseUrl()}/usuarios/me`, {
    headers: headers(email, password),
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

export const agregarSede = async ({ email, password, nombre, direccion }) => {
  const response = await axios.post(
    `${getApiBaseUrl()}/medicos/me/sedes`,
    { nombre, direccion },
    { headers: headers(email, password) },
  );
  return response.data;
};

export const getSedesMe = async ({ email, password }) => {
  const response = await axios.get(
    `${getApiBaseUrl()}/medicos/me/sedes`,
    { headers: headers(email, password) },
  );
  return response.data.data;
};

export const getMedicoByUser = async ({ email, password }) => {
  const response = await axios.get(`${getApiBaseUrl()}/medicos/`, {
    headers: headers(email, password),
  });
  return response.data;
};

export const getTurnosMedico = async ({ email, password }) => {
  const response = await axios.get(`${getApiBaseUrl()}/medicos/me/turnos`, {
    headers: headers(email, password),
  });
  return response.data.data;
};

export const getHistorialPacienteMe = async ({ email, password }) => {
  const response = await axios.get(`${getApiBaseUrl()}/pacientes/me/turnos`, {
    headers: headers(email, password),
  });
  return response.data.data;
};

export const actualizarDisponibilidad = async ({ email, password, disponibilidades }) => {
  const response = await axios.patch(
    `${getApiBaseUrl()}/medicos/disponibilidad`,
    { disponibilidades },
    { headers: headers(email, password) },
  );
  return response.data;
};
