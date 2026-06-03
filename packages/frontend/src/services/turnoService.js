import api from './api-client';

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

export const reservarTurno = async (data) => {
  const res = await api.patch('/turnos/paciente/reserva', data);
  return res.data;
};

export const getHistorialPaciente = async (idUsuario) => {
  const res = await api.get(`/pacientes/${idUsuario}/turnos`);
  return res.data;
};

