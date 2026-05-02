/* Ya paso OK
import { MotorCostos } from './MotorCostos.js';
import { PlanPrepaga } from './PlanPrepaga.js';
import { PlanParticular } from './PlanParticular.js';
import { NivelCobertura } from './NivelCobertura.js';

describe('MotorCostos', () => {

  const turnoMockPractica = {
    practica: { nombre: 'Radiografía', costoBase: 5000, id: 1 }
  };

  const turnoMockEspecialidad = {
    especialidad: { nombre: 'Cardiologia', costoConsulta: 10000, id: 2 }
  };

  it('debería cobrar el 100% como NO_CUBIERTA si no hay plan (PlanParticular default)', () => {
    const pacienteBase = null;
    const motor = new MotorCostos();
    const resultado = motor.calcularPara(turnoMockPractica, pacienteBase);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.NO_CUBIERTA);
    expect(resultado.costoEstimado).toBe(5000);
  });

  it('debería delegar polimórficamente a PlanPrepaga', () => {
    const miPrepaga = new PlanPrepaga('OSDE');
    miPrepaga.obtenerCoberturaPorPractica = () => NivelCobertura.PARCIAL;
    miPrepaga.porcentajeCopago = 0.50;

    const pacientePrepaga = { plan: miPrepaga };
    const motor = new MotorCostos();
    const resultado = motor.calcularPara(turnoMockPractica, pacientePrepaga);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.PARCIAL);
    expect(resultado.costoEstimado).toBe(2500);
  });

  it('debería cobrar 0 si la prepaga cubre TOTAL', () => {
    const miPrepaga = new PlanPrepaga('Swiss Medical');
    miPrepaga.obtenerCoberturaPorEspecialidad = () => NivelCobertura.TOTAL;

    const pacientePrepaga = { plan: miPrepaga };
    const motor = new MotorCostos();
    const resultado = motor.calcularPara(turnoMockEspecialidad, pacientePrepaga);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.TOTAL);
    expect(resultado.costoEstimado).toBe(0);
  });

  it('debería lanzar error si el turno no tiene prestación', () => {
    const motor = new MotorCostos();
    expect(() => motor.calcularPara({}, null)).toThrow('Turno inválido sin prestación');
  });

  it('debería cobrar el costo base completo si obtenerCoberturaPorPractica devuelve undefined', () => {
    const miPrepaga = new PlanPrepaga('Galeno');
    miPrepaga.obtenerCoberturaPorPractica = () => undefined;

    const pacientePrepaga = { plan: miPrepaga };
    const motor = new MotorCostos();
    const resultado = motor.calcularPara(turnoMockPractica, pacientePrepaga);

    expect(resultado.tipoCobertura).toBe(NivelCobertura.NO_CUBIERTA);
    expect(resultado.costoEstimado).toBe(5000);
  });

  it('debería lanzar error si la cobertura es PARCIAL y no tiene porcentajeCopago configurado', () => {
    const miPrepaga = new PlanPrepaga('Sancor');
    miPrepaga.obtenerCoberturaPorPractica = () => NivelCobertura.PARCIAL;
    miPrepaga.porcentajeCopago = undefined;

    const pacientePrepaga = { plan: miPrepaga };
    const motor = new MotorCostos();
    
    expect(() => motor.calcularPara(turnoMockPractica, pacientePrepaga)).toThrow('no tiene porcentajeCopago configurado');
  });
});
*/