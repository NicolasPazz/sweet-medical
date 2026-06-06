import { useNavigate } from 'react-router-dom';
import './GestionMedico.css';

const OPCIONES = [
    {
        path: 'servicio',
        icono: '🩺',
        titulo: 'Gestión de Servicios',
        descripcion: 'Alta, modificación y baja de especialidades y prácticas que ofrecés.',
    },
    {
        path: 'historial-paciente',
        icono: '📋',
        titulo: 'Historial de Paciente',
        descripcion: 'Consultá el historial completo de turnos de un paciente específico.',
    },
    {
        path: 'mis-turnos',
        icono: '📅',
        titulo: 'Mis Turnos',
        descripcion: 'Visualizá todos tus turnos.',
    },
    {
        path: 'disponibilidad',
        icono: '🕐',
        titulo: 'Mi Disponibilidad',
        descripcion: 'Consultá y administrá tu disponibilidad horaria por especialidad o práctica.',
    },
];

export function GestionMedico() {
    const navigate = useNavigate();

    return (
        <div className="gm-page">
            <div className="gm-container">
                <div className="gm-header">
                    <h1 className="gm-title">Gestión Médica</h1>
                    <p className="gm-subtitle">Seleccioná una sección para administrar tu actividad.</p>
                </div>

                <div className="gm-grid">
                    {OPCIONES.map((op) => (
                        <button
                            key={op.path}
                            className="gm-card"
                            onClick={() => navigate(op.path)}
                        >
                            <div className="gm-card-icono">{op.icono}</div>
                            <div className="gm-card-titulo">{op.titulo}</div>
                            <div className="gm-card-descripcion">{op.descripcion}</div>
                            <div className="gm-card-arrow">→</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GestionMedico;
