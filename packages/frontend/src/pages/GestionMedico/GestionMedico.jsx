import { useNavigate } from 'react-router-dom';
import './GestionMedico.css';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage';
import { useState, useEffect } from 'react';
import { getUserByToken } from '../../services/userService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 32, color: '#271f92' }} spin />;

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
  const { isAuthenticated, token } = useAuth();
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

  if (user?.rol !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  return (
    <div className="gm-page">
      <div className="gm-container">
        <div className="gm-header">
          <h1 className="gm-title text-ellipsis">Gestión Médica</h1>
          <p className="gm-subtitle text-ellipsis">Seleccioná una sección para administrar tu actividad.</p>
        </div>

        <div className="gm-grid">
          {OPCIONES.map((op) => (
            <button key={op.path} className="gm-card" onClick={() => navigate(op.path)}>
              <div className="gm-card-icono">{op.icono}</div>
              <div className="gm-card-titulo text-ellipsis">{op.titulo}</div>
              <div className="gm-card-descripcion text-ellipsis-multiline">{op.descripcion}</div>
              <div className="gm-card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GestionMedico;
