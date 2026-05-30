import './Footer.css';

const Footer = ({ year }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">&copy; {year} Sweet Medical. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="/privacidad">Privacidad</a>
          <a href="/terminos">Términos</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;