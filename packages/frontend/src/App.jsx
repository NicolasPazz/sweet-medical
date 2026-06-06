import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home/Home';
import HealthPage from './pages/HealthPage/HealthPage';
import NotFound from './pages/Errors/NotFound/NotFound';
import { GestionServicio } from './pages/GestionServicio/GestionServicio';
import AgendarTurno from './pages/AgendarTurno/AgendarTurno';
import HistorialTurnos from './pages/HistorialTurnos/HistorialTurnos';
import { CartProvider } from './context/CartContext.jsx';
import Perfil from './pages/Perfil/Perfil';
import Login from './pages/Login/Login';
import './App.css';
import Registro from './pages/Registro/Registro.jsx';

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
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
