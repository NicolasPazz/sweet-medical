import { EstadoTurno } from './EstadoTurno.js';

describe('EstadoTurno', () => {
  it('expone los estados esperados del ciclo de vida', () => {
    expect(EstadoTurno).toEqual({
      DISPONIBLE: 'DISPONIBLE',
      RESERVADO: 'RESERVADO',
      CONFIRMADO: 'CONFIRMADO',
      CANCELADO: 'CANCELADO',
      REALIZADO: 'REALIZADO',
    });
  });

  it('es un objeto inmutable para evitar transiciones arbitrarias', () => {
    expect(Object.isFrozen(EstadoTurno)).toBe(true);
    expect(() => {
      EstadoTurno.DISPONIBLE = 'NUEVO';
    }).toThrow(TypeError);
    expect(EstadoTurno.DISPONIBLE).toBe('DISPONIBLE');
  });
});
