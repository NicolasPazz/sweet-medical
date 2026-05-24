import { jest } from '@jest/globals';
import { Rol } from '../domain/usuario/Rol.js';
import { Turno } from '../domain/turno/Turno.js';
import { Reservado } from '../domain/notificacion/estado-turno/Reservado.js';
import { Confirmado } from '../domain/notificacion/estado-turno/Confirmado.js';
import { Disponible } from '../domain/notificacion/estado-turno/Disponible.js';
import { Agenda } from '../domain/agenda/Agenda.js';
import { TurnoService } from './TurnoService.js';
import { ConflictError, ForbiddenError, NotFoundError, BadRequestError } from '../errors/AppError.js';

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
  findById: jest.fn(),
};

const mockSlotRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  findAllSlotsByMedicId: jest.fn(),
  delete: jest.fn(),
};

const mockServicioRepository = {
  findById: jest.fn(),
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
      slotRepository: mockSlotRepository,
      servicioRepository: mockServicioRepository,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reserva un turno disponible con éxito', async () => {
    const usuario = { id: '507f1f77bcf86cd799439011', roles: [Rol.PACIENTE] };
    const paciente = { id: '507f1f77bcf86cd799439012', usuario: { id: '507f1f77bcf86cd799439011' }, nombre: 'Pepito' };
    const medico = { _id: '507f1f77bcf86cd799439013', id: '507f1f77bcf86cd799439013', usuario: { id: 'um-1' }, nombre: 'Dr. House', especialidades: ['507f1f77bcf86cd799439014'], practicas: [] };
    const slot = { _id: '507f1f77bcf86cd799439015', id: '507f1f77bcf86cd799439015', medico: '507f1f77bcf86cd799439013', fecha: '2026-05-24', horaInicio: '09:00', duracionMins: 30, estado: 'DISPONIBLE' };
    const servicio = { _id: '507f1f77bcf86cd799439014', nombre: 'Cardio', duracionTurnoEnMins: 30, costo: 1000 };

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockServicioRepository.findById.mockResolvedValue(servicio);
    mockSlotRepository.findById.mockResolvedValue(slot);
    mockMedicoRepository.findById.mockResolvedValue(medico);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'n-1' });
    
    const mockSavedTurno = { _id: '507f1f77bcf86cd799439016', id: '507f1f77bcf86cd799439016' };
    mockTurnoRepository.save.mockResolvedValue(mockSavedTurno);
    mockSlotRepository.save.mockResolvedValue(slot);

    const dto = {
      id_usuario: '507f1f77bcf86cd799439011',
      id_servicio: '507f1f77bcf86cd799439014',
      slotsIds: ['507f1f77bcf86cd799439015'],
    };

    await expect(service.reservarTurno(dto)).resolves.toBeUndefined();

    expect(mockUsuarioRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(mockPacienteRepository.findByIdUsuario).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(mockSlotRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439015');
  });

  it('falla al reservar si el slot no está disponible', async () => {
    const usuario = { id: '507f1f77bcf86cd799439011', roles: [Rol.PACIENTE] };
    const paciente = { id: '507f1f77bcf86cd799439012', usuario: { id: '507f1f77bcf86cd799439011' }, nombre: 'Pepito' };
    const slot = { _id: '507f1f77bcf86cd799439015', id: '507f1f77bcf86cd799439015', medico: '507f1f77bcf86cd799439013', fecha: '2026-05-24', horaInicio: '09:00', duracionMins: 30, estado: 'RESERVADO' };
    const servicio = { _id: '507f1f77bcf86cd799439014', nombre: 'Cardio', duracionTurnoEnMins: 30, costo: 1000 };

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockServicioRepository.findById.mockResolvedValue(servicio);
    mockSlotRepository.findById.mockResolvedValue(slot);

    const dto = {
      id_usuario: '507f1f77bcf86cd799439011',
      id_servicio: '507f1f77bcf86cd799439014',
      slotsIds: ['507f1f77bcf86cd799439015'],
    };

    await expect(service.reservarTurno(dto)).rejects.toThrow(ConflictError);
  });

  it('falla al reservar un turno cuando el usuario no existe', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(null);
    await expect(service.reservarTurno({ id_usuario: '507f1f77bcf86cd799439011' })).rejects.toThrow(NotFoundError);
  });

  it('cancela un turno reservado con más de una hora de antelación', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T10:00:00Z'));

    const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
    const paciente = { id: 'p-paciente', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
    const medico = { _id: 'm-1', id: 'm-1', usuario: { id: 'um-1' }, nombre: 'Dr. House', disponibilidades: [] };
    
    const turno = new Turno(
      medico,
      paciente,
      '2026-05-17',
      '12:00',
      { nombre: 'Sede' },
      { nombre: 'Cardio', costo: 1000 },
      1000,
    );
    turno.estado = new Reservado(turno);
    turno.fechaHora = new Date('2026-05-17T11:30:00Z');
    
    const slot = { fecha: '2026-05-17', horaInicio: '12:00', estado: 'RESERVADO' };
    turno.slotsAsociados = [slot];

    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'not-2' });
    mockTurnoRepository.save.mockResolvedValue(turno);
    mockSlotRepository.save.mockResolvedValue(slot);

    const resultado = await service.cancelarTurno('u-paciente', 't-1', false, 'Cambió de planes');

    expect(resultado.estado.getEstadoNombre()).toBe('CANCELADO');
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turno);
    expect(mockNotificacionRepository.save).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('refresca slots sin médicos sin fallar', async () => {
    mockMedicoRepository.findAll.mockResolvedValue([]);
    await expect(service.refrescarSlots()).resolves.toBeUndefined();
    expect(mockMedicoRepository.findAll).toHaveBeenCalled();
  });

  it('obtiene historial de turno mapeado para un paciente y un médico existentes', async () => {
    const medico = { id: 'm-1', _id: 'm-1', nombre: 'Dr. House', usuario: { _id: 'um-1' } };
    const paciente = { id: 'p-1', usuario: { _id: 'u-paciente' } };
    const turno = {
      id: 't-1',
      medico,
      paciente,
      fechaHora: new Date('2026-05-17T09:00:00Z'),
      sede: { nombre: 'Sede' },
      servicio: { _id: 'serv-1', nombre: 'Cardio' },
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
        nombreMedico: 'Dr. House',
        id_paciente: 'p-1',
        fechaHora: turno.fechaHora,
        sede: 'Sede',
        servicio_id: 'serv-1',
        servicio_nombre: 'Cardio',
        estado: 'RESERVADO',
        historialEstados: [],
        costo: 1000,
        diaSemana: 'LUNES',
        hora: '09:00',
      },
    ]);
  });

  it('confirma un turno reservado con éxito', async () => {
    const usuario = { id: 'u-medico', roles: [Rol.MEDICO] };
    const medico = { _id: 'm-1', id: 'm-1', usuario: { _id: 'u-medico' }, nombre: 'Dr. Strange' };
    const paciente = { id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
    
    const turno = new Turno(
      medico,
      paciente,
      '2026-05-17',
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
    mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([]);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'not-3' });
    mockTurnoRepository.save.mockResolvedValue(turno);

    const resultado = await service.confirmarTurno('u-medico', 't-1', 'sede-1');

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
      '2026-05-17',
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
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turno);
  });

  describe('Lógica de Reprogramación', () => {
    let usuarioPaciente, usuarioMedico, paciente, medico, turnoOriginal;
    const fechaFuturaValida = new Date('2026-05-17T15:00:00Z');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-17T10:00:00Z'));

      usuarioPaciente = { id: 'u-paciente', _id: 'u-paciente', roles: [Rol.PACIENTE] };
      usuarioMedico = { id: 'u-medico', _id: 'u-medico', roles: [Rol.MEDICO] };

      paciente = { id: 'p-1', _id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Sebastián' };
      medico = { id: 'm-1', _id: 'm-1', usuario: { _id: 'u-medico' }, nombre: 'Dr. House' };

      turnoOriginal = new Turno(
        medico,
        paciente,
        '2026-05-17',
        '13:00',
        { nombre: 'Sede Central' },
        { _id: 's-cardio', nombre: 'Cardiología', codigo: 'CARD-01' },
        1500,
      );
      turnoOriginal.id = 't-original';
      turnoOriginal.estado = { getEstadoNombre: () => 'RESERVADO' };
      turnoOriginal.fechaHora = new Date('2026-05-17T13:00:00Z');

      turnoOriginal.solicitarReprogramacion = jest.fn().mockReturnValue({ id: 'notif-proponer' });
      turnoOriginal.actualizarEstado = jest.fn().mockReturnValue({ id: 'notif-responder' });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('propone una reprogramación con éxito si hay bache disponible y coincide la especialidad', async () => {
      const turnoDestinoBache = {
        id: 't-bache',
        servicio: { _id: 's-cardio', nombre: 'Cardiología' },
        estado: { getEstadoNombre: () => 'DISPONIBLE' },
      };

      turnoOriginal.servicio = { _id: 's-cardio', nombre: 'Cardiología' };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);
      mockTurnoRepository.findByMedicFechaHora.mockResolvedValue(turnoDestinoBache);

      const resultado = await service.proponerReprogramacion(
        'u-paciente',
        't-original',
        fechaFuturaValida,
        'Fuerza mayor',
      );

      expect(mockTurnoRepository.findByMedicFechaHora).toHaveBeenCalledWith(
        'm-1',
        fechaFuturaValida,
      );
      expect(turnoOriginal.solicitarReprogramacion).toHaveBeenCalledWith(
        usuarioPaciente,
        fechaFuturaValida,
        'Fuerza mayor',
      );
      expect(mockNotificacionRepository.save).toHaveBeenCalled();
      expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoOriginal);
      expect(resultado).toBe(turnoOriginal);
    });

    it('falla al proponer una reprogramación con menos de 1 hora de antelación', async () => {
      turnoOriginal.fechaHora = new Date('2026-05-17T10:30:00Z');

      mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);

      await expect(
        service.proponerReprogramacion('u-paciente', 't-original', fechaFuturaValida, 'Tarde'),
      ).rejects.toThrow(ConflictError);

      expect(mockTurnoRepository.save).not.toHaveBeenCalled();
    });

    it('acepta la propuesta de reprogramación, actualiza la fecha y limpia la propuesta', async () => {
      turnoOriginal.propuestaCambio = {
        nuevaFechaHora: fechaFuturaValida,
        proponenteId: 'u-paciente',
      };

      mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico);
      mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);

      const resultado = await service.responderReprogramacion('u-medico', 't-original', true);

      expect(resultado.fechaHora).toEqual(new Date(fechaFuturaValida));
      expect(resultado.propuestaCambio).toBeNull();
      expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoOriginal);
    });
  });
});
