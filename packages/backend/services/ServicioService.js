import { Especialidad } from "../domain/servicios/Especialidad.js";
import { Practica } from "../domain/servicios/Practica.js";
import { servicioRepository } from "../repositories/ServicioRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { Usuario } from "../domain/usuario/Usuario.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../errors/AppError.js";
import { ValidadorId } from "../domain/utils/ValidadorId.js";

export class ServicioService {

  constructor() {
    this.servicioRepository = servicioRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async verificarUsuarioSistema(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    const usuario = await this.usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }
    if (usuario.nombreUsuario !== Usuario.USUARIO_SISTEMA.nombreUsuario) {
      throw new ForbiddenError("Solo el usuario Sistema puede realizar esta operación");
    }
  }

  obtenerTodos() {
    return this.servicioRepository.obtenerTodos();
  }

  obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const servicio = this.servicioRepository.obtenerPorId(id);
    if (!servicio) {
      throw new NotFoundError("Servicio no encontrado");
    }
    return servicio;
  }

  async agregar(idUsuario, datosServicio) {
    await this.verificarUsuarioSistema(idUsuario);

    let servicio;
    if (datosServicio.tipo === "ESPECIALIDAD") {
      servicio = new Especialidad(
        datosServicio.nombre,
        datosServicio.duracionTurnoEnMins,
        datosServicio.costo
      );
    } else if (datosServicio.tipo === "PRACTICA") {
      servicio = new Practica(
        datosServicio.codigo,
        datosServicio.nombre,
        datosServicio.duracionTurnoEnMins,
        datosServicio.costo
      );
    } else {
      throw new BadRequestError("Tipo de servicio inválido");
    }

    return this.servicioRepository.guardar(servicio, datosServicio.tipo);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);

    const servicio = this.servicioRepository.obtenerPorId(id);
    if (!servicio) {
      throw new NotFoundError("Servicio no encontrado");
    }

    return this.servicioRepository.modificar(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);

    const servicio = this.servicioRepository.obtenerPorId(id);
    if (!servicio) {
      throw new NotFoundError("Servicio no encontrado");
    }

    return this.servicioRepository.eliminar(id);
  }
}
