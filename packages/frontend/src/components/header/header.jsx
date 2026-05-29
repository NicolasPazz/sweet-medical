import "./header.css";

const Header = () => {
    return (
        <header className="header">
            
            <img src="/logoSweetMedical.png" alt="Logo"/>

            <nav>
            <ul>
                <li><a href="/">Inicio</a></li>
                <li><a href="/about">Agendar Turno</a></li>
                <li><a href="/contact">Contacto</a></li>
            </ul>
            </nav>

            <a id="iniciar-sesion" href="/login">Iniciar sesión</a>

        </header>
    )
};

export default Header;