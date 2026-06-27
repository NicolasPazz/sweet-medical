import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Registro.css';
import Toast from '../../components/Toast/Toast.jsx';
import { register } from '../../services/authService.js';

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ dni: '', email: '', password: '' });
  const [errores, setErrores] = useState({ dni: false, email: false, password: false });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
    if (errores[campo]) setErrores({ ...errores, [campo]: false });
  };

  const handleSubmit = async () => {
    const nuevosErrores = {
      dni: !formData.dni.trim(),
      email: !formData.email.trim(),
      password: !formData.password.trim(),
    };

    setErrores(nuevosErrores);

    if (Object.values(nuevosErrores).some(Boolean)) {
      mostrarToast('Por favor, completá todos los campos', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        dni: formData.dni.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      mostrarToast('Cuenta activada exitosamente', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ?? 'Ocurrió un error al registrarse. Intentá de nuevo.';
      mostrarToast(mensaje, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-form">
        <h2 className="text-ellipsis">Activar cuenta</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="dni" className="text-ellipsis">
            DNI:
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="dni"
              placeholder="Tu número de DNI"
              value={formData.dni}
              className={errores.dni ? 'input-error' : ''}
              onChange={(e) => handleChange('dni', e.target.value)}
            />
            {errores.dni && (
              <span className="icono-error" title="Campo requerido">
                ⚠
              </span>
            )}
          </div>

          <label htmlFor="email" className="text-ellipsis">
            Correo Electrónico:
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              placeholder="Tu correo electrónico"
              value={formData.email}
              className={errores.email ? 'input-error' : ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errores.email && (
              <span className="icono-error" title="Campo requerido">
                ⚠
              </span>
            )}
          </div>

          <label htmlFor="password" className="text-ellipsis">
            Contraseña:
          </label>
          <div className="input-wrapper">
            <input
              type="password"
              id="password"
              placeholder="Elegí una contraseña"
              value={formData.password}
              className={errores.password ? 'input-error' : ''}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            {errores.password && (
              <span className="icono-error" title="Campo requerido">
                ⚠
              </span>
            )}
          </div>
        </form>

        <div className="registro-button">
          <button onClick={handleSubmit} disabled={submitting} className="text-ellipsis">
            {submitting ? 'Activando cuenta...' : 'Activar cuenta'}
          </button>
        </div>

        <div className="login-link">
          <span className="text-ellipsis">¿Ya activaste tu cuenta?</span>
          <Link to="/login" className="text-ellipsis">
            Iniciar sesión
          </Link>
        </div>
      </div>

      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </div>
  );
}
