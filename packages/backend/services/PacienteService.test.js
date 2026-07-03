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

  xit('obtiene historial de turnos con cobertura y formatea el servicio para una PRACTICA', async () => {
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
        sede: { Generic: 'Sede Principal', nombre: 'Sede Principal' },
        estado: { getCondition: () => {}, getEstadoNombre: () => 'CONFIRMADO' },
        costo: 2000,
      },
    ]);

    const spyCalcular = jest.spyOn(MotorCostos, 'calcularPara').mockReturnValue({
      tipoCobertura: NivelCobertura.TOTAL,
      costoEstimado: 1500,
    });

    const resultado = await service.obtenerHistorialTurnos('u-paciente');

    expect(mockPacienteRepository.findByIdUsuario).toHaveBeenCalledWith('u-paciente');
    expect(mockTurnoRepository.findAllByPatientId).toHaveBeenCalledWith('p-1');
    expect(resultado[0].servicio).toBe('RX-001 - Resonancia');
    expect(resultado[0].cobertura).toBe(NivelCobertura.TOTAL);

    // Verificamos que al motor le llegó configurado como práctica
    expect(spyCalcular).toHaveBeenCalledWith(
      expect.objectContaining({
        practica: { codigo: 'RX-001', nombre: 'Resonancia', costo: 2000 },
        especialidad: null,
      }),
      paciente,
    );
  });

  xit('obtiene historial de turnos y mapea como ESPECIALIDAD si el servicio no tiene código', async () => {
    const paciente = { id: 'p-1', nombre: 'Pepito' };
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockTurnoRepository.findAllByPatientId.mockResolvedValue([
      {
        id: 't-2',
        fechaHora: new Date('2026-05-17T10:00:00Z'),
        diaSemana: 'MARTES',
        hora: '10:00',
        medico: { nombre: 'Dr. Simi' },
        servicio: { nombre: 'Pediatría', costo: 1000 }, // Sin propiedad 'codigo'
        sede: { nombre: 'Sede San Justo' },
        estado: 'PENDIENTE',
        costo: 1000,
      },
    ]);

    const spyCalcular = jest.spyOn(MotorCostos, 'calcularPara').mockReturnValue({
      tipoCobertura: NivelCobertura.PARCIAL,
    });

    const resultado = await service.obtenerHistorialTurnos('u-paciente');

    expect(resultado[0].servicio).toBe('Pediatría'); // No agrega el prefijo del código
    expect(resultado[0].cobertura).toBe(NivelCobertura.PARCIAL);

    // Verificamos que al motor le llegó correctamente mapeado como especialidad
    expect(spyCalcular).toHaveBeenCalledWith(
      expect.objectContaining({
        practica: null,
        especialidad: { nombre: 'Pediatría', costo: 1000 },
      }),
      paciente,
    );
  });

  xit('continúa el procesamiento del historial aunque falle el Motor de Costos', async () => {
    const paciente = { id: 'p-1', nombre: 'Pepito' };
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(paciente);
    mockTurnoRepository.findAllByPatientId.mockResolvedValue([
      {
        id: 't-3',
        servicio: { nombre: 'Guardia' },
        estado: 'CONFIRMADO',
      },
    ]);

    // Simulamos que el motor de costos explota por el aire
    jest.spyOn(MotorCostos, 'calcularPara').mockImplementation(() => {
      throw new Error('Reglas de negocio corruptas o incompatibles');
    });

    const resultado = await service.obtenerHistorialTurnos('u-paciente');

    // Comprobamos que el método no se rompió, capturó el error y devolvió el turno con cobertura undefined
    expect(resultado[0].id_turno).toBe('t-3');
    expect(resultado[0].cobertura).toBeUndefined();
  });

  xit('asigna "N/A" a las propiedades del turno que vengan nulas o indefinidas', async () => {
    mockPacienteRepository.findByIdUsuario.mockResolvedValue({ id: 'p-1' });
    mockTurnoRepository.findAllByPatientId.mockResolvedValue([
      {
        id: 't-vacio',
        fechaHora: null,
        medico: null,
        servicio: null,
        sede: null,
        estado: null,
      },
    ]);

    jest.spyOn(MotorCostos, 'calcularPara').mockReturnValue({ tipoCobertura: null });

    const resultado = await service.obtenerHistorialTurnos('u-paciente');

    expect(resultado[0].fechaHora).toBe('N/A');
    expect(resultado[0].medico).toBe('N/A');
    expect(resultado[0].servicio).toBe('N/A');
    expect(resultado[0].sede).toBe('N/A');
    expect(resultado[0].estado).toBe('N/A');
  });

  it('lanza NotFoundError cuando no existe el paciente', async () => {
    mockPacienteRepository.findByIdUsuario.mockResolvedValue(null);

    await expect(service.obtenerHistorialTurnos('u-paciente')).rejects.toThrow(NotFoundError);
  });
});
