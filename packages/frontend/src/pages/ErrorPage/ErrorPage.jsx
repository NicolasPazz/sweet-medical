import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaShieldAlt, FaHome, FaArrowLeft, FaLock } from 'react-icons/fa';
import './errorPage.css';

const ErrorPage = ({ type = '404' }) => {
  const navigate = useNavigate();

  // Configuración dinámica según el tipo de error
  const errorConfigs = {
    404: {
      code: '404',
      title: 'Página no encontrada',
      message:
        'Lo sentimos, la sección o el turno médico que estás buscando no existe o ha sido movido.',
      icon: <FaExclamationTriangle className="error-view-icon triage-color" />,
    },
    403: {
      code: '403',
      title: 'Acceso Denegado',
      message:
        'No tenés los permisos necesarios para ver esta sección. Esta vista está restringida según tu rol en la plataforma.',
      icon: <FaShieldAlt className="error-view-icon shield-color" />,
    },
    401: {
      code: '401',
      title: 'Sesión no iniciada',
      message:
        'Debés iniciar sesión en la plataforma para poder acceder a esta sección de autogestión médica.',
      icon: <FaLock className="error-view-icon auth-missing-color" />,
    },
  };

  // Tomamos la configuración correspondiente (si mandan cualquier cosa por defecto es 404)
  const currentConfig = errorConfigs[type] || errorConfigs['404'];

  return (
    <div className="error-page-container">
      <div className="error-card">
        <div className="error-icon-wrapper">{currentConfig.icon}</div>
        <h1 className="error-code-text text-ellipsis">{currentConfig.code}</h1>
        <h2 className="error-title-text text-ellipsis">{currentConfig.title}</h2>
        <p className="error-message-text text-ellipsis-multiline">{currentConfig.message}</p>

        <div className="error-actions-container">
          <button onClick={() => navigate(-1)} className="error-btn btn-secondary-error">
            <FaArrowLeft />
            <span className="text-ellipsis">Volver atrás</span>
          </button>
          <Link to="/" className="error-btn btn-primary-error">
            <FaHome />
            <span className="text-ellipsis">Ir al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
