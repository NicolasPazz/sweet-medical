import { useState } from 'react';
import './MiniCalendar.css';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function MiniCalendar({ selectedDate, onSelectDate, availableDates = [] }) {
  // Parsea un string 'YYYY-MM-DD' a sus componentes numéricos SIN pasar por
  // el constructor Date(string) (que interpreta como medianoche UTC y luego
  // se lee con getMonth()/getFullYear() locales, pudiendo mostrar el mes
  // equivocado si el navegador está en un huso horario detrás de UTC).
  const parsearYYYYMMDD = (str) => {
    const [anio, mes, dia] = str.split('-').map(Number);
    return { anio, mes: mes - 1, dia };
  };

  const [viewDate, setViewDate] = useState(() => {
    // Si hay una fecha seleccionada, iniciar en ese mes; sino, usar hoy
    if (selectedDate) {
      const { anio, mes, dia } = parsearYYYYMMDD(selectedDate);
      return new Date(anio, mes, dia);
    }
    // Si hay fechas disponibles, iniciar en el mes de la primera disponible
    if (availableDates.length > 0) {
      const { anio, mes, dia } = parsearYYYYMMDD(availableDates[0]);
      return new Date(anio, mes, dia);
    }
    return new Date();
  });

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();

  // Calcular offset del primer día de mes (0=dom, 1=lun, etc. -> mapear a lunes como 0)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Offset lunes-primero: L=0, M=1, M=2, J=3, V=4, S=5, D=6
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const cells = [];
  for (let i = 0; i < offset; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={handlePrevMonth}>
          ‹
        </button>
        <span className="cal-month text-ellipsis">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button className="cal-nav-btn" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      <div className="cal-week-header">
        {WEEKDAYS.map((d) => (
          <div className="cal-week-day text-ellipsis" key={d}>
            {d}
          </div>
        ))}
      </div>

      <div className="cal-days">
        {cells.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} className="cal-day-empty" />;

          // Formatear fecha de la celda en YYYY-MM-DD
          const monthStr = String(viewMonth + 1).padStart(2, '0');
          const dayStr = String(d).padStart(2, '0');
          const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

          const isAvailable = availableDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <div
              key={d}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isAvailable ? 'has-slots' : 'disabled'}`}
            >
              <span className="day-number text-ellipsis">{d}</span>
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span className="legend-item text-ellipsis">
          <span className="legend-dot available" />
          Turnos disponibles
        </span>
        <span className="legend-item text-ellipsis">
          <span className="legend-dot unavailable" />
          Sin disponibilidad
        </span>
      </div>
    </div>
  );
}
