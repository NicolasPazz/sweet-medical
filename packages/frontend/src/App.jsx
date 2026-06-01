import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import HealthPage from './pages/HealthPage';
import NotFound from './pages/NotFound';
import { GestionServicio } from './pages/GestionServicio';
import AgendarTurno from './pages/AgendarTurno';
import HistorialTurnos from './pages/HistorialTurnos';
import { CartProvider } from './context/CartContext.jsx';
import Perfil from './pages/Perfil';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="servicio" element={<GestionServicio />} />
            <Route path="solicitar-turno" element={<AgendarTurno />} />
            <Route path="solicitar-turno/:idServicio" element={<AgendarTurno />} />
            <Route path="historial-medico" element={<HistorialTurnos />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
