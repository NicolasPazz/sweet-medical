import api from "./api-client.js";

export async function getAllEspecialidadesByMedic(id_usuario) {
  const respuesta = await api.get(`/especialidades/all/${id_usuario}`);
  return respuesta.data?.data ?? [];
}

export async function getAllPracticaByMedic(id_usuario) {
  const respuesta = await api.get(`/practicas/all/${id_usuario}`);
  return respuesta.data?.data ?? [];
}

export async function agregarEspecialidadAMedico(especialidad, id_usuario) {
  const respuesta = await api.post(`/especialidades/usuario/${id_usuario}`, especialidad);
  return respuesta.status;
}

export async function agregarPracticaAMedico(practica, id_usuario) {
  const respuesta = await api.post(`/practicas/usuario/${id_usuario}`, practica);
  return respuesta.status;
}

export async function eliminarEspecialidadAMedico(especialidad, id_usuario) {
  const respuesta = await api.delete(`/especialidades/usuario/${id_usuario}`, { data: especialidad });
  return respuesta.status;
}

export async function eliminarPracticaAMedico(practica, id_usuario) {
  const respuesta = await api.delete(`/practicas/usuario/${id_usuario}`, { data: practica });
  return respuesta.status;
}


