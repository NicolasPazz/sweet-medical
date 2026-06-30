import axios from 'axios';
import { getApiBaseUrl } from '../lib/api-utils.js';
import { generateBasicAuthHeader } from './ParserB64.js';

const headers = (email, password) => ({
  Authorization: generateBasicAuthHeader(email, password),
  'Content-Type': 'application/json',
});

// El admin da de alta un paciente (queda inactivo hasta que se le asigne credenciales).
export const crearPacienteAdmin = async ({ email, password, dni, nombre }) => {
  const res = await axios.post(
    `${getApiBaseUrl()}/admins/paciente`,
    { dni, nombre },
    { headers: headers(email, password) },
  );
  return res.data?.data ?? res.data;
};

// El admin da de alta un médico (queda inactivo hasta que se le asigne credenciales).
export const crearMedicoAdmin = async ({ email, password, dni, nombre, matricula }) => {
  const res = await axios.post(
    `${getApiBaseUrl()}/admins/medico`,
    { dni, nombre, matricula },
    { headers: headers(email, password) },
  );
  return res.data?.data ?? res.data;
};
