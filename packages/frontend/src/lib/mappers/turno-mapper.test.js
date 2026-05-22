import { mapTurnoBusquedaToCartItem } from './turno-mapper';

describe('mapTurnoBusquedaToCartItem', () => {
  it('normaliza id_turno y preserva costoEstimado', () => {
    const dto = {
      id_turno: 'abc123',
      costoEstimado: 450,
      cobertura: 'PARCIAL',
      profesional: { id: 'm1', nombre: 'Dr. Test' },
      sede: 'Sede Centro',
      estado: 'DISPONIBLE',
    };

    const item = mapTurnoBusquedaToCartItem(dto);

    expect(item.id).toBe('abc123');
    expect(item.costoEstimado).toBe(450);
    expect(item.cobertura).toBe('PARCIAL');
    expect(item.medico).toEqual(dto.profesional);
    expect(item.sede).toBe('Sede Centro');
    expect(item.estado).toBe('DISPONIBLE');
  });

  it('usa id cuando ya viene del TurnoMapper', () => {
    const item = mapTurnoBusquedaToCartItem({
      id: 'turno-99',
      costoEstimado: 0,
    });

    expect(item.id).toBe('turno-99');
    expect(item.costoEstimado).toBe(0);
  });
});
