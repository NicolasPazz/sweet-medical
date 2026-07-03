import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header.jsx';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer.jsx';

const Layout = () => {
  return (
    <>
      <Header />
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer year={new Date().getFullYear()} />
    </>
  );
};

export default Layout;
