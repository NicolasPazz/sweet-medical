import "./Login.css";
import Header from "../../components/header/Header.jsx";

export default function Login() {

    return (
        <div className="inicioSesion-container">

            <div className="form-container">

                <h1>Iniciar Sesión</h1>

                <form action="/login" method="POST" className="login-form">
                    <div>
                        <label for="correoElectronico">Correo electronico:</label>
                        <input type="text" id="correoElectronico" name="usuario_correo_electronico" placeholder="Tu correo electrónico" required />
                    </div>

                    <div>
                        <label for="contrasena">Contraseña:</label>
                        <input type="password" id="contrasena" name="usuario_contrasena" placeholder="Tu contraseña" required />
                    </div>

                    <div>
                        <button type="submit">Login</button>
                    </div>
                </form>

                <div className="registro-link">
                    <p>¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a></p>
                </div>
            </div>
        </div>

    )

}