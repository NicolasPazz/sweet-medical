import CoverageBadge from './CoverageBadge';
import './TurnosTable.css';

export default function TurnosTable({ turnos }) {
  return (
    <div className="tabla-responsiva">
      <table className="tabla-resultados">
        <thead>
          <tr>
            <th className="text-ellipsis">Profesional</th>
            <th className="text-ellipsis">Especialidad / Práctica</th>
            <th className="text-ellipsis">Fecha</th>
            <th className="text-ellipsis">Hora</th>
            <th className="text-ellipsis">Sede</th>
            <th className="text-ellipsis">Estado</th>
            <th className="text-ellipsis">Cobertura</th>
            <th className="text-ellipsis">Costo Estimado</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t, idx) => {
            const displayDate = t.fecha ? t.fecha.split('-').reverse().join('/') : '';
            return (
              <tr key={t.id || idx}>
                <td>
                  <span className="nombre-profesional text-ellipsis">{t.medico?.nombre || 'No asignado'}</span>
                </td>
                <td>
                  <span className="nombre-servicio text-ellipsis">{t.especialidad || t.practica || 'N/A'}</span>
                </td>
                <td className="text-ellipsis">{displayDate}</td>
                <td className="celda-hora text-ellipsis">{t.hora}</td>
                <td className="text-ellipsis">{t.sede?.nombre || 'Sede Central'}</td>
                <td>
                  <span className="badge etiqueta-estado text-ellipsis">{t.estado || 'Disponible'}</span>
                </td>
                <td>
                  <CoverageBadge cobertura={t.cobertura} />
                </td>
                <td className="celda-costo text-ellipsis">
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
