import './Footer.css';

const Footer = (props) => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {props.year} Sweet Medical. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
