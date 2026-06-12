import api from "./api-client.js";

export async function getAllEspecialidadesByMedic(id_usuario) {
  const respuesta = await api.get(`/especialidades/all/${id_usuario}`);
  return respuesta.data?.data ?? [];
}

export async function getAllPracticaByMedic(id_usuario) {
  const respuesta = await api.get(`/practicas/all/${id_usuario}`);
  return respuesta.data?.data ?? [];
}
