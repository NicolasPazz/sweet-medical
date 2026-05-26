import { notificacionRepository } from '../infrastructure/repositories/NotificacionRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { Notificacion } from '../domain/notificacion/Notificacion.js';
import { NotFoundError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { FactoryNotificacion } from '../domain/notificacion/FactoryNotificacion.js';

export class NotificacionService {
  constructor({
    notificacionRepository: notificacionRepo = notificacionRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
  } = {}) {
    this.notificacionRepository = notificacionRepo;
    this.usuarioRepository = usuarioRepo;
  }

  async obtenerLeidas(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    return await this.notificacionRepository.findAllReadByUserId(idUsuario);
  }

  async obtenerNoLeidas(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    return await this.notificacionRepository.findAllUnreadByUserId(idUsuario);
  }

  async marcarComoLeida(id, idUsuario) {
    ValidadorId.validarIds(id, idUsuario);

    const notificacion = await this.notificacionRepository.findById(id);

    if (!notificacion) {
      throw new NotFoundError('Notificación no encontrada');
    }

    const rawId = notificacion.populated('destinatario') || notificacion.destinatario;
    const idDestinatario = rawId ? rawId.toString() : null;

    if (idDestinatario !== String(idUsuario)) {
      throw new NotFoundError('Notificación no encontrada');
    }

    return await this.notificacionRepository.markAsRead(id);
  }

  async save(datosNotificacion) {
    ValidadorId.validarIds(datosNotificacion.destinatario, datosNotificacion.remitente);

    const notificacion = new Notificacion(
      datosNotificacion.destinatario,
      datosNotificacion.remitente,
      datosNotificacion.mensaje,
    );
    return await this.notificacionRepository.save(notificacion);
  }

  async generarNotificacionesRecordatorias(turnosDeManiana, usuario) {
    let notificaciones = [];
    for (const t of turnosDeManiana) {
      // Crear recordatorio tanto para el médico como para el paciente
      notificaciones = FactoryNotificacion.crearRecordatoriosActores(usuario, t);
      for (let n of notificaciones) {
        this.notificacionRepository.save(n);
      }
    }

    return notificaciones.length;
  }
}

export const notificacionService = new NotificacionService();
