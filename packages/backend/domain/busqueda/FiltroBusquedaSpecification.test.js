import { FiltroBusquedaSpecification } from './FiltroBusquedaSpecification.js';

describe('FiltroBusquedaSpecification', () => {
  it('debe mapear los filtros a un criteria válido', () => {
    const filtros = {
      profesionalId: 'med123',
      especialidad: 'Cardiologia',
      practica: 'RX-001',
      sede: 'Centro',
      fechaDesde: '2026-05-20',
      fechaHasta: '2026-05-25',
    };

    const spec = new FiltroBusquedaSpecification(filtros);
    expect(spec.toCriteria()).toEqual(filtros);
  });

  it('debe permitir filtros parciales sin romper la construcción', () => {
    const filtros = { especialidad: 'Dermatologia' };
    const spec = new FiltroBusquedaSpecification(filtros);

    expect(spec.toCriteria()).toEqual({
      profesionalId: undefined,
      especialidad: 'Dermatologia',
      practica: undefined,
      sede: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
    });
  });
});
