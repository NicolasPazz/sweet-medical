import { TurnoBusquedaService } from './TurnoBusquedaService.js';
import { NivelCobertura } from '../domain/cobertura/NivelCobertura.js';
import { BadRequestError } from '../errors/AppError.js';
import { jest } from '@jest/globals';

describe('TurnoBusquedaService', () => {
  const mockRepo = {
    buscar: jest.fn(),
  };

  const mockMotorCostos = {
    calcularPara: jest.fn(),
  };

  const service = new TurnoBusquedaService(mockRepo, mockMotorCostos);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería delegar el paginado a DB cuando se busca por fecha', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [{ id: 1, practica: { nombre: 'X', costoBase: 10 } }],
      total: 100,
    });

    const paginacion = { page: 2, limit: 10, sortBy: 'fecha', sortOrder: 'desc' };

    mockMotorCostos.calcularPara.mockReturnValue({
      tipoCobertura: NivelCobertura.TOTAL,
      costoEstimado: 0,
    });

    const result = await service.buscarTurnos({}, null, paginacion);

    expect(mockRepo.buscar).toHaveBeenCalledWith(
      expect.anything(),
      { sortBy: 'fecha', sortOrder: 'desc' },
      { page: 2, limit: 10 },
    );
    expect(result.data.length).toBe(1);
    expect(result.total).toBe(100);
    expect(result.page).toBe(2);
  });

  it('debería ordenar en memoria cuando se busca por costo', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [
        { id: 1, servicio: { codigo: 'RX-001', nombre: 'X', costoBase: 5000 } },
        { id: 2, servicio: { codigo: 'RX-002', nombre: 'Y', costoBase: 1000 } },
        { id: 3, servicio: { codigo: 'RX-003', nombre: 'Z', costoBase: 8000 } },
      ],
      total: 3,
    });

    mockMotorCostos.calcularPara.mockImplementation((turno) => ({
      tipoCobertura: NivelCobertura.NO_CUBIERTA,
      costoEstimado: turno.practica.costoBase,
    }));

    const paginacion = { page: 1, limit: 2, sortBy: 'costo', sortOrder: 'asc' };

    const result = await service.buscarTurnos({}, null, paginacion);

    expect(mockRepo.buscar).toHaveBeenCalledWith(expect.anything(), null, null);
    expect(result.data.length).toBe(2);
    expect(result.data[0].id_turno).toBe(2);
    expect(result.data[1].id_turno).toBe(1);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('debería devolver arreglo vacío cuando la página excede el total de resultados', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [
        { id: 1, servicio: { codigo: 'RX-001', nombre: 'X', costoBase: 5000 } },
        { id: 2, servicio: { codigo: 'RX-002', nombre: 'Y', costoBase: 1000 } },
      ],
      total: 2,
    });

    mockMotorCostos.calcularPara.mockImplementation((turno) => ({
      tipoCobertura: NivelCobertura.NO_CUBIERTA,
      costoEstimado: turno.practica.costoBase,
    }));

    const paginacion = { page: 5, limit: 10, sortBy: 'costo', sortOrder: 'asc' };

    const result = await service.buscarTurnos({}, null, paginacion);

    expect(result.data.length).toBe(0);
    expect(result.total).toBe(2);
  });

  it('lanza BadRequestError si hay demasiados resultados para ordenar por costo', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: Array.from({ length: 501 }, (_, index) => ({
        id: index + 1,
        servicio: { codigo: `RX-${index + 1}`, nombre: 'X', costoBase: 100 },
      })),
      total: 501,
    });

    const paginacion = { page: 1, limit: 10, sortBy: 'costo', sortOrder: 'asc' };

    await expect(service.buscarTurnos({}, null, paginacion)).rejects.toThrow(BadRequestError);
  });

  it('incluye cobertura cuando hay paciente en la búsqueda', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [
        {
          id: 1,
          servicio: { codigo: 'RX-001', nombre: 'X', costoBase: 500 },
          medico: { id: 'm-1' },
          paciente: { id: 'p-1' },
          sede: { nombre: 'Sede' },
          estado: { getEstadoNombre: () => 'DISPONIBLE' },
          costo: 500,
          diaSemana: 'LUNES',
          hora: '09:00',
          historialEstados: [],
        },
      ],
      total: 1,
    });

    mockMotorCostos.calcularPara.mockReturnValue({
      tipoCobertura: NivelCobertura.PARCIAL,
      costoEstimado: 450,
    });

    const paginacion = { page: 1, limit: 10, sortBy: 'fecha', sortOrder: 'asc' };
    const paciente = { id: 'p-1' };

    const result = await service.buscarTurnos({}, paciente, paginacion);

    expect(result.data[0].cobertura).toBe(NivelCobertura.PARCIAL);
    expect(result.data[0].costoEstimado).toBe(450);
  });
});
