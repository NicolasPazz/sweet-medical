import { Usuario } from '../domain/usuario/Usuario.js';
import { Medico } from '../domain/usuario/Medico.js';
import { Paciente } from '../domain/usuario/Paciente.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { DisponibilidadHoraria } from '../domain/agenda/DisponibilidadHoraria.js';
import { DiaSemana } from '../domain/utils/enum/DiaSemana.js';
import { Especialidad } from '../domain/servicios/Especialidad.js';
import { BadRequestError } from '../errors/AppError.js';
import { MedicoService } from '../services/MedicoService.js';
import { Practica } from '../domain/servicios/Practica.js';
import { ValidadorId } from '../domain/utils/ValidadorId.js';

export class MedicoController {
  constructor({ medicoService = new MedicoService() } = {}) {
    this.usuarioRepository = usuarioRepository;
    this.medicoRepository = medicoRepository;
    this.pacienteRepository = pacienteRepository;
    this.medicoService = medicoService;
  }

  cargarDatosIniciales = async (req, res, next) => {
    try {
      const catalogoEspecialidades = [
        new Especialidad('Pediatría', 30, 5000),
        new Especialidad('Kinesiología', 45, 4500),
        new Especialidad('Cardiología', 20, 7000),
        new Especialidad('General', 15, 3500),
      ];

      const practica = new Practica('Codigo-1', 'Radiografía', 30, 4500);

      catalogoEspecialidades.forEach((especialidad, i) => {
        especialidad.id = i + 1; // i arranca en 0, le sumamos 1 si querés que el ID empiece en 1
      });

      for (let i = 1; i <= 10; i++) {
        // 1. Creamos el objeto Usuario (Credenciales)
        const nombreUsuario = `medico${i}`;
        const password = `pass123_${i}`;
        const nuevoUsuario = new Usuario(nombreUsuario, password);

        // 2. Creamos el objeto Medico vinculando el usuario anterior
        const matricula = `MAT-${1000 + i}`;
        const nombreCompleto = `Dr. Especialista ${i}`;
        const nuevoMedico = new Medico(nuevoUsuario, matricula, nombreCompleto);

        const primerDia = i % 2 === 0 ? DiaSemana.LUNES : DiaSemana.MARTES;
        const segundoDia = i % 2 === 0 ? DiaSemana.MIERCOLES : DiaSemana.JUEVES;

        const especialidadAsignada = catalogoEspecialidades[i % catalogoEspecialidades.length];

        const disponibilidades = [
          new DisponibilidadHoraria(primerDia, '08:00', '12:00'),
          new DisponibilidadHoraria(segundoDia, '14:00', '18:00'),
        ];

        nuevoMedico.disponibilidades = disponibilidades;
        nuevoMedico.especialidades.push(especialidadAsignada);

        if (i == 1) {
          nuevoMedico.especialidades.push(catalogoEspecialidades[2]);
          nuevoMedico.practicas.push(practica);
        }

        nuevoUsuario.roles.push(nuevoMedico);
        // Agregamos a la lista de resultados
        this.usuarioRepository.save(nuevoUsuario);
        this.medicoRepository.save(nuevoMedico);
      }

      for (let i = 1; i <= 5; i++) {
        // 1. Creamos el objeto Usuario (Credenciales)
        const nombreUsuario = `paciente${i}`;
        const password = `pass123_${i}`;
        const nuevoUsuario = new Usuario(nombreUsuario, password);

        // 2. Creamos el objeto Paciente vinculando el usuario anterior
        const dni = `${40000000 + i}`;
        const nombre = `Paciente Prueba ${i}`;
        const obraSocial = i % 2 === 0 ? 'OSDE' : 'Swiss Medical';
        const plan = i % 2 === 0 ? '210' : 'Básico';
        const nuevoPaciente = new Paciente(nuevoUsuario, dni, nombre, obraSocial, plan);

        nuevoUsuario.roles.push(nuevoPaciente);

        // 3. Persistimos
        this.usuarioRepository.save(nuevoUsuario);
        this.pacienteRepository.save(nuevoPaciente);
      }

      return res.status(201).json({
        status: 'success',
        data: 'Carga completada',
      });
    } catch (error) {
      return next(error);
    }
  };

  leerMedicos = async (req, res, next) => {
    try {
      const medicos = await this.medicoRepository.findAll();

      const dataParaEnviar = medicos.map((m) => ({
        id_usuario: m.usuario.id,
        id_medico: m.id,
        nombre: m.nombre,
        especialidades: m.especialidades,
        practicas: m.practicas,
        disponibilidades: m.disponibilidades,
        turnos: m.turnosActualesYFuturos.map((turno) => ({
          id: turno.id,
          fecha: turno.fechaHora ? turno.fechaHora : 'N/A', // El objeto Date completo [cite: 1145]
          medico: turno.medico.nombre,
          servicio: turno.servicio ? turno.servicio.nombre : 'Consulta General',
          sede: turno.sede ? turno.sede.nombre : 'N/A', // Solo el nombre de la sede para evitar objetos pesados [cite: 1201]
          estado: turno.estado ? turno.estado.constructor.name : 'N/A',
          costoPaciente: turno.costo, // Monto ya calculado según el plan [cite: 2337]
          horario: turno.hora,
          diaSemana: turno.diaSemana,
        })),
      }));

      return res.status(200).json({
        status: 'success',
        data: dataParaEnviar,
      });
    } catch (error) {
      return next(error);
    }
  };

  actualizarDisponibilidad = async (req, res, next) => {
    try {
      const { disponibilidades } = req.body;
      const idMedico = this.parsearId(req.body.id_medico);

      if (!Array.isArray(disponibilidades)) {
        throw new BadRequestError('Se esperaba una lista de disponibilidades');
      }

      const formatoValido = disponibilidades.every(
        (item) =>
          item.diaSemana &&
          typeof item.horaDesde === 'string' &&
          typeof item.horaHasta === 'string',
      );

      if (!formatoValido) {
        throw new BadRequestError('Uno o más elementos no cumplen con el formato requerido');
      }

      if (
        !disponibilidades.every((d) =>
          Object.values(DiaSemana).includes(d.diaSemana.trim().toUpperCase()),
        )
      ) {
        throw new BadRequestError('Días de semana no válidos recibidos');
      }

      await this.medicoService.actualizarDisponibilidad(idMedico, disponibilidades);

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      return next(error);
    }
  };

  parsearId(valor) {
    const id = Number(valor);
    ValidadorId.validarIds(id);
    return id;
  }
}
