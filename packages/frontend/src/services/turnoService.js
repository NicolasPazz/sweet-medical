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
