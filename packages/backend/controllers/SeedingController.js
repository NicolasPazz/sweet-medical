import { Usuario } from '../domain/usuario/Usuario.js';
import { Medico } from '../domain/usuario/Medico.js';
import { Paciente } from '../domain/usuario/Paciente.js';
import { Especialidad } from '../domain/servicios/Especialidad.js';
import { Practica } from '../domain/servicios/Practica.js';
import { Sede } from '../domain/servicios/Sede.js';
import { PlanPrepaga } from '../domain/cobertura/PlanPrepaga.js';
import { PlanParticular } from '../domain/cobertura/PlanParticular.js';
import { Rol } from '../domain/usuario/Rol.js';

import { DiaSemana } from '../utils/enum/DiaSemana.js';
import { NivelCobertura } from '../domain/cobertura/NivelCobertura.js';
import { logger } from '../utils/logger.js';

import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { especialidadRepository } from '../infrastructure/repositories/EspecialidadRepository.js';
import { practicaRepository } from '../infrastructure/repositories/PracticaRepository.js';
import { sedeRepository } from '../infrastructure/repositories/SedeRepository.js';
import { planRepository } from '../infrastructure/repositories/PlanRepository.js';
import { obraSocialRepository } from '../infrastructure/repositories/obraSocialRepository.js';
import { turnoRepository } from '../infrastructure/repositories/TurnoRepository.js';

import { turnoService } from '../services/TurnoService.js';

import { UsuarioModel } from '../infrastructure/schemas/UsuarioSchema.js';
import { MedicoModel } from '../infrastructure/schemas/MedicoSchema.js';
import { PacienteModel } from '../infrastructure/schemas/PacienteSchema.js';
import { EspecialidadModel } from '../infrastructure/schemas/EspecialidadSchema.js';
import { PracticaModel } from '../infrastructure/schemas/PracticaSchema.js';
import { SedeModel } from '../infrastructure/schemas/SedeSchema.js';
import { PlanModel } from '../infrastructure/schemas/PlanSchema.js';
import { ObraSocialModel } from '../infrastructure/schemas/ObraSocialSchema.js';

export class SeedingController {
  constructor() {
    this.usuarioRepository = usuarioRepository;
    this.medicoRepository = medicoRepository;
    this.pacienteRepository = pacienteRepository;
    this.especialidadRepository = especialidadRepository;
    this.practicaRepository = practicaRepository;
    this.sedeRepository = sedeRepository;
    this.planRepository = planRepository;
    this.obraSocialRepository = obraSocialRepository;
    this.turnoRepository = turnoRepository;
    this.turnoService = turnoService;
  }

