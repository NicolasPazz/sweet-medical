// utils/dateUtils.js

export { 
    crearFechaDesdeAtributos, 
    horaAMinutos, 
    sumarMinutosADate, 
    obtenerDisponibilidadesLibres,
    estaEnDisponibilidad,
    configurarFecha,
    calcularHoraDesdeMinutos,
    horarioIncluido
};

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
const horaAMinutos = (horaString) => {
    // Dividimos el string en dos partes: horas y minutos
    const [horas, minutos] = horaString.split(':').map(Number);
    
    // Validamos que sean números válidos (opcional pero recomendado)
    if (isNaN(horas) || isNaN(minutos)) return 0;

    return (horas * 60) + minutos;
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

// Convierte minutos totales de vuelta a un formato útil o Date
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
        const [hh, mm] = str.split(':').map(Number);
        return (hh * 60) + mm;
    };

    const minutosFecha = stringAMinutos(hora);

    const minutosInicio = stringAMinutos(disponibilidad.horaDesde);
    const minutosFin = stringAMinutos(disponibilidad.horaHasta);

    // 4. Comparación (ignorando año/mes/día)
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
        return (hh * 60) + mm;
    };

    const minutosAString = (min) => {
        const hh = Math.floor(min / 60).toString().padStart(2, '0');
        const mm = (min % 60).toString().padStart(2, '0');
        return `${hh}:${mm}`;
    };

    disponibilidades.forEach(disp => {
        const inicioDisp = stringAMinutos(disp.horaDesde);
        const finDisp = stringAMinutos(disp.horaHasta);

        // 1. Filtramos solo los turnos que OCUPAN espacio (Reservados, Asignados, etc.)
        // que coincidan con el día y caigan dentro del rango de esta disponibilidad.
        const turnosQueObstruyen = turnosNoDisponibles.filter(t => {
            const minutosTurno = stringAMinutos(t.hora);
            return t.diaSemana === disp.diaSemana && 
                   minutosTurno >= inicioDisp && 
                   minutosTurno < finDisp;
        });

        // 2. Iniciamos con el bloque completo de la disponibilidad
        let fragmentosLibres = [{ inicio: inicioDisp, fin: finDisp }];

        // 3. Aplicamos el "recorte" por cada turno que obstruye
        turnosQueObstruyen.forEach(turno => {
            const tInicio = stringAMinutos(turno.hora);
            // Si el turno no tiene práctica/servicio, asumimos una duración estándar (ej: 30 min)
            const duracion = turno.servicio?.duracionTurnoEnMins; 
            const tFin = tInicio + duracion;

            let nuevosFragmentos = [];
            fragmentosLibres.forEach(f => {
                // Si el turno está totalmente fuera del fragmento libre actual
                if (tFin <= f.inicio || tInicio >= f.fin) {
                    nuevosFragmentos.push(f);
                } else {
                    // Hay solapamiento: dividimos el fragmento en dos (antes y después del turno)
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

        console.log("FRAGMENTOS LIBRES: ");
        console.log(fragmentosLibres);

        // 4. Transformamos los minutos de nuevo a formato horario para devolver
        fragmentosLibres.forEach(f => {
            todosLosHuecos.push({
                diaSemana: disp.diaSemana,
                horaDesde: minutosAString(f.inicio),
                horaHasta: minutosAString(f.fin)
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

    // 2. Crear una copia de "ahora" para empezar a calcular
    let proximaFecha = new Date(ahora);
    
    // 3. Calcular cuántos días faltan para el próximo (día de semana)
    // Si hoy es el día objetivo, pero la hora ya pasó, buscará el de la semana que viene.
    let diasDeDiferencia = (diaSemanaObjetivo + 7 - ahora.getDay()) % 7;

    // Si es hoy pero el horario ya pasó, sumamos 7 días para que sea el "próximo"
    const minutosAhora = (ahora.getHours() * 60) + ahora.getMinutes();
    const minutosTurno = (horas * 60) + minutos;
    
    if (diasDeDiferencia === 0 && minutosTurno <= minutosAhora) {
        diasDeDiferencia = 7;
    }

    // 4. Ajustar la fecha sumando los días y seteando la hora exacta
    proximaFecha.setDate(ahora.getDate() + diasDeDiferencia);
    proximaFecha.setHours(horas, minutos, 0, 0);

    return proximaFecha;
}

function horarioIncluido(turno1, turno2){

    const minutosTurno1 = horaAMinutos(turno1.hora);
    const minutosTurno2 = horaAMinutos(turno2.hora);

    return (minutosTurno1 < (minutosTurno2 + turno2.servicio.duracionTurnoEnMins)) && (minutosTurno2 < (minutosTurno1 + turno1.servicio.duracionTurnoEnMins));
}