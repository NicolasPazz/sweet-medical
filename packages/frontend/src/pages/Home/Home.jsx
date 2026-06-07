import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaHistory, FaBriefcaseMedical, FaEnvelope, FaArrowRight, FaShieldAlt, FaClock, FaUserMd } from 'react-icons/fa';
import './Home.css';
import { useAuth } from "../../components/AuthProvider.jsx";
import { useState, useEffect } from 'react';
import { getUserByToken } from '../../services/userService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 28, color: '#271f92' }} spin />;

export default function Home() {
  const { token } = useAuth();
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <Spin indicator={spinIcon} />
        <span style={{ color: '#94a3b8', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>Cargando...</span>
      </div>
    );
  }

  return (
    <div className="home-container">

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-badge">Plataforma de salud digital</div>
        <h1 className="home-title">Bienvenido a <span>Sweet Medical</span></h1>
        <p className="home-subtitle">
          Gestioná tus turnos, revisá tu historial médico y accedé a todos los servicios de salud en un solo lugar.
        </p>
        <div className="home-hero-cta">
          <Link to="/solicitar-turno" className="cta-primary">
            <FaCalendarAlt /> Agendar turno
          </Link>
          {user?.rol === "Paciente" && (
            <Link to="/historial-medico" className="cta-secondary">
              Ver historial <FaArrowRight />
            </Link>
          )}
          {user?.rol === "Médico" && (
            <Link to="/gestion-medico" className="cta-secondary">
              Gestión médica <FaArrowRight />
            </Link>
          )}
        </div>
      </section>

      {/* Cards de acceso rápido */}
      <section className="home-cards">
        <Link to="/solicitar-turno" className="home-card home-card--accent">
          <div className="home-card-icon"><FaCalendarAlt /></div>
          <div className="home-card-body">
            <span className="home-card-title">Agendar Turno</span>
            <span className="home-card-desc">Elegí servicio, médico y horario disponible</span>
          </div>
          <FaArrowRight className="home-card-arrow" />
        </Link>

        {user?.rol === "Paciente" && (
          <Link to="/historial-medico" className="home-card">
            <div className="home-card-icon"><FaHistory /></div>
            <div className="home-card-body">
              <span className="home-card-title">Historial Médico</span>
              <span className="home-card-desc">Revisá tus turnos y consultas anteriores</span>
            </div>
            <FaArrowRight className="home-card-arrow" />
          </Link>
        )}
        {user?.rol === "Médico" && (
          <Link to="/gestion-medico" className="home-card">
            <div className="home-card-icon"><FaBriefcaseMedical /></div>
            <div className="home-card-body">
              <span className="home-card-title">Gestión médica</span>
              <span className="home-card-desc">Administrá tus actividades como médico</span>
            </div>
            <FaArrowRight className="home-card-arrow" />
          </Link>
        )}
        <Link to="/contact" className="home-card">
          <div className="home-card-icon"><FaEnvelope /></div>
          <div className="home-card-body">
            <span className="home-card-title">Contacto</span>
            <span className="home-card-desc">Comunicate con nuestro equipo</span>
          </div>
          <FaArrowRight className="home-card-arrow" />
        </Link>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="home-feature">
          <FaShieldAlt className="home-feature-icon" />
          <h3>Datos seguros</h3>
          <p>Tu información médica está protegida y solo accesible por vos.</p>
        </div>
        <div className="home-feature">
          <FaClock className="home-feature-icon" />
          <h3>Turnos 24/7</h3>
          <p>Agendá en cualquier momento sin necesidad de llamar.</p>
        </div>
        <div className="home-feature">
          <FaUserMd className="home-feature-icon" />
          <h3>Especialistas</h3>
          <p>Accedé a una red de profesionales de la salud certificados.</p>
        </div>
      </section>

    </div>
  );
}
