import { useState } from 'react';
import './Login.css';
import Toast from '../../components/Toast/Toast.jsx';
import { useAuth } from '../../components/AuthProvider.jsx';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { login_back } from '../../services/authService.js';

const spinIcon = <LoadingOutlined style={{ fontSize: 16, color: '#fff' }} spin />;

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({ email: false, password: false });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login_front } = useAuth();

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    const nuevosErrores = {
      email: !formData.email,
      password: !formData.password,
    };
    setErrores(nuevosErrores);

    if (Object.values(nuevosErrores).some(Boolean)) {
      mostrarToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await login_back({ email: formData.email, password: formData.password });
      login_front({ email: formData.email, password: formData.password });
      mostrarToast('Inicio de sesión exitoso', 'success');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = '/';
    } catch (error) {
      const mensaje = error.response?.data?.message ?? 'Email o contraseña incorrectos';
      mostrarToast(mensaje, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
    if (errores[campo]) setErrores({ ...errores, [campo]: false });
  };

  return (
    <div className="inicioSesion-container">
      <div className="form-container">
        <h1 className="text-ellipsis">Iniciar Sesión</h1>
        <p className="form-subtitle text-ellipsis">Ingresá tus datos para continuar</p>

        <div className="login-form">
          <div>
            <label htmlFor="email" className="text-ellipsis">
              Correo electrónico:
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                value={formData.email}
                placeholder="Tu correo electrónico"
                className={errores.email ? 'input-error' : ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errores.email && (
                <span className="icono-error" title="Campo requerido">
                  ⚠
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-ellipsis">
              Contraseña:
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                value={formData.password}
                placeholder="Tu contraseña"
                className={errores.password ? 'input-error' : ''}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              {errores.password && (
                <span className="icono-error" title="Campo requerido">
                  ⚠
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-ellipsis"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {submitting ? (
              <>
                <Spin indicator={spinIcon} /> Ingresando...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </div>

        <div className="registro-link">
          <p className="text-ellipsis">
            ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
          </p>
        </div>
      </div>

      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </div>
  );
}
