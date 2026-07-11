import { useNavigate } from 'react-router-dom';
import './GestionAdmin.css';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage';
import { useState, useEffect } from 'react';
import { getMe, getRolUsuario } from '../../services/userService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { correrProcesoBatch } from '@/services/adminService';

const spinIcon = <LoadingOutlined style={{ fontSize: 32, color: '#271f92' }} spin />;

const OPCIONES = [
  {
    path: 'usuarios',
    icono: '🧑‍⚕️',
    titulo: 'Generación de Usuarios',
    descripcion:
      'Dá de alta nuevos usuarios con uno o más roles (Paciente y/o Médico). Quedan inactivos hasta asignarles credenciales.',
  },
  {
    path: 'servicio',
    icono: '🩺',
    titulo: 'ABM de Servicios',
    descripcion: 'Alta, modificación y baja de especialidades y prácticas del sistema.',
  },
  {
    path: 'sedes',
    icono: '🏥',
    titulo: 'ABM de Sedes',
    descripcion: 'Alta, modificación y baja de las sedes de atención del sistema.',
  },
  {
    path: null,
    icono: '🗓️',
    titulo: 'Actualizar disponibilidades',
    descripcion: 'Actualización de horarios de disponibilidad de todos los médicos',
  },
];

export function GestionAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingBatch, setUpdatingBatch] = useState(false);

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

  const handleActualizarDisponibilidades = async () => {
    try {
      setUpdatingBatch(true);
      await correrProcesoBatch({ email, password });
      alert('¡Disponibilidades actualizadas con éxito!'); // O usar una notificación de Antd
    } catch (error) {
      console.error('Error al correr el proceso batch:', error);
      alert('Hubo un error al actualizar las disponibilidades.');
    } finally {
      setUpdatingBatch(false);
    }
  };

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

  if (user?.rol !== 'Admin') {
    return <ErrorPage type="403" />;
  }

  return (
    <div className="ga-page">
      <div className="ga-container">
        <div className="ga-header">
          <h1 className="ga-title text-ellipsis">Panel de Administración</h1>
          <p className="ga-subtitle text-ellipsis">
            Seleccioná una sección para administrar el sistema.
          </p>

        </div>


        <div className="ga-grid">
          {OPCIONES.map((op, index) => {
            // Verificamos si es la tarjeta del proceso batch para saber si aplicar estados de carga
            const isBatchCard = !op.path;

            return (
              <button
                key={op.path || `batch-${index}`}
                className="ga-card"
                disabled={isBatchCard && updatingBatch}
                style={isBatchCard && updatingBatch ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                onClick={() => {
                  if (op.path) {
                    navigate(op.path);
                  } else {
                    handleActualizarDisponibilidades();
                  }
                }}
              >
                <div className="ga-card-icono">
                  {isBatchCard && updatingBatch ? <LoadingOutlined spin style={{ color: '#271f92' }} /> : op.icono}
                </div>
                <div className="ga-card-titulo text-ellipsis">
                  {isBatchCard && updatingBatch ? 'Actualizando...' : op.titulo}
                </div>
                <div className="ga-card-descripcion text-ellipsis-multiline">{op.descripcion}</div>
                <div className="ga-card-arrow">→</div>
              </button>
            );
          })}
        </div>
      </div>
    </div >
  );
}

export default GestionAdmin;
