import React, { useState, useEffect } from 'react';
import './OfertaMedica.css';
import { getEspecialidades, getPracticas, getMedicos } from '../../services/turnoService.js';

// 1. Traemos la metadata de estilos que tenés en agendar turno
const SERVICE_META = {
    Cardiología: { icon: '🫀', color: '#FEE2E2' },
    Pediatría: { icon: '🧒', color: '#FEF9C3' },
    Dermatología: { icon: '🩺', color: '#F0FDF4' },
    Kinesiología: { icon: '💪', color: '#EFF6FF' },
    Oftalmología: { icon: '👁️', color: '#FAF5FF' },
    Traumatología: { icon: '🦴', color: '#FFF7ED' },
    Gastroenterología: { icon: '🔬', color: '#F0FDF4' },
    Neurología: { icon: '🧠', color: '#FDF4FF' },
    Odontología: { icon: '🦷', color: '#F0F9FF' },
    Psiquiatría: { icon: '🧘', color: '#FDF2F8' },
    'Clínica General': { icon: '🏥', color: '#ECFDF5' },
    Ginecología: { icon: '💜', color: '#FAF5FF' },
};

const getServiceMeta = (name) => {
    return SERVICE_META[name] || { icon: '🩺', color: '#E6F4F5' };
};

export default function OfertaMedica() {
    const [tab, setTab] = useState('ESPECIALIDADES');
    const [especialidades, setEspecialidades] = useState([]);
    const [practicas, setPracticas] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function cargarOferta() {
            try {
                setLoading(true);
                const [resEsp, resPrac, resMed] = await Promise.all([
                    getEspecialidades(),
                    getPracticas(),
                    getMedicos()
                ]);

                setEspecialidades(resEsp?.data ?? resEsp ?? []);
                setPracticas(resPrac?.data ?? resPrac ?? []);
                setMedicos(resMed?.data ?? resMed ?? []);
            } catch (err) {
                console.error("Error cargando el catálogo público:", err);
                setError("Ocurrió un error al sincronizar con el servidor.");
            } finally {
                setLoading(false);
            }
        }
        cargarOferta();
    }, []);

    if (loading) return <div className="oferta-container"><p>Cargando oferta médica...</p></div>;
    if (error) return <div className="oferta-container"><p className="error-msg">{error}</p></div>;

    return (
        <div className="oferta-container">
            <div className="oferta-header">
                <h1>Nuestra Oferta Médica</h1>
                <p>Explorá los servicios, coberturas y el staff de profesionales disponibles en Sweet Medical.</p>
            </div>

            <div className="oferta-tabs">
                <button className={tab === 'ESPECIALIDADES' ? 'active' : ''} onClick={() => setTab('ESPECIALIDADES')}>
                    Especialidades
                </button>
                <button className={tab === 'PRACTICAS' ? 'active' : ''} onClick={() => setTab('PRACTICAS')}>
                    Prácticas Médicas
                </button>
                <button className={tab === 'MEDICOS' ? 'active' : ''} onClick={() => setTab('MEDICOS')}>
                    Nuestro Equipo
                </button>
            </div>

            <div className="oferta-contenido">

                {/* Especialidades con íconos dinámicos */}
                {tab === 'ESPECIALIDADES' && (
                    <div className="grid-oferta">
                        {especialidades.length > 0 ? (
                            especialidades.map((esp) => {
                                const meta = getServiceMeta(esp.nombre);
                                return (
                                    <div key={esp.id ?? esp._id} className="oferta-card">
                                        <div>
                                            {/* Aplicamos el color de fondo y el ícono correspondiente */}
                                            <span className="oferta-card__icon" style={{ backgroundColor: meta.color }}>
                                                {meta.icon}
                                            </span>
                                            <h3 className="oferta-card__title">{esp.nombre}</h3>
                                            <p className="oferta-card__description">
                                                Atención personalizada. Duración: {esp.duracionTurnoEnMins} minutos.
                                            </p>
                                        </div>
                                        <div className="oferta-card__meta">Costo Base: ${esp.costo}</div>
                                    </div>
                                );
                            })
                        ) : <p>No hay especialidades dadas de alta.</p>}
                    </div>
                )}

                {/* Prácticas con íconos dinámicos */}
                {tab === 'PRACTICAS' && (
                    <div className="grid-oferta">
                        {practicas.length > 0 ? (
                            practicas.map((prac) => {
                                // Buscamos si coincide con algún nombre de especialidad o usa el default
                                const meta = getServiceMeta(prac.nombre);
                                return (
                                    <div key={prac.id ?? prac._id} className="oferta-card">
                                        <div>
                                            <span className="oferta-card__icon" style={{ backgroundColor: meta.color }}>
                                                {meta.icon}
                                            </span>
                                            <h3 className="oferta-card__title">{prac.nombre}</h3>
                                            <p className="oferta-card__subtitle">Código: {prac.codigo}</p>
                                            <p className="oferta-card__description">
                                                Estudio programado. Duración estimada: {prac.duracionTurnoEnMins} mins.
                                            </p>
                                        </div>
                                        <div className="oferta-card__meta">Arancel: ${prac.costo}</div>
                                    </div>
                                );
                            })
                        ) : <p>No hay prácticas médicas registradas.</p>}
                    </div>
                )}

                {/* Nuestro Equipo */}
                {tab === 'MEDICOS' && (
                    <div className="grid-oferta">
                        {medicos.length > 0 ? (
                            medicos.map((med) => {
                                // Mapeamos las especialidades y filtramos nulos
                                const especialidadesDelMedico = (med.especialidades ?? [])
                                    .map(idObj => {
                                        const idString = idObj.id ?? idObj._id ?? idObj.toString();
                                        const encontrada = especialidades.find(e => (e.id ?? e._id) === idString);
                                        return encontrada ? encontrada.nombre : null;
                                    })
                                    .filter(Boolean);

                                // Mapeamos las prácticas y filtramos nulos
                                const practicasDelMedico = (med.practicas ?? [])
                                    .map(idObj => {
                                        const idString = idObj.id ?? idObj._id ?? idObj.toString();
                                        const encontrada = practicas.find(p => (p.id ?? p._id) === idString);
                                        return encontrada ? encontrada.nombre : null;
                                    })
                                    .filter(Boolean);

                                return (
                                    <div key={med.id ?? med._id} className="oferta-card">
                                        <div>
                                            <div className="medico-card-top">
                                                <span className="oferta-card__icon" style={{ backgroundColor: '#E0F2FE' }}>👨‍⚕️</span>
                                                <div>
                                                    <h3 className="oferta-card__title">
                                                        {med.nombre ?? `Profesional (${med.matricula})`}
                                                    </h3>
                                                    <p className="oferta-card__subtitle">Matrícula: {med.matricula ?? 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* --- Sección de Servicios Ofrecidos --- */}
                                            <div className="medico-servicios-seccion">
                                                {especialidadesDelMedico.length > 0 && (
                                                    <div className="medico-tags-container">
                                                        <span className="medico-label">Especialidades</span>
                                                        <div className="medico-tags">
                                                            {especialidadesDelMedico.map((espName, idx) => (
                                                                <span key={idx} className="tag-servicio esp">{espName}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {practicasDelMedico.length > 0 && (
                                                    <div className="medico-tags-container">
                                                        <span className="medico-label">Prácticas</span>
                                                        <div className="medico-tags">
                                                            {practicasDelMedico.map((pracName, idx) => (
                                                                <span key={idx} className="tag-servicio prac">{pracName}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* --- Sección de Horarios/Disponibilidad Detallada --- */}
                                            <div className="medico-horarios-seccion">
                                                <span className="medico-label">Horarios de Atención</span>
                                                {med.disponibilidades && med.disponibilidades.length > 0 ? (
                                                    <ul className="lista-disponibilidad">
                                                        {med.disponibilidades.map((disp, idx) => (
                                                            <li key={idx} className="item-disponibilidad">
                                                                <span className="dia-texto">
                                                                    {disp.diaSemana.charAt(0) + disp.diaSemana.slice(1).toLowerCase()}
                                                                </span>
                                                                <span className="horas-texto">
                                                                    {disp.horaDesde} a {disp.horaHasta} hs
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="sin-datos">Sin horarios asignados.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="oferta-card__meta">
                                            📅 {med.disponibilidades?.length ?? 0} días de atención semanal
                                        </div>
                                    </div>
                                );
                            })
                        ) : <p>No hay profesionales disponibles en el sistema.</p>}
                    </div>
                )}

            </div>
        </div>
    );
}