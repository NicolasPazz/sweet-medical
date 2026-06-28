import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Registro.css';
import Toast from '../../components/Toast/Toast.jsx';
import { register } from '../../services/authService.js';

const CAMPOS_OBLIGATORIOS = ['dni', 'email', 'password'];

// Definido FUERA del componente para que React no lo desmonte en cada render
function CampoInput({ id, label, placeholder, tipo = 'text', obligatorio = false, value, error, onChange }) {
  return (
    <div className="registro-campo">
      <label htmlFor={id}>
        {label}{obligatorio && ' *'}
      </label>
      <div className="input-wrapper">
        <input
          type={tipo}
          id={id}
          placeholder={placeholder}
          value={value}
          className={error ? 'input-error' : ''}
          onChange={onChange}
        />
        {error && <span className="icono-error" title="Campo inválido">⚠</span>}
      </div>
    </div>
  );
}

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dni: '',
    email: '',
    password: '',
    nombreUsuario: '',
    numTel: '',
    direccion: '',
    fechaNacimiento: '',
  });
  const [errores, setErrores] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: false }));
  };

  const handleFechaChange = (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
    if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5);
    if (valor.length > 10) valor = valor.slice(0, 10);
    handleChange('fechaNacimiento', valor);
  };

  const handleSubmit = async () => {
    const nuevosErrores = {};
    CAMPOS_OBLIGATORIOS.forEach((campo) => {
      if (!formData[campo].trim()) nuevosErrores[campo] = true;
    });

    if (formData.fechaNacimiento && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.fechaNacimiento)) {
      nuevosErrores.fechaNacimiento = true;
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      mostrarToast('Corregí los campos marcados', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        dni: formData.dni.trim(),
        email: formData.email.trim(),
        password: formData.password,
        nombreUsuario: formData.nombreUsuario.trim() || undefined,
        numTel: formData.numTel.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        fechaNacimiento: formData.fechaNacimiento || undefined,
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
        <h2>Activar cuenta</h2>
        <p className="registro-subtitulo">Completá tus datos para activar tu cuenta</p>

        <form onSubmit={(e) => e.preventDefault()}>

          {/* Fila 1: DNI + Email */}
          <div className="registro-fila">
            <CampoInput
              id="dni" label="DNI" placeholder="Ej: 12345678" obligatorio
              value={formData.dni} error={errores.dni}
              onChange={(e) => handleChange('dni', e.target.value)}
            />
            <CampoInput
              id="email" label="Correo electrónico" placeholder="tu@email.com" tipo="email" obligatorio
              value={formData.email} error={errores.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          {/* Fila 2: Password + Nombre de usuario */}
          <div className="registro-fila">
            <CampoInput
              id="password" label="Contraseña" placeholder="Mínimo 6 caracteres" tipo="password" obligatorio
              value={formData.password} error={errores.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            <CampoInput
              id="nombreUsuario" label="Nombre de usuario" placeholder="Ej: juan123"
              value={formData.nombreUsuario} error={errores.nombreUsuario}
              onChange={(e) => handleChange('nombreUsuario', e.target.value)}
            />
          </div>

          {/* Fila 3: Teléfono + Fecha */}
          <div className="registro-fila">
            <CampoInput
              id="numTel" label="Teléfono" placeholder="Ej: 1123456789"
              value={formData.numTel} error={errores.numTel}
              onChange={(e) => handleChange('numTel', e.target.value)}
            />
            <div className="registro-campo">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="fechaNacimiento"
                  placeholder="DD/MM/YYYY"
                  value={formData.fechaNacimiento}
                  maxLength={10}
                  className={errores.fechaNacimiento ? 'input-error' : ''}
                  onChange={handleFechaChange}
                />
                {errores.fechaNacimiento && (
                  <span className="icono-error" title="Formato inválido (DD/MM/YYYY)">⚠</span>
                )}
              </div>
            </div>
          </div>

          {/* Dirección — fila completa */}
          <div className="registro-campo">
            <label htmlFor="direccion">Dirección</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="direccion"
                placeholder="Ej: Av. Siempreviva 742, CABA"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
              />
            </div>
          </div>

        </form>

        <div className="registro-button">
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Activando cuenta...' : 'Activar cuenta'}
          </button>
        </div>

        <div className="login-link">
          <span>¿Ya activaste tu cuenta?</span>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>

      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </div>
  );
}
