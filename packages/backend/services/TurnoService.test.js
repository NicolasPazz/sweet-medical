import { TurnoService } from './TurnoService.js';
import { Turno } from '../domain/turno/Turno.js';
import { Reservado } from '../domain/notificacion/estado-turno/Reservado.js';
import { Confirmado } from '../domain/notificacion/estado-turno/Confirmado.js';
import { Rol } from '../domain/usuario/Rol.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError.js';

// Mocks globales de los Repositorios
const mockTurnoRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  findAllByPatientId: jest.fn(),
  findAllByMedicId: jest.fn(),
  findAll: jest.fn(),
};

const mockUsuarioRepository = {
  findById: jest.fn(),
};

const mockPacienteRepository = {
  findByIdUsuario: jest.fn(),
};

const mockNotificacionRepository = {
  save: jest.fn(),
};

const mockMedicoRepository = {
  findById: jest.fn(),
  findByIdUsuario: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
};

const mockSlotRepository = {
  findById: jest.fn(),
  findAllSlotsByMedicId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findByMedicFechaHora: jest.fn(),
};

const mockServicioRepository = {
  findById: jest.fn(),
};

describe('TurnoService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();

    // Inyección limpia de dependencias mockeadas
    service = new TurnoService({
      turnoRepository: mockTurnoRepository,
      usuarioRepository: mockUsuarioRepository,
      pacienteRepository: mockPacienteRepository,
      notificacionRepository: mockNotificacionRepository,
      medicoRepository: mockMedicoRepository,
      slotRepository: mockSlotRepository,
      servicioRepository: mockServicioRepository,
    });

    // Env para la simulación del batch por defecto
    process.env.DURACION_SLOT_MINUTOS = '30';
    process.env.NUM_SEMANAS_GENERAR_SLOTS = '4';
  });
});

// ==========================================
// TESTS: RESERVA DE TURNOS
// ==========================================
describe('reservarTurno', () => {
  it('falla al reservar un turno cuando el paciente no existe', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ id: 'u-1' });
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(null);
    const dto = { id_usuario: 'u-1', id_servicio: 's-1', slotsIds: ['slot-1'] };

    await expect(service.reservarTurno(dto)).rejects.toThrow(NotFoundError);
  });
});

// ==========================================
// TESTS: CANCELACIÓN DE TURNOS
// ==========================================
describe('cancelarTurno', () => {
  it('falla al cancelar un turno con menos de una hora de antelación', async () => {
    const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
    const turno = {
      estado: new Reservado({}),
      fechaHora: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos al futuro
    };
    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);

    await expect(service.cancelarTurno('u-paciente', 't-1', false, 'Motivo')).rejects.toThrow(
      ConflictError,
    );
  });
});

// ==========================================
// TESTS: HISTORIAL Y LISTADOS (MAPEO DE DTOS)
// ==========================================
describe('Mapeo de Historial y Listados', () => {
  it('obtiene todos los turnos mapeados correctamente', async () => {
    const turnoMock = {
      id: 't-3',
      medico: { id: 'm-2', nombre: 'Dr. Brown' },
      paciente: null,
      fechaHora: '2026-05-31T11:00:00Z',
      sede: 'Sede Central',
      servicio: { _id: 's-2', nombre: 'General' },
      estado: { getEstadoNombre: () => 'DISPONIBLE' },
      historialEstados: [],
      costo: 1000,
      diaSemana: 'DOMINGO',
      hora: '11:00',
    };
    mockTurnoRepository.findAll.mockResolvedValue([turnoMock]);

    const resultado = await service.getAll();

    expect(resultado).toEqual([
      expect.objectContaining({
        id_turno: 't-3',
        servicio_nombre: 'General',
        nombreMedico: 'Dr. Brown',
      }),
    ]);
  });
});

