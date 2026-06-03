import { useState } from "react";
import "./MiniCalendar.css";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function MiniCalendar({ selectedDate, onSelectDate, availableDates = [] }) {
  const [viewDate, setViewDate] = useState(() => {
    // Si hay una fecha seleccionada, iniciar en ese mes; sino, usar hoy
    if (selectedDate) return new Date(selectedDate);
    // Si hay fechas disponibles, iniciar en el mes de la primera disponible
    if (availableDates.length > 0) return new Date(availableDates[0]);
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
  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={handlePrevMonth}>‹</button>
        <span className="cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={handleNextMonth}>›</button>
      </div>

      <div className="cal-week-header">
        {WEEKDAYS.map(d => (
          <div className="cal-week-day" key={d}>{d}</div>
        ))}
      </div>

      <div className="cal-days">
        {cells.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} className="cal-day-empty" />;

          // Formatear fecha de la celda en YYYY-MM-DD
          const monthStr = String(viewMonth + 1).padStart(2, "0");
          const dayStr = String(d).padStart(2, "0");
          const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

          const isAvailable = availableDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <div
              key={d}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              className={`cal-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${isAvailable ? "has-slots" : "disabled"}`}
            >
              <span className="day-number">{d}</span>
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span className="legend-item">
          <span className="legend-dot available" />
          Turnos disponibles
        </span>
        <span className="legend-item">
          <span className="legend-dot unavailable" />
          Sin disponibilidad
        </span>
      </div>
    </div>
  );
}
