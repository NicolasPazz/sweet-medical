import { usuarioService } from '../services/UsuarioService.js';
import { medicoService } from '../services/MedicoService.js';
import { pacienteService } from '../services/PacienteService.js';

export class UsuarioController {
  constructor({
    usuarioService: usuarioSvc = usuarioService,
    medicoService: medicoSvc = medicoService,
    pacienteService: pacienteSvc = pacienteService,
  } = {}) {
    this.usuarioService = usuarioSvc;
    this.medicoService = medicoSvc;
    this.pacienteService = pacienteSvc;
  }

  /**
   * GET /usuarios/me
   * Requiere Basic Auth. Devuelve el usuario autenticado con su perfil (médico o paciente).
   */
  me = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;

      let perfil = null;

      if (usuario.roles.includes('MEDICO')) {
        perfil = await this.medicoService.findByUsuarioId(usuario.id);
      } else if (usuario.roles.includes('PACIENTE')) {
        perfil = await this.pacienteService.findByUsuarioId(usuario.id);
      }

      return res.status(200).json({
        status: 'success',
        data: { usuario, perfil },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const usuarioController = new UsuarioController();
