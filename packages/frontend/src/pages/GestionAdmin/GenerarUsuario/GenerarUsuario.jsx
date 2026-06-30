import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerarUsuario.css';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import Toast from '../../../components/Toast/Toast.jsx';
import { crearPacienteAdmin, crearMedicoAdmin } from '../../../services/adminService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 16, color: '#fff' }} spin />;

const EMPTY_FORM = { dni: '', nombre: '', matricula: '' };

export function GenerarUsuario() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();

  const [rol, setRol] = useState('PACIENTE');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: false }));
  };

  const cambiarRol = (nuevoRol) => {
    setRol(nuevoRol);
    setForm(EMPTY_FORM);
    setErrores({});
  };

  const validar = () => {
    const nuevosErrores = {
      dni: !form.dni.trim() || !/^\d{7,9}$/.test(form.dni.trim()),
      nombre: !form.nombre.trim(),
    };
    if (rol === 'MEDICO') {
      nuevosErrores.matricula = !form.matricula.trim();
    }
    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validar()) {
      mostrarToast('Revisá los campos marcados.', 'warning');
      return;
    }

    setEnviando(true);
    try {
      if (rol === 'PACIENTE') {
        await crearPacienteAdmin({
          email,
          password,
          dni: form.dni.trim(),
          nombre: form.nombre.trim(),
        });
      } else {
        await crearMedicoAdmin({
          email,
          password,
          dni: form.dni.trim(),
          nombre: form.nombre.trim(),
          matricula: form.matricula.trim(),
        });
      }
      mostrarToast(
        `Usuario ${rol === 'PACIENTE' ? 'Paciente' : 'Médico'} creado correctamente (inactivo).`,
        'success',
      );
      setForm(EMPTY_FORM);
      setErrores({});
    } catch (error) {
      const mensaje =
        error.response?.data?.message ?? 'No se pudo crear el usuario. Verificá los datos.';
      mostrarToast(mensaje, 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="gu-page">
      <div className="gu-container">
        <button className="gu-volver" onClick={() => navigate('/gestion-admin')}>
          ← Volver al Panel de Administración
        </button>

        <div className="gu-header">
          <h1 className="gu-title text-ellipsis">Generación de Usuarios</h1>
          <p className="gu-subtitle text-ellipsis">
            Creá un nuevo usuario Paciente o Médico. El usuario queda inactivo hasta que se le
            asignen credenciales.
          </p>
        </div>

        <div className="gu-card">
          <div className="gu-rol-toggle">
            <button
              type="button"
              className={`gu-rol-btn${rol === 'PACIENTE' ? ' active' : ''}`}
              onClick={() => cambiarRol('PACIENTE')}
            >
              🧍 Paciente
            </button>
            <button
              type="button"
              className={`gu-rol-btn${rol === 'MEDICO' ? ' active' : ''}`}
              onClick={() => cambiarRol('MEDICO')}
            >
              🩺 Médico
            </button>
          </div>

          <label className="gu-label">DNI</label>
          <input
            className={`gu-input${errores.dni ? ' gu-input-error' : ''}`}
            value={form.dni}
            onChange={set('dni')}
            placeholder="Ej: 30123456"
            inputMode="numeric"
          />
          {errores.dni && <span className="gu-error-text">DNI inválido (7 a 9 dígitos).</span>}

          <label className="gu-label">Nombre completo</label>
          <input
            className={`gu-input${errores.nombre ? ' gu-input-error' : ''}`}
            value={form.nombre}
            onChange={set('nombre')}
            placeholder="Ej: Juan Pérez"
          />
          {errores.nombre && <span className="gu-error-text">El nombre es obligatorio.</span>}

          {rol === 'MEDICO' && (
            <>
              <label className="gu-label">Matrícula</label>
              <input
                className={`gu-input${errores.matricula ? ' gu-input-error' : ''}`}
                value={form.matricula}
                onChange={set('matricula')}
                placeholder="Ej: MAT-1234"
              />
              {errores.matricula && (
                <span className="gu-error-text">La matrícula es obligatoria.</span>
              )}
            </>
          )}

          <button
            className="gu-btn-primary"
            onClick={handleSubmit}
            disabled={enviando}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {enviando ? (
              <>
                <Spin indicator={spinIcon} /> Creando...
              </>
            ) : (
              `Crear usuario ${rol === 'PACIENTE' ? 'Paciente' : 'Médico'}`
            )}
          </button>
        </div>
      </div>

      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </div>
  );
}

export default GenerarUsuario;
