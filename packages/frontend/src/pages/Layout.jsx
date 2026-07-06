import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/footer.jsx';

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
