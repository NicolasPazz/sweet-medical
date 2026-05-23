import { TurnoService } from './TurnoService.js';
import { Turno } from '../domain/turno/Turno.js';
import { Reservado } from '../domain/notificacion/estado-turno/Reservado.js';
import { Confirmado } from '../domain/notificacion/estado-turno/Confirmado.js';
import { Rol } from '../domain/usuario/Rol.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.js';

// Mocks globales de los Repositorios
const mockTurnoRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  findAllByPatientId: jest.fn(),
  findAllByMedicId: jest.fn(),
  findAll: jest.fn(),
  findByMedicFechaHora: jest.fn(),
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

  // ==========================================
  // TESTS: RESERVA DE TURNOS
  // ==========================================
  describe('reservarTurno', () => {
    it('falla al reservar un turno cuando el usuario no existe', async () => {
      mockUsuarioRepository.findById.mockResolvedValue(null);
      const dto = { id_usuario: 'u-inexistente', id_servicio: 's-1', slotsIds: ['slot-1'] };

      await expect(service.reservarTurno(dto)).rejects.toThrow(NotFoundError);
    });

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

      await expect(service.cancelarTurno('u-paciente', 't-1', false, 'Motivo')).rejects.toThrow(ConflictError);
    });

    it('cancela un turno reservado con más de una hora de antelación', async () => {
      const usuario = { id: 'u-paciente', roles: [Rol.PACIENTE] };
      const medico = { usuario: 'u-medico', disponibilidades: [] };
      const turno = {
        paciente: { usuario: 'u-paciente' },
        medico: medico,
        estado: new Reservado({}),
        fechaHora: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 horas al futuro
        slotsAsociados: [],
        actualizarEstado: jest.fn().mockReturnValue({ id: 'notif-1' }),
      };

      mockUsuarioRepository.findById.mockResolvedValue(usuario);
      mockTurnoRepository.findById.mockResolvedValue(turno);
      mockTurnoRepository.save.mockResolvedValue(turno);

      const resultado = await service.cancelarTurno('u-paciente', 't-1', false, 'Fuerza mayor');
      expect(resultado).toBeDefined();
      expect(mockTurnoRepository.save).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTS: HISTORIAL Y LISTADOS (MAPEO DE DTOS)
  // ==========================================
  describe('Mapeo de Historial y Listados', () => {
    it('obtiene historial de turno mapeado para un paciente y un médico existentes', async () => {
      mockMedicoRepository.findByIdUsuario.mockResolvedValue({ id: 'm-1', nombre: 'Dr. House' });
      mockPacienteRepository.findByIdUsuario.mockResolvedValue({ id: 'p-1' });
      
      const turnoMock = {
        id: 't-1',
        medico: { id: 'm-1', nombre: 'Dr. House' },
        paciente: { id: 'p-1' },
        fechaHora: '2026-05-30T10:00:00Z',
        sede: 'Sede Ramos',
        servicio: { _id: 's-1', nombre: 'Cardio' },
        estado: { getEstadoNombre: () => 'RESERVADO' },
        historialEstados: [],
        costo: 1500,
        diaSemana: 'SABADO',
        hora: '10:00',
      };
      mockTurnoRepository.findAllByPatientId.mockResolvedValue([turnoMock]);

      const resultado = await service.obtenerHistorial('p-1', 'm-1');

      expect(resultado).toEqual([
        expect.objectContaining({
          id_turno: 't-1',
          nombreMedico: 'Dr. House',
          servicio_nombre: 'Cardio',
          estado: 'RESERVADO',
        }),
      ]);
    });

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

      await expect(service.confirmarTurno('u-medico', 't-1', 'sede-1')).rejects.toThrow(ConflictError);
    });
  });

  // ==========================================
  // TESTS: FINALIZAR TURNO
  // ==========================================
  describe('finalizarTurno', () => {
    it('finaliza un turno confirmado y actualiza el médico', async () => {
      const usuarioMedico = { id: 'u-medico', roles: [Rol.MEDICO] };
      const turno = {
        id: 't-1',
        medico: { usuario: 'u-medico', turnosActualesYFuturos: [] },
        estado: new Confirmado({}),
        slotsAsociados: [],
        actualizarEstado: jest.fn(),
      };
      mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico);
      mockTurnoRepository.findById.mockResolvedValue(turno);

      const resultado = await service.finalizarTurno('u-medico', 't-1');
      expect(resultado).toBeDefined();
      expect(mockTurnoRepository.save).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTS: PROCESO BATCH (REFRESCAR SLOTS)
  // ==========================================
  describe('refrescarSlots (Batch Process)', () => {
    it('procesa un lote de médicos sin fallar', async () => {
      mockMedicoRepository.findAll.mockResolvedValue([]);
      await expect(service.refrescarSlots()).resolves.toBeUndefined();
    });
  });

  // ==========================================
  // TESTS: REPROGRAMACIONES
  // ==========================================
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

      await expect(service.responderReprogramacion('u-paciente', 't-1', true)).rejects.toThrow(ConflictError);
    });
  });

  // ==========================================
  // TESTS: RESTRICCIÓN DE SEDE AL CONFIRMAR
  // ==========================================
  describe('Restricción de Sede al Confirmar Turno', () => {
    let usuarioMedico, medico, paciente, turnoAConfirmar;

    beforeEach(() => {
      usuarioMedico = { id: 'u-medico', roles: [Rol.MEDICO] };
      medico = { id: 'm-1', _id: 'm-1', usuario: 'u-medico', nombre: 'Dr. Strange' };
      paciente = { id: 'p-1', nombre: 'Pepito' };
      
      // Instanciamos el Turno
      turnoAConfirmar = new Turno(medico, paciente, '2026-05-24', '10:00', null, { nombre: 'Cardio' }, 1000);
      turnoAConfirmar.id = 't-confirmar';
      turnoAConfirmar.estado = new Reservado(turnoAConfirmar);
      
      // SOLUCIÓN: Usamos un string de fecha ISO completo para evitar el desfase de zona horaria en toDateString()
      turnoAConfirmar.fechaHora = new Date('2026-05-24T00:00:00.000Z');

      mockUsuarioRepository.findById.mockResolvedValue(usuarioMedico);
      mockTurnoRepository.findById.mockResolvedValue(turnoAConfirmar);
      mockNotificacionRepository.save.mockResolvedValue({ id: 'notif-1' });
      mockTurnoRepository.save.mockResolvedValue(turnoAConfirmar);
    });

    it('falla con BadRequestError si es el primer turno del día y no se envía sede en el body', async () => {
      mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([]); 

      await expect(
        service.confirmarTurno('u-medico', 't-confirmar', undefined)
      ).rejects.toThrow(BadRequestError);

      expect(mockTurnoRepository.save).not.toHaveBeenCalled();
    });

    it('propaga la sede a los slots disponibles si es el primer turno del día y viene la sede en el body', async () => {
      // Usamos el mismo formato de fecha ISO para el slot del mock
      const slotDisponible = { 
        id: 's-1', 
        fecha: new Date('2026-05-24T00:00:00.000Z'), 
        estado: 'DISPONIBLE', 
        sede: null 
      };
      mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotDisponible]);
      mockSlotRepository.save.mockResolvedValue({});

      const resultado = await service.confirmarTurno('u-medico', 't-confirmar', 'sede-ramos');

      expect(resultado.sede).toBe('sede-ramos');
      expect(slotDisponible.sede).toBe('sede-ramos');
      expect(mockSlotRepository.save).toHaveBeenCalledWith(slotDisponible);
    });

    it('falla con ConflictError si ya hay una sede seteada en el día e intenta mandar una distinta', async () => {
      const slotConSedePrevia = { 
        id: 's-1', 
        fecha: new Date('2026-05-24T00:00:00.000Z'), 
        estado: 'RESERVADO', 
        sede: 'sede-ramos' 
      };
      mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotConSedePrevia]);

      await expect(
        service.confirmarTurno('u-medico', 't-confirmar', 'sede-san-justo')
      ).rejects.toThrow(ConflictError);

      expect(mockTurnoRepository.save).not.toHaveBeenCalled();
    });

    it('hereda automáticamente la sede si ya se seteó antes y el body viene vacío', async () => {
      const slotConSedePrevia = { 
        id: 's-1', 
        fecha: new Date('2026-05-24T00:00:00.000Z'), 
        estado: 'RESERVADO', 
        sede: 'sede-ramos' 
      };
      mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotConSedePrevia]);

      const resultado = await service.confirmarTurno('u-medico', 't-confirmar', undefined);

      expect(resultado.sede).toBe('sede-ramos');
      expect(mockTurnoRepository.save).toHaveBeenCalled();
    });

    it('permite confirmar si ya hay una sede seteada y vuelve a mandar exactamente el mismo ID', async () => {
      const slotConSedePrevia = { 
        id: 's-1', 
        fecha: new Date('2026-05-24T00:00:00.000Z'), 
        estado: 'RESERVADO', 
        sede: 'sede-ramos' 
      };
      mockSlotRepository.findAllSlotsByMedicId.mockResolvedValue([slotConSedePrevia]);

      const resultado = await service.confirmarTurno('u-medico', 't-confirmar', 'sede-ramos');

      expect(resultado.sede).toBe('sede-ramos');
      expect(mockTurnoRepository.save).toHaveBeenCalled();
    });
  });
});