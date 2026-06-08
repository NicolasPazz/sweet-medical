import './Perfil.css';
import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage.jsx';
import { getUserByToken } from '../../services/userService.js';

const spinIcon = <LoadingOutlined style={{ fontSize: 32, color: '#271f92' }} spin />;

export default function Perfil() {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const horas = Array.from({ length: 24 }, (_, i) => i);

  const checkDisponibilidadSimulada = (dia, hora) => {
    if (['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(dia)) {
      return hora >= 8 && hora <= 16;
    }
    return false;
  };

  const { isAuthenticated, token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await getUserByToken(token);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  if (!isAuthenticated) {
    return <ErrorPage type="403" />;
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Spin indicator={spinIcon} />
        <span style={{ color: '#94a3b8', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>
          Cargando perfil...
        </span>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      {/* --- HEADER --- */}
      <div className="header-container">
        <h1 className="header-title">Mi Perfil</h1>
        <div className="header-right">
          <h2 className="user-name">{user?.username || 'N/A'}</h2>
          <img
            className="user-avatar"
            src={user?.avatar || '/avatar.png'}
            alt="Avatar de usuario"
          />
          <button
            className="btn-logout"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
          >
            Cerrar sesión
          </button>
        </div>
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
              <tr>
                <td>
                  <strong>Rol:</strong> {user?.rol || 'N/A'}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Años de antigüedad:</strong> {user?.antiguedad || 'N/A'}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Especialidades:</strong>
                  <ul>
                    {user?.especialidades ? (
                      user.especialidades.map((esp, index) => <li key={index}>{esp}</li>)
                    ) : (
                      <li>N/A</li>
                    )}
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Prácticas:</strong>
                  <ul>
                    {user?.practicas ? (
                      user.practicas.map((practica, index) => <li key={index}>{practica}</li>)
                    ) : (
                      <li>N/A</li>
                    )}
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
                <td className="label">
                  <strong>Nombre:</strong>
                </td>
                <td>{user?.nombre || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label">
                  <strong>Email:</strong>
                </td>
                <td>{user?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label">
                  <strong>Teléfono:</strong>
                </td>
                <td>{user?.telefono || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label">
                  <strong>Dirección:</strong>
                </td>
                <td>{user?.direccion || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
