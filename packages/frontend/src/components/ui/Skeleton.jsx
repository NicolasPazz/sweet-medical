import { Skeleton } from 'antd';
import './Skeleton.css';

/**
 * SkeletonTurnoCard — imita una turno-card del historial.
 */
export function SkeletonTurnoCard() {
  return (
    <div className="sm-skeleton-card">
      {/* Columna izquierda: fecha + hora */}
      <div className="sm-skeleton-card__left">
        <Skeleton.Input active size="small" style={{ width: 60, height: 12 }} />
        <Skeleton.Input active size="small" style={{ width: 40, height: 10, marginTop: 4 }} />
      </div>

      {/* Columna central: servicio + médico + sede */}
      <div className="sm-skeleton-card__center">
        <Skeleton.Input active size="small" style={{ width: '55%', height: 14 }} />
        <Skeleton.Input active size="small" style={{ width: '40%', height: 11, marginTop: 5 }} />
        <Skeleton.Input active size="small" style={{ width: '30%', height: 10, marginTop: 4 }} />
      </div>

      {/* Columna derecha: estado pill + costo */}
      <div className="sm-skeleton-card__right">
        <Skeleton.Button active size="small" style={{ width: 72, height: 22, borderRadius: 20 }} />
        <Skeleton.Input active size="small" style={{ width: 56, height: 11, marginTop: 6 }} />
      </div>
    </div>
  );
}

/**
 * SkeletonTurnoList — apila N SkeletonTurnoCards.
 * Props:
 *   count — cuántas cards mostrar (default 5)
 */
export function SkeletonTurnoList({ count = 5 }) {
  return (
    <div className="sm-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTurnoCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonDetalleTurno — para pantallas de detalle de turno.
 */
export function SkeletonDetalleTurno() {
  return (
    <div className="sm-skeleton-detail">
      {/* Header: id + badge */}
      <div className="sm-skeleton-detail__header">
        <Skeleton.Input active size="small" style={{ width: 160, height: 13 }} />
        <Skeleton.Button active size="small" style={{ width: 80, height: 22, borderRadius: 20 }} />
      </div>

      {/* Filas de info */}
      {[180, 140, 120, 130, 110, 90].map((w, i) => (
        <div key={i} className="sm-skeleton-detail__row">
          <Skeleton.Input active size="small" style={{ width: 130, height: 11 }} />
          <Skeleton.Input active size="small" style={{ width: w, height: 14 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonServicioCard — imita las cards de GestionServicio.
 */
export function SkeletonServicioCard() {
  return (
    <div className="sm-skeleton-servicio">
      <div className="sm-skeleton-servicio__left">
        <Skeleton.Input active size="small" style={{ width: '45%', height: 15 }} />
        <Skeleton.Input active size="small" style={{ width: '65%', height: 11, marginTop: 8 }} />
      </div>
      <div className="sm-skeleton-servicio__right">
        <Skeleton.Button active size="default" style={{ width: 64, borderRadius: 8 }} />
        <Skeleton.Button active size="default" style={{ width: 72, borderRadius: 8 }} />
      </div>
    </div>
  );
}

/**
 * SkeletonServicioList — apila N SkeletonServicioCards.
 */
export function SkeletonServicioList({ count = 4 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonServicioCard key={i} />
      ))}
    </div>
  );
}
