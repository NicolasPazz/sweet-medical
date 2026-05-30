import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import HealthPage from './pages/HealthPage';
import NotFound from './pages/NotFound';
import { Servicio } from './pages/Servicio';
import { CartProvider } from './context/CartContext.jsx';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="servicio" element={<Servicio/>}/>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;