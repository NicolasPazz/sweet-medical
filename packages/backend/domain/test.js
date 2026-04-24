import { GeneradorDisponibilidad } from './agenda/GeneradorDisponibilidad.js';

let disponibilidades = [
    { diaSemana: "Lunes", horaDesde: 2, horaHasta: 4 },
    { diaSemana: "Lunes", horaDesde: 23, horaHasta: 1 } // Cruza medianoche
];

const bloqueNuevo = { diaSemana: "Lunes", horaDesde: 22 , horaHasta: 23.5 };

console.log("LISTA INICIAL: ");

console.log(disponibilidades);

GeneradorDisponibilidad.actualizarDisponibilidad(bloqueNuevo, disponibilidades);

console.log("LISTA FINAL: ");

console.log(disponibilidades);
