// utils/dateUtils.js

/**
 * Transforma los atributos de DisponibilidadHoraria en un objeto Date real.
 * @param {string} diaString - El día de la semana (LUNES, MARTES, etc.) 
 * @param {number} horaDecimal - La hora en formato decimal (ej: 8.5 para 08:30)
 * @returns {Date}
 */
const crearFechaDesdeAtributos = (diaString, minutosTotales) => {
  const diasSemana = {
    "DOMINGO": 0, "LUNES": 1, "MARTES": 2, "MIERCOLES": 3,
    "JUEVES": 4, "VIERNES": 5, "SABADO": 6
  };

  const fechaActual = new Date();
  const fechaResultado = new Date(fechaActual);

  // Encontrar la próxima ocurrencia del día solicitado
  const diaObjetivo = diasSemana[diaString.toUpperCase()];
  const diaActual = fechaActual.getDay();
  let diferenciaDias = diaObjetivo - diaActual;

  if (diferenciaDias <= 0) diferenciaDias += 7; 
  
  fechaResultado.setDate(fechaActual.getDate() + diferenciaDias);

  // Convertir hora decimal a hh:mm
  const horas = Math.floor(minutosTotales/60);
  const minutos = minutosTotales % 60;

  fechaResultado.setHours(horas, minutos, 0, 0);

  return fechaResultado;
};

// Convierte un horario (ej: 8.5 para 8:30) a minutos totales (510)
const horaAMinutos = (horaDecimal) => {
    const horas = Math.floor(horaDecimal);
    const minutos = Math.round((horaDecimal - horas) * 100); 
    return (horas * 60) + minutos;
};

// Convierte minutos totales de vuelta a un formato útil o Date
const sumarMinutosADate = (fechaBase, minutosTotales) => {
    const d = new Date(fechaBase);
    d.setHours(Math.floor(minutosTotales / 60));
    d.setMinutes(minutosTotales % 60);
    return d;
};

// Exportamos la función para que la use la clase Agenda
module.exports = { crearFechaDesdeAtributos };
module.exports = { horaAMinutos };
module.exports = { sumarMinutosADate };