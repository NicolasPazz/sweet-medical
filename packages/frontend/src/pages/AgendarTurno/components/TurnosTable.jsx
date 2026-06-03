import CoverageBadge from './CoverageBadge';
import './TurnosTable.css';

export default function TurnosTable({ turnos }) {
  return (
    <div className="tabla-responsiva">
      <table className="tabla-resultados">
        <thead>
          <tr>
            <th>Profesional</th>
            <th>Especialidad / Práctica</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Sede</th>
            <th>Estado</th>
            <th>Cobertura</th>
            <th>Costo Estimado</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t, idx) => {
            const displayDate = t.fecha ? t.fecha.split('-').reverse().join('/') : '';
            return (
              <tr key={t.id || idx}>
                <td>
                  <span className="nombre-profesional">{t.medico?.nombre || 'No asignado'}</span>
                </td>
                <td>
                  <span className="nombre-servicio">{t.especialidad || t.practica || 'N/A'}</span>
                </td>
                <td>{displayDate}</td>
                <td className="celda-hora">{t.hora}</td>
                <td>{t.sede?.nombre || 'Sede Central'}</td>
                <td>
                  <span className="badge etiqueta-estado">{t.estado || 'Disponible'}</span>
                </td>
                <td>
                  <CoverageBadge cobertura={t.cobertura} />
                </td>
                <td className="celda-costo">
                  {t.costoEstimado === 0 ? 'Sin cargo ($0)' : `$${t.costoEstimado}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
