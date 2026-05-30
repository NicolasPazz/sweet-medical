import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      
      <main className="main-content">
        <Outlet />
      </main>

      <Footer year={new Date().getFullYear()} />
    </div>
  );
};

export default Layout;