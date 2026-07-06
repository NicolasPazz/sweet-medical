import { useNavigate } from 'react-router-dom';
import './GestionMedico.css';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage';
import { useState, useEffect } from 'react';
import { getMe, getRolUsuario } from '../../services/userService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useModoVista } from '../../components/ModoVistaContext.jsx';

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
  {
    path: 'sedes',
    icono: '📍',
    titulo: 'Mis Sedes',
    descripcion: 'Agregá las sedes donde atendés a tus pacientes.',
  },
];

export function GestionMedico() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);
  const { modo } = useModoVista();

  useEffect(() => {
    const fetchUser = async () => {
      if (email && password) {
        try {
          const data = await getMe({ email, password });
          const roles = data.usuario?.roles ?? [];
          const esMultiRol = roles.includes('PACIENTE') && roles.includes('MEDICO');

          setMultiplesFiltros(esMultiRol);

          if (esMultiRol) {
            // Con múltiples roles no colapsamos a un único "rol": el nav se
            // filtra más abajo según el switch (modo), no según el rol.
            setUser({ roles, nombre: data.perfil?.nombre });
          } else {
            setUser({ rol: getRolUsuario(roles), nombre: data.perfil?.nombre });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setMultiplesFiltros(false);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setMultiplesFiltros(false);
        setLoading(false);
      }
    };
    fetchUser();
  }, [email, password]);

  const rolVisible = multiplesFiltros
    ? modo === 'modo-medico'
      ? 'Médico'
      : 'Paciente'
    : user?.rol;

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
        <span
          className="text-ellipsis"
          style={{ color: '#94a3b8', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}
        >
          Cargando...
        </span>
      </div>
    );
  }

  if (rolVisible !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  return (
    <div className="gm-page">
      <div className="gm-container">
        <div className="gm-header">
          <h1 className="gm-title text-ellipsis">Gestión Médica</h1>
          <p className="gm-subtitle text-ellipsis">
            Seleccioná una sección para administrar tu actividad.
          </p>
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
