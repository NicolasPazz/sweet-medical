import { useState } from 'react';
import './CancelarTurnoModal.css';

/**
 * Modal reutilizable para cancelar un turno.
 *
 * Props:
 *   turno             — objeto turno con fechaHora y hora
 *   onClose()         — cerrar sin cancelar
 *   onConfirm(motivo) — confirmar cancelación con el motivo ingresado
 */
export default function CancelarTurnoModal({ turno, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  // Validar anticipación mínima de 1 hora
  const fechaTurno = new Date(turno.fechaHora);
  const diffMs = fechaTurno - Date.now();
  const puedeCancel = diffMs >= 60 * 60 * 1000;

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError('Debés ingresar un motivo para cancelar el turno.');
      return;
    }
    onConfirm(motivo.trim());
  };

  const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="ctm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ctm-modal">
        <div className="ctm-title">❌ Cancelar turno</div>

        {!puedeCancel ? (
          <>
            <p className="ctm-warning">
              No podés cancelar este turno. La cancelación requiere al menos{' '}
              <strong>1 hora de anticipación</strong> y el turno está programado
              para dentro de menos de eso.
            </p>
            <div className="ctm-footer">
              <button className="ctm-btn-secondary" onClick={onClose}>Entendido</button>
            </div>
          </>
        ) : (
          <>
            <p className="ctm-body">
              Estás por cancelar el turno del{' '}
              <strong>{fechaFormateada}</strong> a las{' '}
              <strong>{turno.hora} hs</strong>. Esta acción no se puede deshacer.
            </p>

            <label className="ctm-label">
              Motivo de cancelación <span className="ctm-required">*</span>
            </label>
            <textarea
              className="ctm-textarea"
              rows={3}
              placeholder="Ej: No puedo asistir por compromisos laborales..."
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); setError(''); }}
              maxLength={300}
            />
            <span className="ctm-char-count">{motivo.length}/300</span>

            {error && <p className="ctm-error">{error}</p>}

            <div className="ctm-footer">
              <button className="ctm-btn-secondary" onClick={onClose}>Volver</button>
              <button className="ctm-btn-danger" onClick={handleConfirm}>
                Confirmar cancelación
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