// ==========================================
// TESTS: CONTROL DE ACCESO AL CONFIRMAR
// ==========================================
describe('confirmarTurno - Reglas de Negocio Globales', () => {
  it('lanza ForbiddenError si un usuario no médico intenta confirmar un turno', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ id: 'u-1', roles: [Rol.PACIENTE] });

    await expect(service.confirmarTurno('u-1', 't-1', 'sede-1')).rejects.toThrow(ForbiddenError);
  });

  it('lanza ConflictError si se intenta confirmar un turno no reservado', async () => {
    const usuarioMedico = { id: 'u-medico', roles: [Rol.MEDICO] };
    const turnoNoReservado = {
      id: 't-1',
      medico: { usuario: 'u-medico' },
      estado: new Confirmado({}),
    };
    mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico);
    mockTurnoRepository.findById.mockResolvedValue(turnoNoReservado);

    await expect(service.confirmarTurno('u-medico', 't-1', 'sede-1')).rejects.toThrow(
      ConflictError,
    );
  });
});

// ==========================================
// TESTS: RESERVA, CANCELACIÓN, HISTORIAL Y BATCH
// ==========================================

it('reserva un turno disponible con éxito', async () => {
  const usuario = { id: '507f1f77bcf86cd799439011', roles: [Rol.PACIENTE] };
  const paciente = {
    id: '507f1f77bcf86cd799439012',
    usuario: { id: '507f1f77bcf86cd799439011' },
    nombre: 'Pepito',
  };
  const medico = {
    _id: '507f1f77bcf86cd799439013',
    id: '507f1f77bcf86cd799439013',
    usuario: { id: 'um-1' },
    nombre: 'Dr. House',
    especialidades: ['507f1f77bcf86cd799439014'],
    practicas: [],
  };
  const slot = {
    _id: '507f1f77bcf86cd799439015',
    id: '507f1f77bcf86cd799439015',
    medico: '507f1f77bcf86cd799439013',
    fecha: '2026-05-24',
    horaInicio: '09:00',
    duracionMins: 30,
    estado: 'DISPONIBLE',
  };
  const servicio = {
    _id: '507f1f77bcf86cd799439014',
    nombre: 'Cardio',
    duracionTurnoEnMins: 30,
    costo: 1000,
  };

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
  const paciente = {
    id: '507f1f77bcf86cd799439012',
    usuario: { id: '507f1f77bcf86cd799439011' },
    nombre: 'Pepito',
  };
  const slot = {
    _id: '507f1f77bcf86cd799439015',
    id: '507f1f77bcf86cd799439015',
    medico: '507f1f77bcf86cd799439013',
    fecha: '2026-05-24',
    horaInicio: '09:00',
    duracionMins: 30,
    estado: 'RESERVADO',
  };
  const servicio = {
    _id: '507f1f77bcf86cd799439014',
    nombre: 'Cardio',
    duracionTurnoEnMins: 30,
    costo: 1000,
  };

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
  const dto = { id_usuario: '507f1f77bcf86cd799439011', id_servicio: 's-1', slotsIds: ['slot-1'] };
  await expect(service.reservarTurno(dto)).rejects.toThrow(NotFoundError);
});

