import { useNavigate } from 'react-router-dom';
import './GestionAdmin.css';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage';
import { useState, useEffect } from 'react';
import { getMe, getRolUsuario } from '../../services/userService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 32, color: '#271f92' }} spin />;

const OPCIONES = [
  {
    path: 'usuarios',
    icono: '🧑‍⚕️',
    titulo: 'Generación de Usuarios',
    descripcion: 'Dá de alta nuevos usuarios Paciente o Médico (quedan inactivos hasta asignarles credenciales).',
  },
  {
    path: 'servicio',
    icono: '🩺',
    titulo: 'ABM de Servicios',
    descripcion: 'Alta, modificación y baja de especialidades y prácticas del sistema.',
  },
];

export function GestionAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const data = await getMe({ email, password });
          setUser({
            rol: getRolUsuario(data.usuario?.roles),
            id: data.usuario?.id,
          });
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
  }, [email, password]);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
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
        <span className="text-ellipsis" style={{ color: '#94a3b8', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>
          Cargando...
        </span>
      </div>
    );
  }

  if (user?.rol !== 'Admin') {
    return <ErrorPage type="403" />;
  }

  return (
    <div className="ga-page">
      <div className="ga-container">
        <div className="ga-header">
          <h1 className="ga-title text-ellipsis">Panel de Administración</h1>
          <p className="ga-subtitle text-ellipsis">Seleccioná una sección para administrar el sistema.</p>
        </div>

        <div className="ga-grid">
          {OPCIONES.map((op) => (
            <button key={op.path} className="ga-card" onClick={() => navigate(op.path)}>
              <div className="ga-card-icono">{op.icono}</div>
              <div className="ga-card-titulo text-ellipsis">{op.titulo}</div>
              <div className="ga-card-descripcion text-ellipsis-multiline">{op.descripcion}</div>
              <div className="ga-card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GestionAdmin;
