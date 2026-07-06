import { MotorCostos } from './MotorCostos.js';
import { PlanPrepaga } from './PlanPrepaga.js';
import { NivelCobertura } from './NivelCobertura.js';

describe('MotorCostos', () => {
  const turnoMockPractica = {
    practica: { nombre: 'Radiografía', costoBase: 5000, id: 1 },
  };

  const turnoMockEspecialidad = {
    especialidad: { nombre: 'Cardiologia', costoConsulta: 10000, id: 2 },
  };

  xit('debería cobrar el 100% como NO_CUBIERTA si no hay plan (PlanParticular default)', () => {
    const pacienteBase = null;
    const resultado = MotorCostos.calcularPara(turnoMockPractica, pacienteBase);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.NO_CUBIERTA);
    expect(resultado.costoEstimado).toBe(5000);
  });

  xit('debería delegar polimórficamente a PlanPrepaga con copago parcial', () => {
    const miPrepaga = new PlanPrepaga('OSDE');
    miPrepaga.obtenerCoberturaPorPractica = () => NivelCobertura.PARCIAL;
    miPrepaga.porcentajeCopago = 0.5;

    const pacientePrepaga = { plan: miPrepaga };
    const resultado = MotorCostos.calcularPara(turnoMockPractica, pacientePrepaga);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.PARCIAL);
    expect(resultado.costoEstimado).toBe(2500);
  });

  xit('debería cobrar 0 si la prepaga cubre TOTAL', () => {
    const miPrepaga = new PlanPrepaga('Swiss Medical');
    miPrepaga.obtenerCoberturaPorEspecialidad = () => NivelCobertura.TOTAL;

    const pacientePrepaga = { plan: miPrepaga };
    const resultado = MotorCostos.calcularPara(turnoMockEspecialidad, pacientePrepaga);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.TOTAL);
    expect(resultado.costoEstimado).toBe(0);
  });

  it('debería lanzar error si el turno no tiene prestación', () => {
    expect(() => MotorCostos.calcularPara({}, null)).toThrow('Turno inválido sin prestación');
  });

  xit('debería cobrar el costo base completo si obtenerCoberturaPorPractica devuelve undefined', () => {
    const miPrepaga = new PlanPrepaga('Galeno');
    miPrepaga.obtenerCoberturaPorPractica = () => undefined;

    const pacientePrepaga = { plan: miPrepaga };
    const resultado = MotorCostos.calcularPara(turnoMockPractica, pacientePrepaga);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.NO_CUBIERTA);
    expect(resultado.costoEstimado).toBe(5000);
  });
});
