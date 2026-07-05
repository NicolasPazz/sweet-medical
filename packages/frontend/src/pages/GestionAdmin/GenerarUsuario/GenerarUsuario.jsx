import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerarUsuario.css';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import Toast from '../../../components/Toast/Toast.jsx';
import { crearUsuarioAdmin } from '../../../services/adminService.js';
import { getObrasSociales } from '../../../services/turnoService.js';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 16, color: '#fff' }} spin />;

const EMPTY_FORM = { dni: '', nombre: '', matricula: '', obraSocial: '', plan: '' };

export function GenerarUsuario() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();

  const [roles, setRoles] = useState({ paciente: true, medico: false });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [cargandoObrasSociales, setCargandoObrasSociales] = useState(true);

  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const body = await getObrasSociales();
        setObrasSociales(body?.data ?? []);
      } catch (error) {
        mostrarToast('No se pudieron cargar las obras sociales.', 'error');
      } finally {
        setCargandoObrasSociales(false);
      }
    };
    fetchObrasSociales();
  }, []);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  const obraSocialSeleccionada = obrasSociales.find((os) => os._id === form.obraSocial);
  const planesDisponibles = obraSocialSeleccionada?.planes ?? [];

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: false }));
  };

  // Al cambiar la obra social hay que resetear el plan, ya que los planes
  // disponibles dependen de la obra social elegida (relación one-to-many).
  const setObraSocial = (e) => {
    const obraSocial = e.target.value;
    setForm((f) => ({ ...f, obraSocial, plan: '' }));
    if (errores.obraSocial) setErrores((er) => ({ ...er, obraSocial: false }));
  };

  const toggleRol = (rol) => {
    setRoles((r) => ({
      ...r,
      [rol]: !r[rol],
    }));
  };

  const validar = () => {
    const tieneRol = roles.paciente || roles.medico;
    const nuevosErrores = {
      dni: !form.dni.trim() || !/^\d{7,9}$/.test(form.dni.trim()),
      nombre: !form.nombre.trim(),
      roles: !tieneRol,
    };
    if (roles.medico) {
      nuevosErrores.matricula = !form.matricula.trim();
    }
    if (roles.paciente) {
      nuevosErrores.obraSocial = !form.obraSocial;
      nuevosErrores.plan = !form.plan;
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
      const rolesSeleccionados = [
        roles.paciente && 'PACIENTE',
        roles.medico && 'MEDICO',
      ].filter(Boolean);

      // Crear el usuario con todos los roles seleccionados en una sola operación,
      // para que quede un único Usuario con ambos roles en vez de dos usuarios separados.
      await crearUsuarioAdmin({
        email,
        password,
        dni: form.dni.trim(),
        nombre: form.nombre.trim(),
        matricula: roles.medico ? form.matricula.trim() : undefined,
        obraSocial: roles.paciente ? form.obraSocial : undefined,
        plan: roles.paciente ? form.plan : undefined,
        roles: rolesSeleccionados,
      });

      const rolesCreados = [
        roles.paciente && 'Paciente',
        roles.medico && 'Médico',
      ]
        .filter(Boolean)
        .join(' y ');

      mostrarToast(
        `Usuario ${rolesCreados} creado correctamente (inactivo).`,
        'success',
      );
      setForm(EMPTY_FORM);
      setErrores({});
      setRoles({ paciente: true, medico: false });
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
            Generá un nuevo usuario
          </p>
        </div>

        <div className="gu-card">
          <div className="gu-roles-section">
            <label className="gu-label">Roles (seleccioná al menos uno) *</label>
            <div className="gu-checkboxes-group">
              <label className="gu-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={roles.paciente}
                  onChange={() => toggleRol('paciente')}
                />
                <span className="gu-checkbox-label">Paciente</span>
              </label>
              <label className="gu-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={roles.medico}
                  onChange={() => toggleRol('medico')}
                />
                <span className="gu-checkbox-label">Médico</span>
              </label>
            </div>
            {errores.roles && (
              <span className="gu-error-text">Debés seleccionar al menos un rol.</span>
            )}
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

          {roles.paciente && (
            <>
              <label className="gu-label">Obra Social</label>
              <select
                className={`gu-input${errores.obraSocial ? ' gu-input-error' : ''}`}
                value={form.obraSocial}
                onChange={setObraSocial}
                disabled={cargandoObrasSociales}
              >
                <option value="">
                  {cargandoObrasSociales ? 'Cargando...' : 'Seleccione obra social'}
                </option>
                {obrasSociales.map((os) => (
                  <option key={os._id} value={os._id}>
                    {os.nombre}
                  </option>
                ))}
              </select>
              {errores.obraSocial && (
                <span className="gu-error-text">La obra social es obligatoria.</span>
              )}

              <label className="gu-label">Plan</label>
              <select
                className={`gu-input${errores.plan ? ' gu-input-error' : ''}`}
                value={form.plan}
                onChange={set('plan')}
                disabled={!form.obraSocial}
              >
                <option value="">
                  {form.obraSocial ? 'Seleccione plan' : 'Elegí primero una obra social'}
                </option>
                {planesDisponibles.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.nombre}
                  </option>
                ))}
              </select>
              {errores.plan && <span className="gu-error-text">El plan es obligatorio.</span>}
            </>
          )}

          {roles.medico && (
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
              'Crear usuario'
            )}
          </button>
        </div>
      </div>

      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </div>
  );
}

export default GenerarUsuario;
