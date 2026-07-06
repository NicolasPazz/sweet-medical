import { ConflictError, BadRequestError } from '../errors/AppError.js';
import { usuarioService } from './UsuarioService.js';
import { medicoService } from './MedicoService.js';
import { pacienteService } from './PacienteService.js';
import { Rol } from '../domain/usuario/Rol.js';

export class AdminService {
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
   * POST /admin/crear-paciente
   * El admin da de alta un paciente: crea el Usuario con DNI + nombre (inactivo).
   * El perfil Paciente se crea vacío apuntando al Usuario.
   */
  async crearPacienteAdmin({ dni, nombre, obraSocial, plan }) {
    if (!dni || !nombre) {
      throw new BadRequestError('dni y nombre son obligatorios');
    }

    const existente = await this.usuarioService.findByDniAndRole(dni, Rol.PACIENTE);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario paciente con DNI ${dni}`);
    }

    const usuario = await this.usuarioService.save({
      dni,
      roles: ['PACIENTE'],
      activo: false,
    });

    const paciente = await this.pacienteService.crearPaciente({
      usuario,
      nombre,
      obraSocial,
      plan,
    });

    return { usuario, paciente };
  }

  /**
   * POST /admin/crear-medico
   * El admin da de alta un médico: crea el Usuario con DNI + nombre (inactivo)
   * y el perfil Medico con matrícula.
   */
  async crearMedicoAdmin({ dni, nombre, matricula }) {
    if (!dni || !nombre || !matricula) {
      throw new BadRequestError('dni, nombre y matricula son obligatorios');
    }

    const existente = await this.usuarioService.findByDniAndRole(dni, Rol.MEDICO);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario médico con DNI ${dni}`);
    }

    const usuario = await this.usuarioService.save({
      dni,
      roles: ['MEDICO'],
      activo: false,
    });

    const medico = await this.medicoService.crearMedico({ usuario, matricula, nombre });

    return { usuario, medico };
  }

  /**
   * POST /admin/usuario
   * Crear un usuario con uno o más roles (Paciente y/o Médico).
   * Si se selecciona Paciente, crea el perfil Paciente.
   * Si se selecciona Médico, crea el perfil Médico.
   */
  async crearUsuarioAdmin({ dni, nombre, matricula, obraSocial, plan, roles = [] }) {
    if (!dni || !nombre) {
      throw new BadRequestError('dni y nombre son obligatorios');
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      throw new BadRequestError('Debés seleccionar al menos un rol (PACIENTE o MEDICO)');
    }

    const rolesValidos = ['PACIENTE', 'MEDICO'];
    const rolesNormalizados = roles
      .map((r) => r.toUpperCase())
      .filter((r) => rolesValidos.includes(r));

    if (rolesNormalizados.length === 0) {
      throw new BadRequestError('Los roles deben ser PACIENTE o MEDICO');
    }

    if (rolesNormalizados.includes('MEDICO') && !matricula) {
      throw new BadRequestError('matricula es obligatoria para crear un Médico');
    }

    // La validación de obraSocial/plan (el paciente puede no tener obra
    // social, pero no puede tener un plan sin obra social) la hace
    // pacienteService.crearPaciente, punto único para ambos flujos de alta
    // de paciente (este endpoint y /admins/paciente).

    // Verificar que no exista usuario con ese DNI para esos roles
    for (const rol of rolesNormalizados) {
      const existente = await this.usuarioService.findByDniAndRole(dni, rol);
      if (existente) {
        throw new ConflictError(`Ya existe un usuario ${rol} con DNI ${dni}`);
      }
    }

    // Crear el usuario base con todos los roles seleccionados
    const usuario = await this.usuarioService.save({
      dni,
      roles: rolesNormalizados,
      activo: false,
    });

    const resultado = { usuario, paciente: null, medico: null };

    // Crear el perfil Paciente si está en los roles
    if (rolesNormalizados.includes('PACIENTE')) {
      resultado.paciente = await this.pacienteService.crearPaciente({
        usuario,
        nombre,
        obraSocial,
        plan,
      });
    }

    // Crear el perfil Médico si está en los roles
    if (rolesNormalizados.includes('MEDICO')) {
      resultado.medico = await this.medicoService.crearMedico({
        usuario,
        matricula: matricula.trim(),
        nombre,
      });
    }

    return resultado;
  }
}

export const adminService = new AdminService();
