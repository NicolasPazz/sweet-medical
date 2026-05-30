import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Home from './pages/Home';
import HealthPage from './pages/HealthPage';
import NotFound from './pages/NotFound';
import { CartProvider } from './context/CartContext.jsx';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header />
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer year={new Date().getFullYear()} />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
