// utils/dateUtils.js

export { 
    crearFechaDesdeAtributos, 
    horaAMinutos, 
    sumarMinutosADate, 
    obtenerDisponibilidadesLibres,
    estaEnDisponibilidad
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

const estaEnDisponibilidad = (fecha, disponibilidad) => {
    // 1. Mapeo del Enum (ajustar según cómo esté definido tu Enum)
    // JS Date.getDay(): 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
    const diaDeLaFecha = fecha.getDay();
    
    // Asumimos que disponibilidad.diaSemana ya devuelve el número correcto.
    // Si tu Enum empieza en 0=Lunes, deberías hacer: (disponibilidad.diaSemana + 1) % 7
    if (diaDeLaFecha !== disponibilidad.diaSemana) {
        return false;
    }

    // 2. Convertir hora de la fecha a minutos
    const minutosFecha = (fecha.getHours() * 60) + fecha.getMinutes();

    // 3. Auxiliar para "HH:mm" a minutos
    const stringAMinutos = (str) => {
        const [hh, mm] = str.split(':').map(Number);
        return (hh * 60) + mm;
    };

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
const obtenerDisponibilidadesLibres = (disponibilidades, turnosDisponibles) => {
    const todosLosHuecos = [];

    const stringAMinutos = (str) => {
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

        // 1. Filtrar los turnos que caen en este día y dentro de este rango horario
        const turnosQuePisan = turnosDisponibles.filter(t => {
            const diaCoincide = t.fechaHora.getDay() === disp.diaSemana;
            const minutosTurno = (t.fechaHora.getHours() * 60) + t.fechaHora.getMinutes();
            return diaCoincide && minutosTurno >= inicioDisp && minutosTurno < finDisp;
        });

        // 2. Bloque inicial a recortar
        let fragmentosLibres = [{ inicio: inicioDisp, fin: finDisp }];

        // 3. Aplicar el "recorte" por cada turno disponible existente
        turnosQuePisan.forEach(turno => {
            const tInicio = (turno.fechaHora.getHours() * 60) + turno.fechaHora.getMinutes();
            // Acceso dinámico a la duración desde el servicio del turno
            const tFin = tInicio + turno.servicio.duracionTurnoEnMins;

            let nuevosFragmentos = [];
            fragmentosLibres.forEach(f => {
                // Si no hay solapamiento, el fragmento sigue igual
                if (tFin <= f.inicio || tInicio >= f.fin) {
                    nuevosFragmentos.push(f);
                } else {
                    // Si el turno divide el fragmento:
                    // Hueco antes del turno
                    if (tInicio > f.inicio) {
                        nuevosFragmentos.push({ inicio: f.inicio, fin: tInicio });
                    }
                    // Hueco después del turno
                    if (tFin < f.fin) {
                        nuevosFragmentos.push({ inicio: tFin, fin: f.fin });
                    }
                }
            });
            fragmentosLibres = nuevosFragmentos;
        });

        // 4. Mapear los resultados finales al formato Disponibilidad
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