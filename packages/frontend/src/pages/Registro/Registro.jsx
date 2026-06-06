import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Registro.css';
import Toast from '../../components/Toast/Toast.jsx';

export default function Registro() {

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: ''
    });

    const [errores, setErrores] = useState({
        nombre: false,
        apellido: false,
        email: false,
        password: false
    });

    const [toast, setToast] = useState(null);

    const mostrarToast = (mensaje, tipo = 'success') => {
        setToast({ mensaje, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = () => {
        const nuevosErrores = {
            nombre: !formData.nombre,
            apellido: !formData.apellido,
            email: !formData.email,
            password: !formData.password
        };

        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(Boolean);
        if (hayErrores) {
            mostrarToast('Por favor, completa todos los campos', 'warning');
            return;
        }

        // sendRegistrationData(formData); // Aca se envía la request al back

        setFormData({ nombre: '', apellido: '', email: '', password: '' });
        setErrores({ nombre: false, apellido: false, email: false, password: false });
        mostrarToast('Registro exitoso', 'success');
    };

    const handleChange = (campo, valor) => {
        setFormData({ ...formData, [campo]: valor });
        if (errores[campo]) setErrores({ ...errores, [campo]: false });
    };

    return (
        <div className="registro-container">
            <div className="registro-form">
                <h2>Registro de Usuario</h2>
                <form>
                    <label htmlFor="nombre">Nombre:</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            id="nombre"
                            value={formData.nombre}
                            className={errores.nombre ? 'input-error' : ''}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                        />
                        {errores.nombre && <span className="icono-error" title="Campo requerido">⚠</span>}
                    </div>

                    <label htmlFor="apellido">Apellido:</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            id="apellido"
                            value={formData.apellido}
                            className={errores.apellido ? 'input-error' : ''}
                            onChange={(e) => handleChange('apellido', e.target.value)}
                        />
                        {errores.apellido && <span className="icono-error" title="Campo requerido">⚠</span>}
                    </div>

                    <label htmlFor="email">Correo Electrónico:</label>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            className={errores.email ? 'input-error' : ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errores.email && <span className="icono-error" title="Campo requerido">⚠</span>}
                    </div>

                    <label htmlFor="password">Contraseña:</label>
                    <div className="input-wrapper">
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            className={errores.password ? 'input-error' : ''}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                        {errores.password && <span className="icono-error" title="Campo requerido">⚠</span>}
                    </div>
                </form>

                <div className="registro-button">
                    <button onClick={handleSubmit}>Registrarse</button>
                </div>
                <div className="login-link">
                    <span>¿Ya tienes una cuenta?</span>
                    <Link to="/login">Volver al Login</Link>
                </div>
            </div>

            <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
        </div>
    );
}