it('cancela un turno reservado con más de una hora de antelación', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-05-17T10:00:00Z'));

  const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
  const paciente = { id: 'p-paciente', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };
  const medico = {
    _id: 'm-1',
    id: 'm-1',
    usuario: { id: 'um-1' },
    nombre: 'Dr. House',
    disponibilidades: [],
  };

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
      sede: {
        id_sede: null,
        nombre: 'Sede',
      },
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
  const medico = {
    _id: 'm-1',
    id: 'm-1',
    usuario: { _id: 'u-medico' },
    nombre: 'Dr. Strange',
    sedes: [{ _id: 'sede-1', nombre: 'Sede Central' }],
  };
  const paciente = { id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Pepito' };

  const turno = new Turno(
    medico,
    paciente,
    '2026-05-17',
    '09:00',
    { nombre: 'Sede Central' },
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
  it('falla si el mismo usuario que propuso el cambio intenta responder la propuesta', async () => {
    const usuario = { id: 'u-paciente' };
    const turno = {
      id: 't-1',
      paciente: { usuario: 'u-paciente' },
      propuestaCambio: { proponenteId: 'u-paciente', nuevaFechaHora: '2026-06-01T10:00:00Z' },
    };
    mockUsuarioRepository.findById.mockResolvedValue(usuario);
    mockTurnoRepository.findById.mockResolvedValue(turno);

    await expect(service.responderReprogramacion('u-paciente', 't-1', true)).rejects.toThrow(
      ConflictError,
    );
  });
});

// ==========================================
// TESTS: RESTRICCIÓN DE SEDE AL CONFIRMAR
// ==========================================
describe('Restricción de Sede al Confirmar Turno', () => {
  let usuarioMedico, usuarioPaciente, medico, paciente, turnoAConfirmar, turnoOriginal;
  const fechaFuturaValida = new Date('2026-05-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T10:00:00.000Z'));

    usuarioMedico = { id: 'u-medico', roles: [Rol.MEDICO] };
    usuarioPaciente = { id: 'u-paciente', _id: 'u-paciente', roles: [Rol.PACIENTE] };
    medico = {
      id: 'm-1',
      _id: 'm-1',
      usuario: 'u-medico',
      nombre: 'Dr. Strange',
      sedes: [
        { _id: 'sede-ramos', nombre: 'Sede Ramos' },
        { _id: 'sede-1', nombre: 'Sede Central' },
      ],
    };
    paciente = { id: 'p-1', _id: 'p-1', usuario: { _id: 'u-paciente' }, nombre: 'Sebastián' };

    // Instanciamos el Turno A Confirmar
    turnoAConfirmar = new Turno(
      medico,
      paciente,
      '2026-05-24',
      '10:00',
      null,
      { nombre: 'Cardio' },
      1000,
    );
    turnoAConfirmar.id = 't-confirmar';
    turnoAConfirmar.estado = new Reservado(turnoAConfirmar);
    turnoAConfirmar.fechaHora = new Date('2026-05-24T00:00:00.000Z');

    // Instanciamos el Turno Original (para reprogramaciones)
    turnoOriginal = new Turno(
      medico,
      paciente,
      '2026-05-24',
      '13:00',
      { nombre: 'Sede Central' },
      { _id: 's-cardio', nombre: 'Cardiología', codigo: 'CARD-01' },
      1500,
    );
    turnoOriginal.id = 't-original';
    turnoOriginal.estado = new Reservado(turnoOriginal);
    turnoOriginal.fechaHora = new Date('2026-05-24T13:00:00.000Z');

    turnoOriginal.solicitarReprogramacion = jest.fn().mockReturnValue({ id: 'notif-proponer' });
    turnoOriginal.actualizarEstado = jest.fn().mockReturnValue({ id: 'notif-responder' });

    mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico);
    mockTurnoRepository.findById.mockResolvedValue(turnoAConfirmar);
    mockNotificacionRepository.save.mockResolvedValue({ id: 'notif-1' });
    mockTurnoRepository.save.mockResolvedValue(turnoAConfirmar);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('falla con BadRequestError si es el primer turno del día y no se envía sede en el body', async () => {
    mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([]);

    await expect(service.confirmarTurno('u-medico', 't-confirmar', undefined)).rejects.toThrow(
      BadRequestError,
    );

    expect(mockTurnoRepository.save).not.toHaveBeenCalled();
  });

  it('propone una reprogramación con éxito si hay bache disponible y coincide la especialidad', async () => {
    const slotDestinoBache = {
      _id: 's-bache',
      id: 's-bache',
      medico: 'm-1',
      fecha: '2026-05-24',
      horaInicio: '10:00',
      duracionMins: 30,
      estado: 'DISPONIBLE',
      servicio: { _id: 's-cardio', nombre: 'Cardiología' },
    };

    turnoOriginal.servicio = { _id: 's-cardio', nombre: 'Cardiología' };

    mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
    mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);
    mockSlotRepository.findByMedicFechaHora.mockResolvedValue(slotDestinoBache);

    const resultado = await service.proponerReprogramacion(
      'u-paciente',
      't-original',
      fechaFuturaValida,
      'Fuerza mayor',
    );

    expect(mockSlotRepository.findByMedicFechaHora).toHaveBeenCalled();
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
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T12:30:00.000Z')); // Menos de una hora de 13:00

    mockUsuarioRepository.findById.mockResolvedValue(usuarioPaciente);
    mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);

    await expect(
      service.proponerReprogramacion('u-paciente', 't-original', fechaFuturaValida, 'Fuerza mayor'),
    ).rejects.toThrow(ConflictError);

    expect(mockTurnoRepository.save).not.toHaveBeenCalled();
  });

  it('propaga la sede a los slots disponibles si es el primer turno del día y viene la sede en el body', async () => {
    const slotDisponible = {
      id: 's-1',
      fecha: new Date('2026-05-24T00:00:00.000Z'),
      estado: 'DISPONIBLE',
      sede: null,
    };
    mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotDisponible]);
    mockSlotRepository.save.mockResolvedValue({});

    const resultado = await service.confirmarTurno('u-medico', 't-confirmar', 'sede-ramos');

    expect(resultado.sede?.id_sede || resultado.sede?._id).toBe('sede-ramos');
    expect(slotDisponible.sede?.id_sede || slotDisponible.sede?._id || slotDisponible.sede).toBe(
      'sede-ramos',
    );
    expect(mockSlotRepository.save).toHaveBeenCalledWith(slotDisponible);
  });

  it('falla con ConflictError si ya hay una sede seteada en el día e intenta mandar una distinta', async () => {
    const slotConSedePrevia = {
      id: 's-1',
      fecha: new Date('2026-05-24T00:00:00.000Z'),
      estado: 'RESERVADO',
      sede: { _id: 'sede-ramos', nombre: 'Ramos' },
    };
    mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotConSedePrevia]);

    await expect(
      service.confirmarTurno('u-medico', 't-confirmar', 'sede-san-justo'),
    ).rejects.toThrow(ConflictError);

    expect(mockTurnoRepository.save).not.toHaveBeenCalled();
  });

  it('hereda automáticamente la sede si ya se seteó antes y el body viene vacío', async () => {
    const slotConSedePrevia = {
      id: 's-1',
      fecha: new Date('2026-05-24T00:00:00.000Z'),
      estado: 'RESERVADO',
      sede: { _id: 'sede-ramos', nombre: 'Ramos' },
    };
    mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotConSedePrevia]);

    const resultado = await service.confirmarTurno('u-medico', 't-confirmar', undefined);

    const sedeId = resultado.sede?.id_sede || resultado.sede?._id || resultado.sede;
    expect(sedeId).toBe('sede-ramos');
    expect(mockTurnoRepository.save).toHaveBeenCalled();
  });

  it('permite confirmar si ya hay una sede seteada y vuelve a mandar exactamente el mismo ID', async () => {
    const slotConSedePrevia = {
      id: 's-1',
      fecha: new Date('2026-05-24T00:00:00.000Z'),
      estado: 'RESERVADO',
      sede: { _id: 'sede-ramos', nombre: 'Ramos' },
    };
    mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotConSedePrevia]);

    const resultado = await service.confirmarTurno('u-medico', 't-confirmar', 'sede-ramos');

    const sedeId = resultado.sede?.id_sede || resultado.sede?._id || resultado.sede;
    expect(sedeId).toBe('sede-ramos');
    expect(mockTurnoRepository.save).toHaveBeenCalled();
  });

  it('acepta la propuesta de reprogramación, actualiza la fecha y limpia la propuesta', async () => {
    turnoOriginal.propuestaCambio = {
      nuevaFechaHora: fechaFuturaValida,
      proponenteId: 'u-paciente',
    };

    const slotNuevo = {
      _id: 's-nuevo',
      id: 's-nuevo',
      medico: 'm-1',
      fecha: '2026-05-24',
      horaInicio: '10:00',
      duracionMins: 30,
      estado: 'DISPONIBLE',
      servicio: { _id: 's-cardio', nombre: 'Cardiología' },
    };

    mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico);
    mockTurnoRepository.findById.mockResolvedValue(turnoOriginal);
    mockSlotRepository.model = { findOne: jest.fn().mockResolvedValue(null) };
    mockSlotRepository.findByMedicFechaHora.mockResolvedValue(slotNuevo);
    mockTurnoRepository.save.mockResolvedValue(turnoOriginal);

    const resultado = await service.responderReprogramacion('u-medico', 't-original', true);

    expect(resultado.fechaHora).toEqual(new Date(fechaFuturaValida));
    expect(resultado.propuestaCambio).toBeNull();
    expect(mockTurnoRepository.save).toHaveBeenCalledWith(turnoOriginal);
  });
});
