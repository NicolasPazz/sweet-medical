import { jest } from '@jest/globals';
import { Rol } from '../domain/usuario/Rol.js';
import { Turno } from '../domain/turno/Turno.js';
import { Reservado } from '../domain/notificacion/estado-turno/Reservado.js';
import { Confirmado } from '../domain/notificacion/estado-turno/Confirmado.js';
import { Disponible } from '../domain/notificacion/estado-turno/Disponible.js';
import { Agenda } from '../domain/agenda/Agenda.js';
import { TurnoService } from './TurnoService.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.js';

const mockUsuarioRepository = {
  findById: jest.fn(),
};

const mockPacienteRepository = {
  findByIdUsuario: jest.fn(),
};

const mockTurnoRepository = {
  findById: jest.fn(),
  findAllByMedicIdAndEstado: jest.fn(),
  findAllByPatientId: jest.fn(),
  findDisponiblesByMedicIdAndServicioId: jest.fn(),
  findAllByMedicId: jest.fn(),
  findByMedicFechaHora: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
};

const mockNotificacionRepository = {
  save: jest.fn(),
};

const mockMedicoRepository = {
  findAll: jest.fn(),
  save: jest.fn(),
  findByIdUsuario: jest.fn(),
};

describe('TurnoService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TurnoService({
      turnoRepository: mockTurnoRepository,
      usuarioRepository: mockUsuarioRepository,
      pacienteRepository: mockPacienteRepository,
      notificacionRepository: mockNotificacionRepository,
      medicoRepository: mockMedicoRepository,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reserva un turno disponible con éxito', async () => {
    const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
    const paciente = { id: 'p-paciente', usuario: { id: 'u-paciente' }, nombre: 'Pepito' };
    const medico = { _id: 'm-1', usuario: { id: 'um-1' }, nombre: 'Dr. House' };
    const turno = new Turno(
      medico,
      null,
      'LUNES',
      '09:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockTurnoRepository.findById.mockResolvedValue(turno);
    mockTurnoRepository.findAllByMedicIdAndEstado.mockResolvedValue([]);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'n-1' });
    mockTurnoRepository.save.mockResolvedValue(turno);

    const resultado = await service.reservarTurno('u-paciente', 't-1');

    expect(mockUsuarioRepository.findById).toHaveBeenCalledWith('u-paciente');
    expect(mockPacienteRepository.findByIdUsuario).toHaveBeenCalledWith('u-paciente');
    expect(mockTurnoRepository.findById).toHaveBeenCalledWith('t-1');
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turno);
    expect(resultado.paciente).toEqual(paciente);
    expect(resultado.estado.getEstadoNombre()).toBe('RESERVADO');
    expect(mockNotificacionRepository.save).toHaveBeenCalled();
  });

  it('falla al reservar un turno que no está disponible', async () => {
    const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
    const paciente = { id: 'p-paciente', usuario: { id: 'u-paciente' }, nombre: 'Pepito' };
    const medico = { _id: 'm-1', usuario: { id: 'um-1' }, nombre: 'Dr. House' };
    const turno = new Turno(
      medico,
      null,
      'LUNES',
      '09:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.estado = new Reservado(turno);

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockTurnoRepository.findById.mockResolvedValue(turno);

    await expect(service.reservarTurno('u-paciente', 't-1')).rejects.toThrow(ConflictError);
    expect(mockTurnoRepository.save).not.toHaveBeenCalled();
  });

  it('falla al reservar un turno cuando el usuario no existe', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(null);

    await expect(service.reservarTurno('u-paciente', 't-1')).rejects.toThrow(NotFoundError);
    expect(mockPacienteRepository.findByIdUsuario).not.toHaveBeenCalled();
  });

  it('falla al reservar un turno cuando el paciente no existe', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ id: 'u-paciente', roles: [Rol.PACIENTE] });
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(null);

    await expect(service.reservarTurno('u-paciente', 't-1')).rejects.toThrow(NotFoundError);
    expect(mockTurnoRepository.findById).not.toHaveBeenCalled();
  });

  it('falla al reservar un turno inexistente', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ id: 'u-paciente', roles: [Rol.PACIENTE] });
    mockPacienteRepository.findByIdUsuario.mockResolvedValue({ id: 'p-paciente' });
    mockTurnoRepository.findById.mockResolvedValue(null);

    await expect(service.reservarTurno('u-paciente', 't-1')).rejects.toThrow(NotFoundError);
  });

  it('falla al cancelar un turno con menos de una hora de antelación', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T10:00:00Z'));

    const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
    const paciente = { id: 'p-paciente', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
    const medico = { _id: 'm-1', usuario: { id: 'um-1' }, nombre: 'Dr. House' };
    const turno = new Turno(
      medico,
      paciente,
      'LUNES',
      '12:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.estado = new Reservado(turno);
    turno.fechaHora = new Date('2026-05-17T10:30:00Z');

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);

    await expect(
      service.cancelarTurno('u-paciente', 't-1', false, 'Motivo urgente'),
    ).rejects.toThrow(ConflictError);
    expect(mockTurnoRepository.save).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('cancela un turno reservado con más de una hora de antelación', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T10:00:00Z'));

    const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
    const paciente = { id: 'p-paciente', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
    const medico = { _id: 'm-1', usuario: { id: 'um-1' }, nombre: 'Dr. House' };
    const turno = new Turno(
      medico,
      paciente,
      'LUNES',
      '12:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.estado = new Reservado(turno);
    turno.fechaHora = new Date('2026-05-17T11:30:00Z');

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'not-2' });
    mockTurnoRepository.save.mockResolvedValue(turno);

    const resultado = await service.cancelarTurno('u-paciente', 't-1', false, 'Cambió de planes');

    expect(resultado.estado.getEstadoNombre()).toBe('CANCELADO');
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turno);
    expect(mockNotificacionRepository.save).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('refresca turnos sin médicos sin fallar', async () => {
    mockMedicoRepository.findAll.mockResolvedValue([]);

    await expect(service.refrescarTurnos()).resolves.toBeUndefined();
    expect(mockMedicoRepository.findAll).toHaveBeenCalled();
    expect(mockTurnoRepository.save).not.toHaveBeenCalled();
  });

  it('obtiene historial de turno mapeado para un paciente y un médico existentes', async () => {
    const medico = { id: 'm-1', usuario: { _id: 'um-1' } };
    const paciente = { id: 'p-1', usuario: { _id: 'u-paciente' } };
    const turno = {
      id: 't-1',
      medico,
      paciente,
      fechaHora: new Date('2026-05-17T09:00:00Z'),
      sede: { nombre: 'Sede' },
      servicio: { codigo: 'C1', nombre: 'Cardio' },
      estado: { getEstadoNombre: () => 'RESERVADO' },
      historialEstados: [],
      costo: 1000,
      diaSemana: 'LUNES',
      hora: '09:00',
    };

    mockMedicoRepository.findByIdUsuario.mockResolvedValue(medico);
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockTurnoRepository.findAllByPatientId.mockResolvedValue([turno]);

    const resultado = await service.obtenerHistorial('p-1', 'um-1');

    expect(mockMedicoRepository.findByIdUsuario).toHaveBeenCalledWith('um-1');
    expect(mockPacienteRepository.findByIdUsuario).toHaveBeenCalledWith('p-1');
    expect(mockTurnoRepository.findAllByPatientId).toHaveBeenCalledWith('p-1');
    expect(resultado).toEqual([
      {
        id_turno: 't-1',
        id_medico: 'm-1',
        id_paciente: 'p-1',
        fechaHora: turno.fechaHora,
        sede: 'Sede',
        servicio: 'C1 - Cardio',
        estado: 'RESERVADO',
        historialEstados: [],
        costo: 1000,
        diaSemana: 'LUNES',
        hora: '09:00',
      },
    ]);
  });

  it('lanza NotFoundError si no existe el médico al obtener historial', async () => {
    mockMedicoRepository.findByIdUsuario.mockResolvedValue(null);

    await expect(service.obtenerHistorial('p-1', 'um-1')).rejects.toThrow(NotFoundError);
  });

  it('acepta un turno reservado con éxito cuando el médico es válido', async () => {
    const usuario = { id: 'u-medico', roles: [Rol.MEDICO] };
    const medico = { _id: 'm-1', usuario: { _id: 'u-medico' }, nombre: 'Dr. Strange' };
    const paciente = { id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
    const turno = new Turno(
      medico,
      paciente,
      'LUNES',
      '09:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.id = 't-1';
    turno.estado = new Reservado(turno);
    turno.fechaHora = new Date('2026-05-17T11:00:00Z');

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'not-3' });
    mockTurnoRepository.save.mockResolvedValue(turno);

    const resultado = await service.aceptarTurno('u-medico', 't-1');

    expect(resultado.estado.getEstadoNombre()).toBe('CONFIRMADO');
    expect(mockNotificacionRepository.save).toHaveBeenCalled();
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turno);
  });

  it('finaliza un turno confirmado y actualiza el médico', async () => {
    const usuario = { id: 'u-medico', roles: [Rol.MEDICO] };
    const medico = {
      _id: 'm-1',
      usuario: { _id: 'u-medico' },
      nombre: 'Dr. Strange',
      turnosActualesYFuturos: [{ _id: 't-1' }],
    };
    const paciente = { id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
    const turno = new Turno(
      medico,
      paciente,
      'LUNES',
      '09:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.id = 't-1';
    turno.estado = new Confirmado(turno);
    turno.fechaHora = new Date('2026-05-17T11:00:00Z');

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);
    mockMedicoRepository.save.mockResolvedValue(medico);
    mockTurnoRepository.save.mockResolvedValue(turno);

    const resultado = await service.finalizarTurno('u-medico', 't-1');

    expect(resultado.estado.getEstadoNombre()).toBe('REALIZADO');
    expect(mockMedicoRepository.save).toHaveBeenCalledWith(medico);
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turno);
  });

  it('obtiene disponibilidad de turnos mapeado para un médico', async () => {
    const medico = { id: 'm-1', usuario: { id: 'um-1' } };
    const turnoDisponible = {
      id: 't-1',
      medico: { id: 'm-1' },
      paciente: null,
      fechaHora: new Date('2026-05-18T09:00:00Z'),
      sede: { nombre: 'Sede' },
      servicio: { codigo: 'C1', nombre: 'Cardio' },
      estado: { getEstadoNombre: () => 'DISPONIBLE' },
      historialEstados: [],
      costo: 1000,
      diaSemana: 'LUNES',
      hora: '09:00',
    };

    mockMedicoRepository.findByIdUsuario.mockResolvedValue(medico);
    mockTurnoRepository.findDisponiblesByMedicIdAndServicioId.mockResolvedValue([turnoDisponible]);

    const resultado = await service.obtenerDisponibilidad('um-1', 'serv-1');

    expect(resultado).toEqual([
      {
        id_turno: 't-1',
        id_medico: 'm-1',
        id_paciente: 'N/A',
        fechaHora: turnoDisponible.fechaHora,
        sede: 'Sede',
        servicio: 'C1 - Cardio',
        estado: 'DISPONIBLE',
        historialEstados: [],
        costo: 1000,
        diaSemana: 'LUNES',
        hora: '09:00',
      },
    ]);
  });

  it('obtiene turnos del médico y mapea correctamente', async () => {
    const medico = { id: 'm-1', usuario: { id: 'um-1' } };
    const turno = {
      id: 't-2',
      medico: { id: 'm-1' },
      paciente: null,
      fechaHora: new Date('2026-05-18T09:00:00Z'),
      sede: { nombre: 'Sede' },
      servicio: { nombre: 'Cardio' },
      estado: { getEstadoNombre: () => 'DISPONIBLE' },
      historialEstados: [],
      costo: 1000,
      diaSemana: 'LUNES',
      hora: '09:00',
    };

    mockMedicoRepository.findByIdUsuario.mockResolvedValue(medico);
    mockTurnoRepository.findAllByMedicId.mockResolvedValue([turno]);

    const resultado = await service.obtenerTurnosMedico('um-1');

    expect(resultado[0].id_turno).toBe('t-2');
    expect(resultado[0].estado).toBe('DISPONIBLE');
    expect(mockTurnoRepository.findAllByMedicId).toHaveBeenCalledWith('m-1');
  });

  it('obtiene todos los turnos mapeados correctamente', async () => {
    const turno = {
      id: 't-3',
      medico: { id: 'm-2' },
      paciente: null,
      fechaHora: new Date('2026-05-18T09:00:00Z'),
      sede: { nombre: 'Sede' },
      servicio: { nombre: 'General' },
      estado: { getEstadoNombre: () => 'DISPONIBLE' },
      historialEstados: [],
      costo: 500,
      diaSemana: 'MARTES',
      hora: '10:00',
    };

    mockTurnoRepository.findAll.mockResolvedValue([turno]);

    const resultado = await service.getAll();

    expect(resultado).toEqual([
      {
        id_turno: 't-3',
        id_medico: 'm-2',
        id_paciente: 'N/A',
        fechaHora: turno.fechaHora,
        sede: 'Sede',
        servicio: 'General',
        estado: 'DISPONIBLE',
        historialEstados: [],
        costo: 500,
        diaSemana: 'MARTES',
        hora: '10:00',
      },
    ]);
  });

  it('lanza ForbiddenError si un usuario no médico intenta aceptar turno', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ id: 'u-1', roles: [Rol.PACIENTE] });

    await expect(service.aceptarTurno('u-1', 't-1')).rejects.toThrow(ForbiddenError);
  });

  it('lanza ConflictError si se intenta aceptar un turno no reservado', async () => {
    const usuario = { id: 'u-medico', roles: [Rol.MEDICO] };
    const medico = { _id: 'm-1', usuario: { _id: 'u-medico' } };
    const turno = new Turno(
      medico,
      null,
      'LUNES',
      '09:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.id = 't-1';
    turno.estado = new Disponible(turno);

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);

    await expect(service.aceptarTurno('u-medico', 't-1')).rejects.toThrow(ConflictError);
  });

  it('lanza ForbiddenError si un usuario no médico intenta finalizar turno', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ id: 'u-1', roles: [Rol.PACIENTE] });

    await expect(service.finalizarTurno('u-1', 't-1')).rejects.toThrow(ForbiddenError);
  });

  it('lanza ConflictError si un turno no confirmado no puede finalizarse', async () => {
    const usuario = { id: 'u-medico', roles: [Rol.MEDICO] };
    const medico = { _id: 'm-1', usuario: { _id: 'u-medico' } };
    const turno = new Turno(
      medico,
      null,
      'LUNES',
      '09:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.id = 't-1';
    turno.estado = new Reservado(turno);

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);

    await expect(service.finalizarTurno('u-medico', 't-1')).rejects.toThrow(ConflictError);
  });

  it('lanza NotFoundError si el médico no existe al obtener disponibilidad', async () => {
    mockMedicoRepository.findByIdUsuario.mockResolvedValue(null);

    await expect(service.obtenerDisponibilidad('um-1', 'serv-1')).rejects.toThrow(NotFoundError);
  });

  it('lanza NotFoundError si el médico no existe al obtener turnos del médico', async () => {
    mockMedicoRepository.findByIdUsuario.mockResolvedValue(null);

    await expect(service.obtenerTurnosMedico('um-1')).rejects.toThrow(NotFoundError);
  });

  it('procesa un lote de médicos y persiste todos los turnos generados y eliminados', async () => {
    const medico = { _id: 'm-1', id: 'm-1' };
    const turnoEliminado = { id: 't-elim' };
    const turnoNuevo = { id: 't-nuevo' };

    mockMedicoRepository.findAll.mockResolvedValue([medico]);
    jest.spyOn(Agenda, 'refrescarTurnosSegunDisponibilidadDe').mockReturnValue({
      turnosEliminados: [turnoEliminado],
      nuevosTurnos: [turnoNuevo],
    });
    mockTurnoRepository.save.mockResolvedValue(undefined);

    await expect(service.refrescarTurnos()).resolves.toBeUndefined();

    expect(Agenda.refrescarTurnosSegunDisponibilidadDe).toHaveBeenCalledWith(medico);
    expect(mockTurnoRepository.save).toHaveBeenCalledTimes(2);
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoEliminado);
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoNuevo);
  });

  describe('Lógica de Reprogramación', () => {
    let usuarioPaciente, usuarioMedico, paciente, medico, turnoOriginal;
    const fechaFuturaValida = new Date('2026-05-17T15:00:00Z');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-17T10:00:00Z')); // Fijamos hora de ejecución

      usuarioPaciente = { id: 'u-paciente', _id: 'u-paciente', roles: [Rol.PACIENTE] };
      usuarioMedico = { id: 'u-medico', _id: 'u-medico', roles: [Rol.MEDICO] };
      
      paciente = { id: 'p-1', _id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Sebastián' };
      medico = { id: 'm-1', _id: 'm-1', usuario: { _id: 'u-medico' }, nombre: 'Dr. House' };

      turnoOriginal = new Turno(
        medico,
        paciente,
        'LUNES',
        '13:00',
        { nombre: 'Sede Central' },
        { _id: 's-cardio', nombre: 'Cardiología', codigo: 'CARD-01' },
        1500
      );
      turnoOriginal.id = 't-original';
      turnoOriginal.estado = { getEstadoNombre: () => 'RESERVADO' }; // Mockeo simple de string
      turnoOriginal.fechaHora = new Date('2026-05-17T13:00:00Z'); // 3 horas en el futuro (VÁLIDO)
      
      // Mock de método de dominio para simular transición
      turnoOriginal.solicitarReprogramacion = jest.fn().mockReturnValue({ id: 'notif-proponer' });
      turnoOriginal.actualizarEstado = jest.fn().mockReturnValue({ id: 'notif-responder' });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    // --- TEST 1: CAMINO FELIZ PROPUESTA ---
    it('propone una reprogramación con éxito si hay bache disponible y coincide la especialidad', async () => {
      const turnoDestinoBache = {
        id: 't-bache',
        servicio: { _id: 's-cardio', nombre: 'Cardiología' },
        estado: { getEstadoNombre: () => 'DISPONIBLE' }
      };

      turnoOriginal.servicio = { _id: 's-cardio', nombre: 'Cardiología' };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);
      mockTurnoRepository.findByMedicFechaHora.mockResolvedValue(turnoDestinoBache);

      const resultado = await service.proponerReprogramacion('u-paciente', 't-original', fechaFuturaValida, 'Fuerza mayor');

      expect(mockTurnoRepository.findByMedicFechaHora).toHaveBeenCalledWith('m-1', fechaFuturaValida);
      expect(turnoOriginal.solicitarReprogramacion).toHaveBeenCalledWith(usuarioPaciente, fechaFuturaValida, 'Fuerza mayor');
      expect(mockNotificacionRepository.save).toHaveBeenCalled();
      expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoOriginal);
      expect(resultado).toBe(turnoOriginal);
    });

    // --- TEST 2: ERROR DE ANTICIPACIÓN ---
    it('falla al proponer una reprogramación con menos de 1 hora de antelación', async () => {
      // Modificamos el turno original para que falten solo 30 minutos
      turnoOriginal.fechaHora = new Date('2026-05-17T10:30:00Z');

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);

      await expect(
        service.proponerReprogramacion('u-paciente', 't-original', fechaFuturaValida, 'Tarde')
      ).rejects.toThrow(ConflictError);
      
      expect(mockTurnoRepository.save).not.toHaveBeenCalled();
    });

    // --- TEST 3: ERROR BACHE OCUPADO ---
    it('falla al proponer si el bache horario físico de destino no está DISPONIBLE', async () => {
      const bacheOcupado = {
        id: 't-ocupado',
        servicio: { _id: 's-cardio', nombre: 'Cardiología' },
        estado: { getEstadoNombre: () => 'RESERVADO' } // <-- No disponible!
      };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);
      mockTurnoRepository.findByMedicFechaHora.mockResolvedValue(bacheOcupado);

      await expect(
        service.proponerReprogramacion('u-paciente', 't-original', fechaFuturaValida, 'Permutación')
      ).rejects.toThrow(ConflictError);
    });

    // --- TEST 4: ERROR SERVICIOS DISTINTOS ---
    it('falla al proponer si el bache destino corresponde a otra especialidad', async () => {
      const bacheDePediatria = {
        id: 't-pediatria',
        servicio: { _id: 's-pediatria', nombre: 'Pediatría' }, // <-- Especialidad distinta
        estado: { getEstadoNombre: () => 'DISPONIBLE' }
      };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);
      mockTurnoRepository.findByMedicFechaHora.mockResolvedValue(bacheDePediatria);

      await expect(
        service.proponerReprogramacion('u-paciente', 't-original', fechaFuturaValida, 'Error especialidad')
      ).rejects.toThrow(ConflictError);
    });

    // --- TEST 5: CAMINO FELIZ RESPUESTA (ACEPTAR) ---
    it('acepta la propuesta de reprogramación, actualiza la fecha y limpia la propuesta', async () => {
      // Seteamos una propuesta previa en el turno original
      turnoOriginal.propuestaCambio = {
        nuevaFechaHora: fechaFuturaValida,
        proponenteId: 'u-paciente' // Propuso el paciente
      };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico); // Responde el médico (VÁLIDO)
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);

      const resultado = await service.responderReprogramacion('u-medico', 't-original', true);

      expect(resultado.fechaHora).toEqual(new Date(fechaFuturaValida));
      expect(resultado.propuestaCambio).toBeNull(); // Se limpió
      expect(turnoOriginal.actualizarEstado).toHaveBeenCalledWith(usuarioMedico, 'RESERVADO', usuarioMedico, expect.any(String));
      expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoOriginal);
    });

    // --- TEST 6: ERROR AUTO-RESPONDERSE ---
    it('falla si el mismo usuario que propuso el cambio intenta responder la propuesta', async () => {
      turnoOriginal.propuestaCambio = {
        nuevaFechaHora: fechaFuturaValida,
        proponenteId: 'u-paciente'
      };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente); // Intenta responder el mismo paciente
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);

      await expect(
        service.responderReprogramacion('u-paciente', 't-original', true)
      ).rejects.toThrow(ConflictError);

      expect(mockTurnoRepository.save).not.toHaveBeenCalled();
    });
  });
});
