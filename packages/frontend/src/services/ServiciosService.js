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

// ─── ABM general de servicios (uso del panel de Administrador) ────────────
// Las rutas /especialidades y /practicas validan en el back que idUsuario
// corresponda al usuario SISTEMA (el único usuario con rol ADMIN del sistema).

const normalizarServicio = (item) => ({ ...item, id: item.id ?? item._id?.toString() });

export async function crearEspecialidadAdmin({
  email,
  password,
  idUsuario,
  nombre,
  duracionTurnoEnMins,
  costo,
}) {
  const res = await axios.post(
    `${getApiBaseUrl()}/especialidades`,
    { idUsuario, nombre, duracionTurnoEnMins, costo },
    { headers: authHeaders(email, password) },
  );
  return normalizarServicio(res.data?.data);
}

export async function modificarEspecialidadAdmin({ email, password, idUsuario, id, datos }) {
  const res = await axios.patch(
    `${getApiBaseUrl()}/especialidades/${id}`,
    { idUsuario, ...datos },
    { headers: authHeaders(email, password) },
  );
  return normalizarServicio(res.data?.data);
}

export async function eliminarEspecialidadAdmin({ email, password, idUsuario, id }) {
  const res = await axios.delete(`${getApiBaseUrl()}/especialidades/${id}`, {
    headers: authHeaders(email, password),
    data: { idUsuario },
  });
  return res.status;
}

export async function crearPracticaAdmin({
  email,
  password,
  idUsuario,
  codigo,
  nombre,
  duracionTurnoEnMins,
  costo,
}) {
  const res = await axios.post(
    `${getApiBaseUrl()}/practicas`,
    { idUsuario, codigo, nombre, duracionTurnoEnMins, costo },
    { headers: authHeaders(email, password) },
  );
  return normalizarServicio(res.data?.data);
}

export async function modificarPracticaAdmin({ email, password, idUsuario, id, datos }) {
  const res = await axios.patch(
    `${getApiBaseUrl()}/practicas/${id}`,
    { idUsuario, ...datos },
    { headers: authHeaders(email, password) },
  );
  return normalizarServicio(res.data?.data);
}

export async function eliminarPracticaAdmin({ email, password, idUsuario, id }) {
  const res = await axios.delete(`${getApiBaseUrl()}/practicas/${id}`, {
    headers: authHeaders(email, password),
    data: { idUsuario },
  });
  return res.status;
}
