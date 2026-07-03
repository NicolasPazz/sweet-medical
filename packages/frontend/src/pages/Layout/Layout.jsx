import { Outlet } from 'react-router-dom';
import Header from '../../components/header/Header.jsx';
import Footer from '../../components/footer/Footer.jsx';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />

      <div className="content-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
        <Footer year={new Date().getFullYear()} />
      </div>
    </div>
  );
};

export default Layout;
