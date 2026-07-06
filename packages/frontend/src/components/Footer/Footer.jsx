import './Footer.css';

const Footer = ({ year }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text text-ellipsis">
          &copy; {year} Sweet Medical. Todos los derechos reservados.
        </p>
        <div className="footer-links">
          <a href="/privacidad" className="text-ellipsis">
            Privacidad
          </a>
          <a href="/terminos" className="text-ellipsis">
            Términos
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;