import './Perfil.css';

export default function Perfil() {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // Genera las columnas de horas (0 a 23)
  const horas = Array.from({ length: 24 }, (_, i) => i);

  const checkDisponibilidadSimulada = (dia, hora) => {
    if (['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(dia)) {
      return hora >= 8 && hora <= 16;
    }
    return false;
  };

  

  return (
    <div className="perfil-page">
        {/* --- HEADER --- */}
        <div className="header-container">
            <h1 className="header-title">Mi Perfil</h1>
            <h2 className="user-name">Lucca Bertani</h2>
            <img className="user-avatar" src="/avatar.png" alt="Avatar de usuario" />
        </div>

        {/* --- CONTENEDOR DE INFORMACIÓN (DOS COLUMNAS) --- */}
        <div className="profile-container">
            <div className="left-section">
                <table className="medical-table">
                    <thead>
                        <tr>
                            <th>Datos Profesionales</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Rol:</strong> Médico</td></tr>
                        <tr><td><strong>Años de antigüedad:</strong> 5</td></tr>
                        <tr>
                            <td>
                                <strong>Especialidades:</strong>
                                <ul>
                                    <li>Cardiología</li>
                                    <li>Cirugía General</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Prácticas:</strong>
                                <ul>
                                    <li>Electrocardiograma</li>
                                    <li>Ecografía Abdominal</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="right-section">
                <h2 className="section-title">Información Personal</h2>
                <table className="personal-table">
                    <tbody>
                        <tr>
                            <td className="label"><strong>Nombre:</strong></td>
                            <td>Lucca Bertani</td>
                        </tr>
                        <tr>
                            <td className="label"><strong>Email:</strong></td>
                            <td>usuario@sweetmedical.com</td>
                        </tr>
                        <tr>
                            <td className="label"><strong>Teléfono:</strong></td>
                            <td>+54 9 11 1234-5678</td>
                        </tr>
                        <tr>
                            <td className="label"><strong>Dirección:</strong></td>
                            <td>Av. Siempre Viva 123, Ciudad</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- NUEVO CONTENEDOR APARTE (ABAJO) --- */}
        <div className="availability-section">
            <div className="availability-header">
                <h2 className="section-title">Disponibilidad Horaria</h2>
                <button className="btn-disponibilidad" onClick={() => console.log('Cambiar disponibilidad')}>
                    Modificar Disponibilidad
                </button>
            </div>
            
            <p className="availability-help">Visualizá tus horarios de atención. Las celdas en verde indican tus horas activas.</p>
            
            <div className="calendar-grid-container">
                <table className="calendar-table">
                    <thead>
                        <tr>
                            <th className="day-header-cell">Día</th>
                            {horas.map(hora => (
                                <th key={hora}>{`${hora}:00`}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {diasSemana.map(dia => (
                            <tr key={dia}>
                                <td className="day-cell"><strong>{dia}</strong></td>
                                {horas.map(hora => {
                                    const disponible = checkDisponibilidadSimulada(dia, hora);
                                    return (
                                        <td 
                                            key={`${dia}-${hora}`} 
                                            className={`slot-cell ${disponible ? 'slot-available' : 'slot-unavailable'}`}
                                            title={`${dia} a las ${hora}:00 - ${disponible ? 'Disponible' : 'No disponible'}`}
                                        >
                                            {/* Espacio para clickear a futuro */}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}