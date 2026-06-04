import React from 'react';
import './DetalleTurno.css';

export default function DetalleTurno({ turno, cfgEstado, formatFecha, onVolver, onIrAReprogramar }) {
    // Solo se permite cancelar o reprogramar si está confirmado, reservado o pendiente
    const esModificable = ['RESERVADO', 'CONFIRMADO', 'PENDIENTE'].includes(turno.estado);

    return (
        <div className="historial-container">
            <div className="historial-header">
                <button className="filtro-btn" onClick={onVolver}>← Volver a Mis Turnos</button>
                <h1 className="historial-title" style={{ marginTop: '15px' }}>Detalle del Turno</h1>
                <p className="historial-subtitle">Comprobante e información de tu cita médica</p>
            </div>

            {/* CAMBIADO: Usamos 'detalle-card' en vez de 'turno-card' */}
            <div className="detalle-card">

                {/* CAMBIADO: Estructura interna adaptada al CSS */}
                <div className="detalle-header-block">
                    <span className="detalle-id">ID de Turno: #{turno._id}</span>
                    <span className={`turno-estado ${cfgEstado?.color}`}>{cfgEstado?.label}</span>
                </div>

                <div className="detalle-info-row">
                    <span className="detalle-label">Especialidad / Servicio:</span>
                    <span className="detalle-value">{turno.servicio?.nombre || 'General'}</span>
                </div>

                <div className="detalle-info-row">
                    <span className="detalle-label">Profesional Médico:</span>
                    <span className="detalle-value">{turno.medico?.nombre}</span>
                </div>

                <div className="detalle-info-row">
                    <span className="detalle-label">Fecha asignada:</span>
                    <span className="detalle-value">{formatFecha(turno.fechaHora)}</span>
                </div>

                <div className="detalle-info-row">
                    <span className="detalle-label">Horario:</span>
                    <span className="detalle-value">{turno.hora} hs</span>
                </div>

                <div className="detalle-info-row">
                    <span className="detalle-label">Sede de atención:</span>
                    <span className="detalle-value">{turno.sede?.nombre || 'No asignada'}</span>
                </div>

                <div className="detalle-info-row">
                    <span className="detalle-label">Costo del servicio:</span>
                    <span className="detalle-value detalle-value-costo">
                        ${turno.costo?.toLocaleString('es-AR')}
                    </span>
                </div>

                {esModificable && (
                    /* CAMBIADO: Usamos 'detalle-acciones-group' */
                    <div className="detalle-acciones-group">
                        <button
                            className="btn-cancelar-accion" /* CAMBIADO: Tu clase de cancelar */
                            onClick={() => {
                                if (window.confirm("¿Estás seguro de que deseas cancelar este turno?")) {
                                    turno.estado = 'CANCELADO';
                                    alert("Turno cancelado con éxito.");
                                    onVolver();
                                }
                            }}
                        >
                            ❌ Cancelar Cita
                        </button>

                        <button
                            className="btn-nuevo-turno" /* Se mantiene el estilo global de la app */
                            style={{ position: 'static', margin: '0' }}
                            onClick={onIrAReprogramar}
                        >
                            🔄 Reprogramar Fecha
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}