  cargarDatosIniciales = async (req, res, next) => {
    try {
      // 0. Cargar sedes
      await this.sedeRepository.deleteAll();
      await SedeModel.syncIndexes();

      const sedes = [
        new Sede('Clinica 1', 'Av Medrano 951'),
        new Sede('Clinica 2', 'Av Rivadavia 123'),
        new Sede('Clinica 3', 'Av 9 de Julio 456'),
      ];

      const sedesGuardadas = await this.sedeRepository.saveAll(sedes);

      logger.info(`Se cargaron ${sedesGuardadas.length} sedes.`);

      // 1. Cargar especialidades
      await this.especialidadRepository.deleteAll();
      await EspecialidadModel.syncIndexes();

      const especialidades = [
        new Especialidad('Cardiología', 30, 7000),
        new Especialidad('Pediatría', 30, 5000),
        new Especialidad('Dermatología', 20, 6000),
        new Especialidad('Kinesiología', 45, 4500),
        new Especialidad('Oftalmología', 20, 5500),
        new Especialidad('Traumatología', 30, 6500),
        new Especialidad('Gastroenterología', 30, 7000),
        new Especialidad('Neurología', 45, 8000),
        new Especialidad('Odontología', 40, 6000),
        new Especialidad('Psiquiatría', 45, 7500),
        new Especialidad('General', 15, 3500),
      ];

      const especialidadesGuardadas = await this.especialidadRepository.saveAll(especialidades);

      logger.info(`Se cargaron ${especialidadesGuardadas.length} especialidades.`);

      // 2. Cargar prácticas
      await this.practicaRepository.deleteAll();
      await PracticaModel.syncIndexes();

      const practicas = [
        new Practica('ELEC', 'Electrocardiograma', 30, 7000),
        new Practica('FONDO_OJOS', 'Fondo de ojos', 30, 5000),
        new Practica('LIMP_F', 'Limpieza facial', 20, 6000),
      ];

      const practicasGuardadas = await this.practicaRepository.saveAll(practicas);

      logger.info(`Se cargaron ${practicasGuardadas.length} prácticas.`);

      // 3. Cargar planes
      await this.planRepository.deleteAll();
      await PlanModel.syncIndexes();

      const planBasico = new PlanPrepaga('Básico');
      const planPremium = new PlanPrepaga('Premium');
      const planParticular = new PlanParticular();

      planBasico.coberturasEspecialidad = [
        { especialidad: especialidadesGuardadas[0]._id, nivel: NivelCobertura.TOTAL },
        { especialidad: especialidadesGuardadas[1]._id, nivel: NivelCobertura.PARCIAL },
        { especialidad: especialidadesGuardadas[5]._id, nivel: NivelCobertura.TOTAL },
      ];
      planBasico.coberturasPractica = [
        { practica: practicasGuardadas[0]._id, nivel: NivelCobertura.PARCIAL },
      ];

      planPremium.coberturasEspecialidad = especialidadesGuardadas.map((esp) => ({
        especialidad: esp._id,
        nivel: NivelCobertura.TOTAL,
      }));
      planPremium.coberturasPractica = practicasGuardadas.map((prac) => ({
        practica: prac._id,
        nivel: NivelCobertura.TOTAL,
      }));

      const planes = [planBasico, planPremium, planParticular];

      const planesGuardados = await this.planRepository.saveAll(planes);

      logger.info(`Se cargaron ${planesGuardados.length} planes.`);

      // 4. Cargar obras sociales
      await this.obraSocialRepository.deleteAll();
      await ObraSocialModel.syncIndexes();

      const obrasSociales = [
        {
          nombre: 'OSDE',
          planes: [planesGuardados[0]._id],
        },
        {
          nombre: 'Swiss Medical',
          planes: [planesGuardados[1]._id],
        },
        {
          nombre: 'Galeno',
          planes: [planesGuardados[1]._id],
        },
        {
          nombre: 'IOMA',
          planes: [planesGuardados[0]._id],
        },
      ];

      const obrasSocialesGuardadas = await this.obraSocialRepository.saveAll(obrasSociales);

      logger.info(`Se cargaron ${obrasSocialesGuardadas.length} obras sociales.`);

      // 5. Cargar usuarios
      await this.usuarioRepository.deleteAll();
      await UsuarioModel.syncIndexes();

      const usuariosMedicosGenerados = [];
      const usuariosPacientesGenerados = [];
      const usuariosAdminsGenerados = [];

      // NO TOCAR!!!!!!!!!!
      const usuarioSistema = new Usuario('SISTEMA', '12345678');
      usuarioSistema.roles.push(Rol.ADMIN);
      usuariosAdminsGenerados.push(usuarioSistema);
      //

      await this.usuarioRepository.saveAll(usuarioSistema);

      // Registrar el usuario SISTEMA para que los turnos generados por el batch tengan usuario válido
      const usuarioSistemaGuardado = await this.usuarioRepository.findUsuarioSistema();
      Usuario.setUsuarioSistema(usuarioSistemaGuardado);

      logger.info(`Se cargó usuario admin_sweet.`);

      // Generar lotes de Médicos
      for (let i = 1; i <= 10; i++) {
        const usuarioMedico = new Usuario(`medico${i}`, `pass123_${i}`);
        usuarioMedico.roles.push(Rol.MEDICO);
        usuariosMedicosGenerados.push(usuarioMedico);
      }
      const usuariosMedicosGuardados =
        await this.usuarioRepository.saveAll(usuariosMedicosGenerados);

      // Generar lotes de Pacientes
      for (let i = 1; i <= 40; i++) {
        const usuarioPaciente = new Usuario(`paciente${i}`, `pass123_${i}`);
        usuarioPaciente.roles.push(Rol.PACIENTE);
        usuariosPacientesGenerados.push(usuarioPaciente);
      }
      const usuariosPacientesGuardados = await this.usuarioRepository.saveAll(
        usuariosPacientesGenerados,
      );

      logger.info(
        `Se cargaron ${usuariosMedicosGuardados.length + usuariosPacientesGuardados.length} usuarios profesionales y pacientes.`,
      );

      // 6. Cargar médicos
      await this.medicoRepository.deleteAll();
      await MedicoModel.syncIndexes();

      const medicos = [];
      const dias = Object.values(DiaSemana);

      for (let i = 0; i < usuariosMedicosGuardados.length; i++) {
        const usuarioDb = usuariosMedicosGuardados[i];

        const matricula = `MAT-${1000 + i}`;
        const nombreCompleto = `Dr. Especialista ${i + 1}`;

        const nuevoMedico = new Medico(usuarioDb.id || usuarioDb._id, matricula, nombreCompleto);

        nuevoMedico.especialidades = [
          especialidadesGuardadas[i % especialidadesGuardadas.length]._id,
          especialidadesGuardadas[(i + 1) % especialidadesGuardadas.length]._id,
        ];

        nuevoMedico.practicas = [practicasGuardadas[i % practicasGuardadas.length]._id];

        nuevoMedico.sedes = [sedesGuardadas[i % sedesGuardadas.length]._id];

        const dia1 = dias[i % dias.length];
        const dia2 = dias[(i + 2) % dias.length];

        nuevoMedico.disponibilidades = [
          { diaSemana: dia1, horaDesde: '08:00', horaHasta: '12:00' },
          { diaSemana: dia2, horaDesde: '14:00', horaHasta: '18:00' },
        ];

        medicos.push(nuevoMedico);
      }

      const medicosGuardados = await this.medicoRepository.saveAll(medicos);

      logger.info(`Se cargaron ${medicosGuardados.length} médicos.`);

      // 7. Cargar pacientes
      await this.pacienteRepository.deleteAll();
      await PacienteModel.syncIndexes();

      const pacientes = [];

      for (let i = 0; i < usuariosPacientesGuardados.length; i++) {
        const usuarioDb = usuariosPacientesGuardados[i];

        const dni = `${30000000 + i}`;
        const nombreCompleto = `Paciente de Prueba ${i + 1}`;

        const obraSocialAsignada = obrasSocialesGuardadas[i % obrasSocialesGuardadas.length];
        const planAsignado = planesGuardados[i % planesGuardados.length];

        const nuevoPaciente = new Paciente(
          usuarioDb.id || usuarioDb._id,
          dni,
          nombreCompleto,
          obraSocialAsignada._id,
          planAsignado._id,
        );

        pacientes.push(nuevoPaciente);
      }

      const pacientesGuardados = await this.pacienteRepository.saveAll(pacientes);

      logger.info(`Se cargaron ${pacientesGuardados.length} pacientes.`);

      // 8. Cargar turnos
      await turnoRepository.deleteAll();

      logger.info('Iniciando generación batch de turnos iniciales...');

      await turnoService.refrescarTurnos();

      logger.info('Turnos iniciales generados exitosamente.');

      return res.status(201).json({
        status: 'success',
        message: 'Datos iniciales cargados exitosamente',
      });
    } catch (error) {
      logger.error('Error al cargar datos iniciales:', error.message);
      return next(error);
    }
  };

  correrProcesoBatch = async (req, res, next) => {
    try {
      console.log('Proceso GARCH iniciado manualmente');

      await this.turnoService.refrescarTurnos();

      return res.status(201).json({
        status: 'success',
        message: 'Proceso batch realizado exitosamente',
      });
    } catch (error) {
      logger.error('Error al correr el proceso batch:', error.message);
      return next(error);
    }
  };
}
