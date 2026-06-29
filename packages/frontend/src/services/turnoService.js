import api from './api-client';
import axios from 'axios';
import { generateBasicAuthHeader } from './ParserB64.js';
import { getApiBaseUrl } from '../lib/api-utils.js';

const authHeaders = (email, password) => ({
  Authorization: generateBasicAuthHeader(email, password),
  'Content-Type': 'application/json',
});

export const getMedicos = async () => {
  const res = await api.get('/medicos/all');
  return res.data;
};

export const getEspecialidades = async () => {
  const res = await api.get('/especialidades');
  return res.data;
};

export const getPracticas = async () => {
  const res = await api.get('/practicas');
  return res.data;
};

export const getSedes = async () => {
  const res = await api.get('/sedes');
  return res.data;
};

export const getPacientes = async () => {
  const res = await api.get('/pacientes/all');
  return res.data;
};

export const buscarTurnosDisponibles = async (params) => {
  const res = await api.get('/turnos/disponibles', { params });
  return res.data;
};

export const getFechasDisponibles = async (params) => {
  const res = await api.get('/turnos/disponibilidad/fechas', { params });
  return res.data;
};

export const getHorariosDisponibles = async (params) => {
  const res = await api.get('/turnos/disponibilidad/horarios', { params });
  return res.data;
};

export const reservarTurno = async (data, email, password) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/turnos/paciente/reserva`,
    data,
    { headers: authHeaders(email, password) },
  );
  return res.data;
};

export const cancelarTurno = async (id_turno, motivo, email, password) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/turnos/me/cancelacion/${id_turno}`,
    { motivo },
    { headers: authHeaders(email, password) },
  );
  return res.data;
};

export const confirmarTurno = async (id_turno, email, password, id_sede) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/turnos/me/confirmar/${id_turno}`,
    id_sede ? { id_sede } : {},
    { headers: authHeaders(email, password) },
  );
  return res.data;
};

export const finalizarTurno = async (id_turno, email, password) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/turnos/me/realizado/${id_turno}`,
    {},
    { headers: authHeaders(email, password) },
  );
  return res.data;
};

export const proponerReprogramacion = async (id_turno, fecha, hora, motivo, email, password) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/turnos/me/propuesta-reprogramacion/${id_turno}`,
    { fecha, hora, motivo },
    { headers: authHeaders(email, password) },
  );
  return res.data;
};

export const responderReprogramacion = async (id_turno, aceptado, email, password) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/turnos/me/responder-reprogramacion/${id_turno}`,
    { aceptado },
    { headers: authHeaders(email, password) },
  );
  return res.data;
};

export const getHistorialPaciente = async (idUsuario) => {
  const res = await api.get(`/pacientes/${idUsuario}/turnos`);
  return res.data;
};
