import './Perfil.css';
import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage.jsx';
import { getMe } from '../../services/userService.js';

const spinIcon = <LoadingOutlined style={{ fontSize: 32, color: '#271f92' }} spin />;

export default function Perfil() {
  const { isAuthenticated, email, password, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const data = await getMe({ email, password });
          // Aplanamos los datos para que el template los consuma igual
          setUser({
            email: data.usuario?.email,
            dni: data.usuario?.dni,
            roles: data.usuario?.roles,
            nombreUsuario: data.usuario?.nombreUsuario,
            numTel: data.usuario?.numTel,
            direccion: data.usuario?.direccion,
            fechaNacimiento: data.usuario?.fechaNacimiento
              ? (() => {
                const d = new Date(data.usuario.fechaNacimiento);
                const dia = String(d.getUTCDate()).padStart(2, '0');
                const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
                const anio = d.getUTCFullYear();
                return `${dia}/${mes}/${anio}`;
              })()
              : null,
            nombre: data.perfil?.nombre,
            matricula: data.perfil?.matricula,
            especialidades: data.perfil?.especialidades?.map((e) => e.nombre) ?? [],
            practicas: data.perfil?.practicas?.map((p) => p.nombre) ?? [],
            sedes: data.perfil?.sedes?.map((s) => s.nombre ? `${s.nombre} — ${s.direccion ?? ''}`.trim() : s) ?? [],
            obraSocial: data.perfil?.obraSocial?.nombre,
            plan: data.perfil?.plan?.nombre,
            coberturasEspecialidad: data.perfil?.plan?.coberturasEspecialidad?.map((c) => c.especialidad?.nombre) ?? [],
            coberturasPractica: data.perfil?.plan?.coberturasPractica?.map((c) => c.practica?.nombre) ?? [],
            rol: data.usuario?.roles?.includes('MEDICO') ? 'Médico' : 'Paciente',
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

  // Protección de ruta: si no está autenticado, va a la página de error 401
  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  // Pantalla de carga unificada
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <Spin indicator={spinIcon} />
        <span className="text-ellipsis" style={{ color: '#94a3b8', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      {/* --- HEADER --- */}
      <div className="header-container">
        <h1 className="header-title text-ellipsis">Mi Perfil</h1>
        <div className="header-right">
          <h2 className="user-name text-ellipsis">{user?.nombreUsuario || user?.nombre || 'N/A'}</h2>
          <img className="user-avatar" src={user?.avatar || "/avatar.png"} alt="Avatar de usuario" />
          <button className="btn-logout text-ellipsis" onClick={() => { logout(); window.location.href = '/login'; }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* --- CONTENEDOR DE INFORMACIÓN (DOS COLUMNAS) --- */}
      <div className="profile-container">

        {/* COLUMNA IZQUIERDA: Dinámica según el Rol */}
        <div className="left-section">
          {user?.rol === 'Paciente' ? (
            <>
              <h2 className="section-title text-ellipsis">🏥 Mi Cobertura</h2>
              <div className="cobertura-row">
                <span className="cobertura-label text-ellipsis">Obra Social:</span>
                <span className="cobertura-value text-ellipsis">{user?.obraSocial || 'N/A'}</span>
              </div>
              <div className="cobertura-row">
                <span className="cobertura-label text-ellipsis">Plan:</span>
                <span className="cobertura-badge text-ellipsis">{user?.plan || 'N/A'}</span>
              </div>
              <div className="cobertura-row cobertura-row--top">
                <span className="cobertura-label text-ellipsis">Especialidades cubiertas:</span>
                <ul className="cobertura-list">
                  {user?.coberturasEspecialidad?.length ? (
                    user.coberturasEspecialidad.map((e, i) => (
                      <li key={i} className="cobertura-chip cobertura-chip--esp text-ellipsis">{e}</li>
                    ))
                  ) : (
                    <li className="cobertura-empty text-ellipsis">Sin cobertura registrada</li>
                  )}
                </ul>
              </div>
              <div className="cobertura-row cobertura-row--top">
                <span className="cobertura-label text-ellipsis">Prácticas cubiertas:</span>
                <ul className="cobertura-list">
                  {user?.coberturasPractica?.length ? (
                    user.coberturasPractica.map((p, i) => (
                      <li key={i} className="cobertura-chip cobertura-chip--prac text-ellipsis">{p}</li>
                    ))
                  ) : (
                    <li className="cobertura-empty text-ellipsis">Sin cobertura registrada</li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            /* Vista para Médicos / Profesionales */
            <table className="medical-table">
              <thead>
                <tr>
                  <th className="text-ellipsis">Datos Profesionales</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="text-ellipsis"><strong>Rol:</strong> {user?.rol || 'N/A'}</td></tr>
                <tr><td className="text-ellipsis"><strong>Años de antigüedad:</strong> {user?.antiguedad || 'N/A'}</td></tr>
                <tr>
                  <td>
                    <strong>Especialidades:</strong>
                    <ul>
                      {user?.especialidades ? (
                        user.especialidades.map((esp, index) => <li key={index} className="text-ellipsis">{esp}</li>)
                      ) : (
                        <li className="text-ellipsis">N/A</li>
                      )}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Prácticas:</strong>
                    <ul>
                      {user?.practicas?.length ? (
                        user.practicas.map((practica, index) => <li key={index} className="text-ellipsis">{practica}</li>)
                      ) : (
                        <li className="text-ellipsis">N/A</li>
                      )}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Sedes:</strong>
                    <ul>
                      {user?.sedes?.length ? (
                        user.sedes.map((sede, index) => <li key={index} className="text-ellipsis">{sede}</li>)
                      ) : (
                        <li className="text-ellipsis">Sin sedes registradas</li>
                      )}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* COLUMNA DERECHA: Información Personal Común */}
        <div className="right-section">
          <h2 className="section-title text-ellipsis">Información Personal</h2>
          <table className="personal-table">
            <tbody>
              <tr>
                <td className="label"><strong>Nombre:</strong></td>
                <td className="text-ellipsis">{user?.nombre || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label"><strong>DNI:</strong></td>
                <td className="text-ellipsis">{user?.dni || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label"><strong>Email:</strong></td>
                <td className="text-ellipsis">{user?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label"><strong>Teléfono:</strong></td>
                <td className="text-ellipsis">{user?.numTel || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label"><strong>Dirección:</strong></td>
                <td className="text-ellipsis">{user?.direccion || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label"><strong>Nacimiento:</strong></td>
                <td className="text-ellipsis">{user?.fechaNacimiento || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}