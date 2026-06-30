import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { agregarSede, getSedesMe, getMe, getRolUsuario } from '../../../services/userService.js';
import { getSedes } from '../../../services/turnoService.js';
import Toast from '../../../components/Toast/Toast.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import VolverGestion from '../../../components/ui/VolverGestion.jsx';
import './GestionSedes.css';

export default function GestionSedes() {
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [todasLasSedes, setTodasLasSedes] = useState([]);
  const [misSedesIds, setMisSedesIds] = useState(new Set());
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        setLoadingUser(false);
        return;
      }
      try {
        const data = await getMe({ email, password });
        setUser({ rol: getRolUsuario(data.usuario?.roles) });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [email, password, isAuthenticated]);

  useEffect(() => {
    const cargar = async () => {
      if (!email || !password) {
        setCargando(false);
        return;
      }
      try {
        const [todasRes, misRes] = await Promise.all([
          getSedes(),
          getSedesMe({ email, password }),
        ]);
        const todas = todasRes?.data ?? todasRes ?? [];
        const mias = misRes ?? [];
        setTodasLasSedes(todas);
        setMisSedesIds(new Set(mias.map((s) => (s._id ?? s.id)?.toString())));
      } catch (err) {
        console.error('Error cargando sedes:', err);
        mostrarToast('Error al cargar las sedes', 'error');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [email, password]);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  if (loadingUser) {
    return (
      <div className="gs-sedes-page">
        <div className="gs-sedes-container">
          <Spinner size="md" text="Cargando..." />
        </div>
      </div>
    );
  }

  if (user?.rol !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  // Sedes disponibles = todas menos las que ya tengo
  const sedesDisponibles = todasLasSedes.filter(
    (s) => !misSedesIds.has((s._id ?? s.id)?.toString()),
  );

  const handleSubmit = async () => {
    if (!sedeSeleccionada) {
      setError(true);
      mostrarToast('Seleccioná una sede', 'warning');
      return;
    }

    const sede = todasLasSedes.find(
      (s) => (s._id ?? s.id)?.toString() === sedeSeleccionada,
    );

    setSubmitting(true);
    try {
      await agregarSede({
        email,
        password,
        nombre: sede.nombre,
        direccion: sede.direccion,
      });
      mostrarToast('Sede agregada exitosamente');
      // Actualizar el set de mis sedes para que desaparezca del select
      setMisSedesIds((prev) => new Set([...prev, sedeSeleccionada]));
      setSedeSeleccionada('');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al agregar la sede', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="gs-sedes-page">
        <div className="gs-sedes-container">
          <VolverGestion />
          <div className="gs-sedes-header">
            <h1 className="gs-sedes-title">Mis Sedes</h1>
            <p className="gs-sedes-subtitle">
              Seleccioná una sede de la base de datos para agregarla a tu perfil.
            </p>
          </div>

          <div className="gs-sedes-form">
            {cargando ? (
              <p className="gs-cargando">Cargando sedes...</p>
            ) : sedesDisponibles.length === 0 ? (
              <p className="gs-sin-sedes">
                Ya tenés todas las sedes disponibles agregadas, o no hay sedes en el sistema.
              </p>
            ) : (
              <>
                <div className="gs-campo">
                  <label htmlFor="sede-select">Sede disponible *</label>
                  <div className="gs-input-wrapper">
                    <select
                      id="sede-select"
                      className={`gs-select${error ? ' input-error' : ''}`}
                      value={sedeSeleccionada}
                      onChange={(e) => {
                        setSedeSeleccionada(e.target.value);
                        setError(false);
                      }}
                    >
                      <option value="">-- Seleccioná una sede --</option>
                      {sedesDisponibles.map((s) => (
                        <option key={s._id ?? s.id} value={(s._id ?? s.id)?.toString()}>
                          {s.nombre} — {s.direccion}
                        </option>
                      ))}
                    </select>
                    {error && <span className="gs-icono-error" title="Campo requerido">⚠</span>}
                  </div>
                </div>

                <button
                  className="gs-sedes-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Agregando...' : '+ Agregar sede'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </>
  );
}
