import { jest } from '@jest/globals';
import { PacienteService } from './PacienteService.js';
import { NotFoundError } from '../errors/AppError.js';
import { MotorCostos } from '../domain/cobertura/MotorCostos.js';
import { NivelCobertura } from '../domain/cobertura/NivelCobertura.js';

const mockTurnoRepository = {
  findAllByPatientId: jest.fn(),
};

const mockPacienteRepository = {
  findByIdUsuario: jest.fn(),
};

describe('PacienteService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PacienteService({
      turnoRepository: mockTurnoRepository,
      pacienteRepository: mockPacienteRepository,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('obtiene historial de turnos con cobertura y formatea el servicio', async () => {
    const paciente = { id: 'p-1', nombre: 'Pepito' };
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockTurnoRepository.findAllByPatientId.mockResolvedValue([
      {
        id: 't-1',
        fechaHora: new Date('2026-05-17T09:00:00Z'),
        diaSemana: 'LUNES',
        hora: '09:00',
        medico: { nombre: 'Dr. House' },
        servicio: { codigo: 'RX-001', nombre: 'Resonancia', costo: 2000 },
        sede: { nombre: 'Sede Principal' },
        estado: { getEstadoNombre: () => 'CONFIRMADO' },
        costo: 2000,
      },
    ]);

    jest.spyOn(MotorCostos.prototype, 'calcularPara').mockReturnValue({
      tipoCobertura: NivelCobertura.TOTAL,
      costoEstimado: 1500,
    });

    const resultado = await service.obtenerHistorialTurnos('u-paciente');

    expect(mockPacienteRepository.findByIdUsuario).toHaveBeenCalledWith('u-paciente');
    expect(mockTurnoRepository.findAllByPatientId).toHaveBeenCalledWith('p-1');
    expect(resultado[0].servicio).toBe('RX-001 - Resonancia');
    expect(resultado[0].cobertura).toBe(NivelCobertura.TOTAL);
  });

  it('lanza NotFoundError cuando no existe el paciente', async () => {
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(null);

    await expect(service.obtenerHistorialTurnos('u-paciente')).rejects.toThrow(NotFoundError);
  });
});
