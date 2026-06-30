import { adminService } from '../services/AdminService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { DiaSemana } from '../utils/enum/DiaSemana.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/AppError.js';

export class AdminController {
    constructor({ adminService: svc = adminService } = {}) {
        this.adminService = svc;
    }

    /**
       * POST /admin/crear-paciente
       * El admin da de alta un paciente: crea el Usuario con DNI + nombre (inactivo).
       * El perfil Paciente se crea vacío apuntando al Usuario.
       */
    async crearPacienteAdmin({ dni, nombre }) {
        if (!dni || !nombre) {
            throw new BadRequestError('dni y nombre son obligatorios');
        }

        const existente = await this.usuarioService.findByDni(dni);
        if (existente) {
            throw new ConflictError(`Ya existe un usuario con DNI ${dni}`);
        }

        const usuario = await this.usuarioService.save({
            dni,
            roles: ['PACIENTE'],
            activo: false,
        });

        const paciente = await this.pacienteService.crearPaciente({ usuario, nombre });

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

        const existente = await this.usuarioService.findByDni(dni);
        if (existente) {
            throw new ConflictError(`Ya existe un usuario con DNI ${dni}`);
        }

        const usuario = await this.usuarioService.save({
            dni,
            roles: ['MEDICO'],
            activo: false,
        });

        const medico = await this.medicoService.crearMedico({ usuario, matricula, nombre });

        return { usuario, medico };
    }

}
