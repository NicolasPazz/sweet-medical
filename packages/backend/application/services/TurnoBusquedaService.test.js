/* Ya paso OK
import { TurnoBusquedaService } from './TurnoBusquedaService.js';
import { NivelCobertura } from '../../domain/cobertura/NivelCobertura.js';
import { jest } from '@jest/globals';

describe('TurnoBusquedaService', () => {

  const mockRepo = {
    buscar: jest.fn()
  };

  const mockMotorCostos = {
    calcularPara: jest.fn()
  };

  const service = new TurnoBusquedaService(mockRepo, mockMotorCostos);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería delegar el paginado a DB cuando se busca por fecha', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [{ id: 1, practica: { nombre: 'X', costoBase: 10 } }],
      total: 100
    });

    const paginacion = { page: 2, limit: 10, sortBy: 'fecha', sortOrder: 'desc' };
    
    mockMotorCostos.calcularPara.mockReturnValue({
      tipoCobertura: NivelCobertura.TOTAL,
      costoEstimado: 0
    });

    const result = await service.buscarTurnos({}, null, paginacion);

    expect(mockRepo.buscar).toHaveBeenCalledWith(expect.anything(), { sortBy: 'fecha', sortOrder: 'desc' }, { page: 2, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.total).toBe(100);
    expect(result.page).toBe(2);
  });

  it('debería ordenar en memoria cuando se busca por costo', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [
        { id: 1, practica: { nombre: 'X', costoBase: 5000 } },
        { id: 2, practica: { nombre: 'Y', costoBase: 1000 } },
        { id: 3, practica: { nombre: 'Z', costoBase: 8000 } }
      ],
      total: 3
    });

    mockMotorCostos.calcularPara.mockImplementation((turno) => ({
      tipoCobertura: NivelCobertura.NO_CUBIERTA,
      costoEstimado: turno.practica.costoBase
    }));

    const paginacion = { page: 1, limit: 2, sortBy: 'costo', sortOrder: 'asc' };

    const result = await service.buscarTurnos({}, null, paginacion);

    expect(mockRepo.buscar).toHaveBeenCalledWith(expect.anything(), null, null);
    
    expect(result.data.length).toBe(2);
    expect(result.data[0].id).toBe(2);
    expect(result.data[1].id).toBe(1);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('debería devolver arreglo vacío cuando la página excede el total de resultados', async () => {
    mockRepo.buscar.mockResolvedValue({
      data: [
        { id: 1, practica: { nombre: 'X', costoBase: 5000 } },
        { id: 2, practica: { nombre: 'Y', costoBase: 1000 } }
      ],
      total: 2
    });

    mockMotorCostos.calcularPara.mockImplementation((turno) => ({
      tipoCobertura: NivelCobertura.NO_CUBIERTA,
      costoEstimado: turno.practica.costoBase
    }));

    const paginacion = { page: 5, limit: 10, sortBy: 'costo', sortOrder: 'asc' };

    const result = await service.buscarTurnos({}, null, paginacion);

    expect(result.data.length).toBe(0);
    expect(result.total).toBe(2);
  });
});
*/
