import { useCart } from '../../../context/CartContext.jsx';
import './PreselSidebar.css';

export default function PreselSidebar({ onConfirm }) {
  const { items, removeTurn, summary } = useCart();

  return (
    <div className="presel-sidebar">
      <div className="presel-title">
        <span className="title-icon">📋</span>
        <span className="title-text text-ellipsis">Preseleccionados</span>
        {items.length > 0 && <span className="presel-badge text-ellipsis">{items.length}</span>}
      </div>

      {items.length === 0 ? (
        <p className="presel-empty text-ellipsis-multiline">
          Aún no hay turnos preseleccionados. Seleccioná un horario para agregarlo aquí.
        </p>
      ) : (
        <div className="presel-list">
          {items.map((item, idx) => (
            <div className="presel-item" key={item.id || idx}>
              <span className="presel-num text-ellipsis">{idx + 1}</span>
              <div className="presel-info">
                <div className="presel-spec-doc text-ellipsis">
                  <strong>
                    {item.especialidad || item.practica || item.servicio || 'Consulta Médica'}
                  </strong>
                </div>
                <div className="presel-doc-name text-ellipsis">
                  {item.medico?.nombre || item.medico || 'Profesional asignado'}
                </div>
                <div className="presel-datetime text-ellipsis">
                  {item.fecha || 'Hoy'} a las {item.hora} hs
                </div>
                <div className="presel-meta text-ellipsis">
                  Sede: {item.sede?.nombre || item.sede || 'No especificada'}
                </div>
                {item.costoEstimado !== undefined && (
                  <div className="presel-cost text-ellipsis">
                    Costo:{' '}
                    {item.costoEstimado === 0 ? 'Sin costo (Cubierto)' : `$${item.costoEstimado}`}
                  </div>
                )}
              </div>
              <button
                className="presel-del"
                onClick={() => removeTurn(item.id)}
                aria-label="Quitar preselección"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="presel-divider" />

          <div className="presel-summary">
            <div className="summary-row">
              <span className="text-ellipsis">Total Estimado:</span>
              <strong className="summary-total text-ellipsis">
                {summary.hasPendingCost ? 'Pendiente' : `$${summary.totalCost}`}
              </strong>
            </div>
          </div>

          <button className="btn btn-primary btn-confirm-all text-ellipsis" onClick={onConfirm}>
            Confirmar Selección
          </button>
        </div>
      )}
    </div>
  );
}
