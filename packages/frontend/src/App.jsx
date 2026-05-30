import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/footer';
import Home from './pages/Home';
import HealthPage from './pages/HealthPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer year={new Date().getFullYear()} />
    </BrowserRouter>
  );
}

export default App;
