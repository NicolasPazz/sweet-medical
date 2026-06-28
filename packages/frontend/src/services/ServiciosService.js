import axios from 'axios';
import { getApiBaseUrl } from '../lib/api-utils.js';
import { generateBasicAuthHeader } from './ParserB64.js';

const authHeaders = (email, password) => ({
  Authorization: generateBasicAuthHeader(email, password),
  'Content-Type': 'application/json',
});

export async function getAllEspecialidadesByMedic({ email, password }) {
  const res = await axios.get(`${getApiBaseUrl()}/especialidades/me`, {
    headers: authHeaders(email, password),
  });
  return res.data?.data ?? [];
}

export async function getAllPracticaByMedic({ email, password }) {
  const res = await axios.get(`${getApiBaseUrl()}/practicas/me`, {
    headers: authHeaders(email, password),
  });
  return res.data?.data ?? [];
}

export async function agregarEspecialidadAMedico({ email, password, especialidad }) {
  const res = await axios.post(
    `${getApiBaseUrl()}/especialidades/me`,
    { id: especialidad.id },
    { headers: authHeaders(email, password) },
  );
  return res.status;
}

export async function agregarPracticaAMedico({ email, password, practica }) {
  const res = await axios.post(
    `${getApiBaseUrl()}/practicas/me`,
    { id: practica.id },
    { headers: authHeaders(email, password) },
  );
  return res.status;
}

export async function eliminarEspecialidadAMedico({ email, password, especialidad }) {
  const res = await axios.delete(`${getApiBaseUrl()}/especialidades/me`, {
    headers: authHeaders(email, password),
    data: { id: especialidad.id },
  });
  return res.status;
}

export async function eliminarPracticaAMedico({ email, password, practica }) {
  const res = await axios.delete(`${getApiBaseUrl()}/practicas/me`, {
    headers: authHeaders(email, password),
    data: { id: practica.id },
  });
  return res.status;
}
