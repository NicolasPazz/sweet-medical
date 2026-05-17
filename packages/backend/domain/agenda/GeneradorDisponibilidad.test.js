import { GeneradorDisponibilidad } from './GeneradorDisponibilidad.js';

describe('GeneradorDisponibilidad', () => {
  it('agrega una disponibilidad si no hay colisión', () => {
    const disponibilidades = [{ diaSemana: 'LUNES', horaDesde: 8, horaHasta: 10 }];
    const bloqueNuevo = { diaSemana: 'MARTES', horaDesde: 9, horaHasta: 11 };

    const resultado = GeneradorDisponibilidad.actualizarDisponibilidad(
      bloqueNuevo,
      disponibilidades,
    );

    expect(resultado).toHaveLength(2);
    expect(resultado).toContainEqual(expect.objectContaining(bloqueNuevo));
  });

  it('fusiona bloques colisionantes en un solo rango y normaliza medianoche', () => {
    const disponibilidades = [{ diaSemana: 'LUNES', horaDesde: 22, horaHasta: 2 }];
    const bloqueNuevo = { diaSemana: 'LUNES', horaDesde: 1, horaHasta: 4 };

    const resultado = GeneradorDisponibilidad.actualizarDisponibilidad(
      bloqueNuevo,
      disponibilidades,
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].diaSemana).toBe('LUNES');
    expect(resultado[0].horaDesde).toBe(22);
    expect(resultado[0].horaHasta).toBe(4);
  });

  it('identifica horas dentro de rangos normales y rango nocturno', () => {
    expect(GeneradorDisponibilidad.isTimeInRange(9, 8, 10)).toBe(true);
    expect(GeneradorDisponibilidad.isTimeInRange(10, 8, 10)).toBe(true);
    expect(GeneradorDisponibilidad.isTimeInRange(7, 8, 10)).toBe(false);
    expect(GeneradorDisponibilidad.isTimeInRange(23, 22, 2)).toBe(true);
    expect(GeneradorDisponibilidad.isTimeInRange(1, 22, 2)).toBe(true);
    expect(GeneradorDisponibilidad.isTimeInRange(3, 22, 2)).toBe(false);
  });

  it('detecta colisiones entre rangos que cruzan medianoche', () => {
    const rangoA = { diaSemana: 'LUNES', horaDesde: 22, horaHasta: 2 };
    const rangoB = { diaSemana: 'LUNES', horaDesde: 1, horaHasta: 3 };
    expect(GeneradorDisponibilidad.hayColision(rangoA, rangoB)).toBe(true);
  });
});
