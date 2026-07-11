import axios from 'axios';
import { getApiBaseUrl } from '../lib/api-utils.js';
import { generateBasicAuthHeader } from './ParserB64.js';

const headers = (email, password) => ({
  Authorization: generateBasicAuthHeader(email, password),
  'Content-Type': 'application/json',
});

// Centraliza el cálculo del rol "de presentación" a partir de los roles crudos
// del backend (que pueden incluir MEDICO, PACIENTE, ADMIN, etc).
// Devuelve 'Médico' | 'Paciente' | 'Admin' | null.
// IMPORTANTE: nunca asumir 'Paciente' por defecto si no se reconoce el rol,
// para no exponer funcionalidades de paciente a roles como ADMIN.
export const getRolUsuario = (roles) => {
  if (!roles || roles.length === 0) return null;
  if (roles.includes('ADMIN')) return 'Admin';
  if (roles.includes('MEDICO')) return 'Médico';
  if (roles.includes('PACIENTE')) return 'Paciente';
  return null;
};

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
  const response = await axios.get(`${getApiBaseUrl()}/medicos/me/sedes`, {
    headers: headers(email, password),
  });
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

export const getNotificacionesNoLeidas = async ({ email, password }) => {
  const response = await axios.get(`${getApiBaseUrl()}/notificaciones/no-leidas`, {
    headers: headers(email, password),
  });
  return response.data.data;
};

export const marcarNotificacionLeida = async ({ email, password, idNotificacion }) => {
  const response = await axios.patch(
    `${getApiBaseUrl()}/notificaciones/${idNotificacion}`,
    {},
    { headers: headers(email, password) },
  );
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

export const getHistorialPacienteByMedico = async ({ email, password, dni }) => {
  const response = await axios.get(`${getApiBaseUrl()}/pacientes/${dni}/turnos`, {
    headers: headers(email, password),
  });
  return response.data;
};
