// utils/dateUtils.js
import { Disponible } from '../domain/notificacion/estado-turno/Disponible.js';

export {
  crearFechaDesdeAtributos,
  horaAMinutos,
  sumarMinutosADate,
  obtenerDisponibilidadesLibres,
  estaEnDisponibilidad,
  configurarFecha,
  calcularHoraDesdeMinutos,
  horarioIncluido,
  ordenarSlots,
  validarSlotsContiguos
};

/**
 * Transforma los atributos de DisponibilidadHoraria en un objeto Date real.
 * @param {string} diaString - El día de la semana (LUNES, MARTES, etc.)
 * @param {number} horaDecimal - La hora en formato decimal (ej: 8.5 para 08:30)
 * @returns {Date}
 */
const crearFechaDesdeAtributos = (diaString, minutosTotales) => {
  const diasSemana = {
    DOMINGO: 0,
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SABADO: 6,
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
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;

  fechaResultado.setHours(horas, minutos, 0, 0);

  return fechaResultado;
};

// Convierte un horario (ej: 8.5 para 8:30) a minutos totales (510)
const horaAMinutos = (horaString) => {
  const [horas, minutos] = horaString.split(':').map(Number);

  if (isNaN(horas) || isNaN(minutos)) return 0;

  return horas * 60 + minutos;
};

/**
 * Convierte minutos totales en un formato de hora legible (HH:mm).
 * Útil para calcular el fin de un turno basado en duracionTurnoEnMins.
 * * @param {number} minutosTotales - Cantidad de minutos (ej: 135)
 * @returns {string} - Hora formateada (ej: "02:15")
 */
function calcularHoraDesdeMinutos(minutosTotales) {
  // Calculamos las horas enteras dividiendo por 60
  const horas = Math.floor(minutosTotales / 60);

  // Obtenemos los minutos restantes usando el operador módulo (%)
  const minutosRestantes = minutosTotales % 60;

  // Formateamos para que siempre tengan dos dígitos (ej: "08" en vez de "8")
  const horasFormateadas = String(horas).padStart(2, '0');
  const minutosFormateados = String(minutosRestantes).padStart(2, '0');

  return `${horasFormateadas}:${minutosFormateados}`;
}

const sumarMinutosADate = (fechaBase, minutosTotales) => {
  const d = new Date(fechaBase);
  d.setHours(Math.floor(minutosTotales / 60));
  d.setMinutes(minutosTotales % 60);
  return d;
};

const estaEnDisponibilidad = (diaSemana, hora, disponibilidad) => {
  if (diaSemana !== disponibilidad.diaSemana) {
    return false;
  }

  const stringAMinutos = (str) => {
    if (!str) return 0;
    const [hh, mm] = str.split(':').map(Number);
    return hh * 60 + mm;
  };

  const minutosFecha = stringAMinutos(hora);
  const minutosInicio = stringAMinutos(disponibilidad.horaDesde);
  const minutosFin = stringAMinutos(disponibilidad.horaHasta);

  return minutosFecha >= minutosInicio && minutosFecha < minutosFin;
};

/**
 * Genera una lista de fragmentos de disponibilidad (huecos)
 * basándose en los turnos que están actualmente en estado Disponible.
 *
 * @param {Array} disponibilidades - Lista de { diaSemana, horaDesde, horaHasta }
 * @param {Array} turnosDisponibles - Lista de objetos Turno con estado Disponible
 * @returns {Array} - Nueva lista de objetos Disponibilidad (huecos libres)
 */
const obtenerDisponibilidadesLibres = (disponibilidades, turnosNoDisponibles) => {
  const todosLosHuecos = [];

  const stringAMinutos = (str) => {
    if (!str) return 0;
    const [hh, mm] = str.split(':').map(Number);
    return hh * 60 + mm;
  };

  const minutosAString = (min) => {
    const hh = Math.floor(min / 60)
      .toString()
      .padStart(2, '0');
    const mm = (min % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  disponibilidades.forEach((disp) => {
    const inicioDisp = stringAMinutos(disp.horaDesde);
    const finDisp = stringAMinutos(disp.horaHasta);

    const turnosQueObstruyen = turnosNoDisponibles.filter((t) => {
      const minutosTurno = stringAMinutos(t.hora);
      const esDisponible =
        t.estado instanceof Disponible ||
        (typeof t.estado === 'string' && t.estado.toUpperCase() === 'DISPONIBLE') ||
        (typeof t.estado?.getEstadoNombre === 'function' &&
          t.estado.getEstadoNombre().toUpperCase() === 'DISPONIBLE');
      return (
        t.diaSemana === disp.diaSemana &&
        minutosTurno >= inicioDisp &&
        minutosTurno < finDisp &&
        esDisponible
      );
    });

    let fragmentosLibres = [{ inicio: inicioDisp, fin: finDisp }];

    turnosQueObstruyen.forEach((turno) => {
      const tInicio = stringAMinutos(turno.hora);
      const duracion = turno.servicio?.duracionTurnoEnMins;
      if (!duracion || isNaN(duracion)) return;
      const tFin = tInicio + duracion;

      let nuevosFragmentos = [];
      fragmentosLibres.forEach((f) => {
        if (tFin <= f.inicio || tInicio >= f.fin) {
          nuevosFragmentos.push(f);
        } else {
          if (tInicio > f.inicio) {
            nuevosFragmentos.push({ inicio: f.inicio, fin: tInicio });
          }
          if (tFin < f.fin) {
            nuevosFragmentos.push({ inicio: tFin, fin: f.fin });
          }
        }
      });
      fragmentosLibres = nuevosFragmentos;
    });

    console.log('FRAGMENTOS LIBRES: ');
    console.log(fragmentosLibres);

    fragmentosLibres.forEach((f) => {
      todosLosHuecos.push({
        diaSemana: disp.diaSemana,
        horaDesde: minutosAString(f.inicio),
        horaHasta: minutosAString(f.fin),
      });
    });
  });

  return todosLosHuecos;
};

/**
 * Configura la fecha exacta de un turno buscando la próxima ocurrencia
 * del día de la semana en el que debe situarse.
 * * @param {Object} turno - Objeto Turno que contiene la fechaHora base.
 * @returns {Date} - Nueva fecha configurada para el día de la semana más cercano.
 */
function configurarFecha(turno) {
  const fechaReferencia = turno.fechaHora;
  const ahora = new Date(); // Fecha de ejecución de la función

  // 1. Obtener el día de la semana (0-6) y el horario del turno original [cite: 121]
  const diaSemanaObjetivo = fechaReferencia.getDay();
  const horas = fechaReferencia.getHours();
  const minutos = fechaReferencia.getMinutes();

  let proximaFecha = new Date(ahora);

  let diasDeDiferencia = (diaSemanaObjetivo + 7 - ahora.getDay()) % 7;

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const minutosTurno = horas * 60 + minutos;

  if (diasDeDiferencia === 0 && minutosTurno <= minutosAhora) {
    diasDeDiferencia = 7;
  }

  proximaFecha.setDate(ahora.getDate() + diasDeDiferencia);
  proximaFecha.setHours(horas, minutos, 0, 0);

  return proximaFecha;
}

function horarioIncluido(turno1, turno2) {
  const minutosTurno1 = horaAMinutos(turno1.hora);
  const minutosTurno2 = horaAMinutos(turno2.hora);

  return (
    minutosTurno1 < minutosTurno2 + turno2.servicio.duracionTurnoEnMins &&
    minutosTurno2 < minutosTurno1 + turno1.servicio.duracionTurnoEnMins
  );
}

/**
 * FUNCIÓN 2: Ordena una lista de slots basándose puramente en su hora de inicio.
 * @param {Slot[]} listaSlots - Array de objetos de la clase Slot
 * @returns {Slot[]} Un NUEVO array ordenado cronológicamente por horario
 */
function ordenarSlots(listaSlots) {
  if (!listaSlots || listaSlots.length <= 1) return listaSlots;

  // Clonamos el array para mantener el principio de inmutabilidad de DDS
  return [...listaSlots].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
}

/**
 * FUNCIÓN 1: Valida que una lista de slots pertenezcan a la MISMA FECHA y sean contiguos
 * @param {Slot[]} listaSlots - Array de objetos de la clase Slot
 * @returns {boolean} true si cumplen todas las condiciones, false si cambian de fecha o tienen baches
 */
function validarSlotsContiguos(listaSlots) {
  // Caso base: 0 o 1 slot siempre se consideran válidos por definición
  if (!listaSlots || listaSlots.length <= 1) {
    return true; 
  }

  // 1. BLINDAJE CRÍTICO: Validamos que absolutamente TODOS los slots pertenezcan a la misma fecha.
  // Tomamos la fecha del primer slot como referencia
  const fechaReferencia = listaSlots[0].fecha;
  const todosMismaFecha = listaSlots.every(slot => slot.fecha === fechaReferencia);

  if (!todosMismaFecha) {
    console.error("[VALIDACIÓN ERROR] Intento de reserva unificando slots de distintas fechas físicas.");
    return false; // Corta de una request maliciosa o corrupta
  }

  // 2. Ordenamos cronológicamente usando nuestra Función 2 (puramente por horario)
  const slotsOrdenados = ordenarSlots(listaSlots);

  // 3. Recorremos la lista comparando la ventana deslizante (actual vs siguiente)
  for (let i = 0; i < slotsOrdenados.length - 1; i++) {
    const slotActual = slotsOrdenados[i];
    const slotSiguiente = slotsOrdenados[i + 1];

    // 4. Convertimos la hora de inicio del actual a minutos y le sumamos su duración
    const minutosInicioActual = horaAMinutos(slotActual.horaInicio);
    const minutosFinActual = minutosInicioActual + slotActual.duracionMins;

    // 5. Convertimos el inicio del siguiente slot a minutos
    const minutosInicioSiguiente = horaAMinutos(slotSiguiente.horaInicio);

    // 6. Validación de Contigüidad Horaria: El fin del actual debe calzar exacto con el inicio del próximo
    if (minutosFinActual !== minutosInicioSiguiente) {
      return false; // Existe un bache o una superposición inválida
    }
  }

  // Si pasa el control de fecha unificada y el loop de contigüidad, el bloque es 100% válido
  return true;
}