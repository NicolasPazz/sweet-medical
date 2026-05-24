import { jest } from '@jest/globals';
import { TurnoService } from './TurnoService.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { MotorCostos } from '../domain/cobertura/MotorCostos.js';
import { NivelCobertura } from '../domain/cobertura/NivelCobertura.js';

describe('TurnoService - Búsqueda Global y Grid Alignment', () => {
  let service;
  
  const mockSlotRepository = {
    buscarSlotsDisponibles: jest.fn(),
  };
  const mockServicioRepository = {
    findById: jest.fn(),
  };
  const mockMedicoRepository = {
    findAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TurnoService({
      slotRepository: mockSlotRepository,
      servicioRepository: mockServicioRepository,
      medicoRepository: mockMedicoRepository,
    });
  });

  it('lanza BadRequestError si no se especifica especialidad ni práctica', async () => {
    await expect(service.buscarTurnos({}, null)).rejects.toThrow(BadRequestError);
  });

  it('filtra y agrupa slots por médico aplicando el alineamiento de grilla y contigüidad', async () => {
    const especialidadId = 'esp-cardio';
    const medico = {
      _id: 'med-1',
      id: 'med-1',
      nombre: 'Dr. House',
      especialidades: [{ _id: 'esp-cardio' }],
      sedes: [{ id: 'sede-1', nombre: 'Sede Central' }],
    };

    mockMedicoRepository.findAll.mockResolvedValue([medico]);
    
    // Especialidad de Cardiología con duración de 20 mins
    mockServicioRepository.findById.mockResolvedValue({
      _id: 'esp-cardio',
      nombre: 'Cardiología',
      duracionTurnoEnMins: 20,
      costo: 1000,
    });

    // Slots disponibles para el médico:
    // 09:10 - 09:20 (10 mins) -> No alineado (9*60+10 = 550 % 20 !== 0)
    // 09:20 - 09:30 (10 mins) -> ALINEADO (9*60+20 = 560 % 20 === 0)
    // 09:30 - 09:40 (10 mins) -> Contiguo a 09:20 (forma bloque de 20 mins)
    const slots = [
      { _id: 's1', id: 's1', medico, fecha: '2026-05-24', horaInicio: '09:10', duracionMins: 10, estado: 'DISPONIBLE' },
      { _id: 's2', id: 's2', medico, fecha: '2026-05-24', horaInicio: '09:20', duracionMins: 10, estado: 'DISPONIBLE' },
      { _id: 's3', id: 's3', medico, fecha: '2026-05-24', horaInicio: '09:30', duracionMins: 10, estado: 'DISPONIBLE' },
    ];
    mockSlotRepository.buscarSlotsDisponibles.mockResolvedValue(slots);

    jest.spyOn(MotorCostos, 'calcularPara').mockReturnValue({
      tipoCobertura: NivelCobertura.TOTAL,
      costoEstimado: 0,
    });

    const resultado = await service.buscarTurnos({ especialidad: especialidadId }, null, {}, { paginar: false });

    // Debería generar exactamente 1 turno a las 09:20
    expect(resultado.length).toBe(1);
    expect(resultado[0].hora).toBe('09:20');
    expect(resultado[0].fecha).toBe('2026-05-24');
    expect(resultado[0].medico.id).toBe('med-1');
  });

  it('ordena y pagina en memoria correctamente los turnos generados', async () => {
    const especialidadId = 'esp-cardio';
    const medico = {
      _id: 'med-1',
      id: 'med-1',
      nombre: 'Dr. House',
      especialidades: [{ _id: 'esp-cardio' }],
    };

    mockMedicoRepository.findAll.mockResolvedValue([medico]);
    
    mockServicioRepository.findById.mockResolvedValue({
      _id: 'esp-cardio',
      nombre: 'Cardiología',
      duracionTurnoEnMins: 30,
      costo: 3000,
    });

    // Slots disponibles de 30 mins
    const slots = [
      { _id: 's1', id: 's1', medico, fecha: '2026-05-24', horaInicio: '09:00', duracionMins: 30, estado: 'DISPONIBLE' },
      { _id: 's2', id: 's2', medico, fecha: '2026-05-24', horaInicio: '09:30', duracionMins: 30, estado: 'DISPONIBLE' },
      { _id: 's3', id: 's3', medico, fecha: '2026-05-24', horaInicio: '10:00', duracionMins: 30, estado: 'DISPONIBLE' },
    ];
    mockSlotRepository.buscarSlotsDisponibles.mockResolvedValue(slots);

    jest.spyOn(MotorCostos, 'calcularPara').mockImplementation((turno) => {
      // Diferentes costos para probar ordenamiento
      if (turno.hora === '09:00') return { tipoCobertura: 'PARCIAL', costoEstimado: 1500 };
      if (turno.hora === '09:30') return { tipoCobertura: 'TOTAL', costoEstimado: 0 };
      return { tipoCobertura: 'NO_CUBIERTA', costoEstimado: 3000 };
    });

    // Paginación: traer página 1, límite 2, ordenado por costo ascendente
    const paginacion = { page: 1, limit: 2, sortBy: 'costo', sortOrder: 'asc' };
    const resultado = await service.buscarTurnos({ especialidad: especialidadId }, null, paginacion);

    expect(resultado.total).toBe(3);
    expect(resultado.data.length).toBe(2);
    expect(resultado.data[0].hora).toBe('09:30'); // Costo 0 (primero)
    expect(resultado.data[1].hora).toBe('09:00'); // Costo 1500 (segundo)
  });
});
