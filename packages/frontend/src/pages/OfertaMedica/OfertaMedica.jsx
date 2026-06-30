import React, { useState } from 'react';
import './OfertaMedica.css';
// Podés reutilizar mocks existentes o crear uno nuevo para médicos y especialidades
//import { MOCK_MEDICOS, MOCK_ESPECIALIDADES } from '../../mockdata/oferta.js';

export default function OfertaMedica() {
    const [tab, setTab] = useState('ESPECIALIDADES'); // Controla qué ver: Especialidades, Prácticas o Médicos

    return (
        <div className="oferta-container">
            <div className="oferta-header">
                <h1>Nuestra Oferta Médica</h1>
                <p>Conocé nuestras especialidades, prácticas profesionales y al equipo de especialistas.</p>
            </div>

            {/* Selector de categorías */}
            <div className="oferta-tabs">
                <button className={tab === 'ESPECIALIDADES' ? 'active' : ''} onClick={() => setTab('ESPECIALIDADES')}>
                    Especialidades
                </button>
                <button className={tab === 'PRACTICAS' ? 'active' : ''} onClick={() => setTab('PRACTICAS')}>
                    Prácticas
                </button>
                <button className={tab === 'MEDICOS' ? 'active' : ''} onClick={() => setTab('MEDICOS')}>
                    Nuestro Equipo
                </button>
            </div>

            {/* Listados condicionales */}
            <div className="oferta-contenido">
                {tab === 'ESPECIALIDADES' && (
                    <div className="grid-oferta">
                        {/* Mapeo de especialidades */}
                    </div>
                )}
                {/* ... lo mismo para Prácticas y Médicos */}
            </div>
        </div>
    );
}