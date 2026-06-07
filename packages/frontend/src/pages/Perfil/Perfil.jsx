import './Perfil.css';
import { useState, useEffect } from 'react';
import { useAuth } from "../../components/AuthProvider.jsx";
import ErrorPage from "../ErrorPage/ErrorPage.jsx";
import { getUserByToken } from '../../services/userService.js';

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

    const { isAuthenticated, token, logout } = useAuth();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await getUserByToken(token);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUser();
    }, [token]);

    if (!isAuthenticated) {
        return (
            <ErrorPage type = "403"/>
        )
    }

    return (
        <div className="perfil-page">
            {/* --- HEADER --- */}
            <div className="header-container">
                <h1 className="header-title">Mi Perfil</h1>
                <h2 className="user-name">{user?.username || "N/A"}</h2>
                <img className="user-avatar" src={user?.avatar || "/avatar.png"} alt="Avatar de usuario" />
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
                            <tr><td><strong>Rol:</strong> {user?.rol || "N/A"}</td></tr>
                            <tr><td><strong>Años de antigüedad:</strong> {user?.antiguedad || "N/A"}</td></tr>
                            <tr>
                                <td>
                                    <strong>Especialidades:</strong>
                                    <ul>
                                        {user?.especialidades ? user.especialidades.map((esp, index) => <li key={index}>{esp}</li>) : <li>N/A</li>}
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Prácticas:</strong>
                                    <ul>
                                        {user?.practicas ? user.practicas.map((practica, index) => <li key={index}>{practica}</li>) : <li>N/A</li>}
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
                                <td>{user?.nombre || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="label"><strong>Email:</strong></td>
                                <td>{user?.email || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="label"><strong>Teléfono:</strong></td>
                                <td>{user?.telefono || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="label"><strong>Dirección:</strong></td>
                                <td>{user?.direccion || "N/A"}</td>
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

            <div className="logout-container">
                <button className="btn-logout" onClick={() => { logout(); window.location.href = '/login'; }}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}