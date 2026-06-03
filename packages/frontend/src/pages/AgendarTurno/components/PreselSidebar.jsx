import { useCart } from "../../../context/CartContext.jsx";
import "./PreselSidebar.css";

export default function PreselSidebar({ onConfirm }) {
  const { items, removeTurn, summary } = useCart();

  return (
    <div className="presel-sidebar">
      <div className="presel-title">
        <span className="title-icon">📋</span>
        <span className="title-text">Preseleccionados</span>
        {items.length > 0 && (
          <span className="presel-badge">{items.length}</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="presel-empty">
          Aún no hay turnos preseleccionados. Seleccioná un horario para agregarlo aquí.
        </p>
      ) : (
        <div className="presel-list">
          {items.map((item, idx) => (
            <div className="presel-item" key={item.id || idx}>
              <span className="presel-num">{idx + 1}</span>
              <div className="presel-info">
                <div className="presel-spec-doc">
                  <strong>{item.especialidad || item.practica}</strong>
                </div>
                <div className="presel-doc-name">
                  {item.medico?.nombre}
                </div>
                <div className="presel-datetime">
                  {item.fecha} a las {item.hora}
                </div>
                <div className="presel-meta">
                  Sede: {item.sede?.nombre || "No especificada"}
                </div>
                {item.costoEstimado !== undefined && (
                  <div className="presel-cost">
                    Costo: {item.costoEstimado === 0 ? "Sin costo (Cubierto)" : `$${item.costoEstimado}`}
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
              <span>Total Estimado:</span>
              <strong className="summary-total">
                {summary.hasPendingCost ? "Pendiente" : `$${summary.totalCost}`}
              </strong>
            </div>
          </div>

          <button
            className="btn btn-primary btn-confirm-all"
            onClick={onConfirm}
          >
            Confirmar Selección
          </button>
        </div>
      )}
    </div>
  );
}
