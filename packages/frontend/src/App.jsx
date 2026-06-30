import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home/Home';
import HealthPage from './pages/HealthPage/HealthPage';
import ErrorPage from './pages/ErrorPage/ErrorPage.jsx';
import { GestionMedico } from './pages/GestionMedico/GestionMedico';
import { GestionServicio } from './pages/GestionMedico/GestionServicio/GestionServicio';
import { GestionAdmin } from './pages/GestionAdmin/GestionAdmin';
import { GenerarUsuario } from './pages/GestionAdmin/GenerarUsuario/GenerarUsuario';
import { GestionServicioAdmin } from './pages/GestionAdmin/GestionServicio/GestionServicio';
import HistorialPaciente from './pages/GestionMedico/HistorialPaciente/HistorialPaciente';
import DisponibilidadMedico from './pages/GestionMedico/DisponibilidadMedico/DisponibilidadMedico';
import AgendarTurno from './pages/AgendarTurno/AgendarTurno';
import HistorialTurnos from './pages/HistorialTurnos/Paciente/HistorialTurnos';
import HistorialTurnosMedico from './pages/HistorialTurnos/Medico/HistorialTurnosMedico';
import { CartProvider } from './context/CartContext.jsx';
import Perfil from './pages/Perfil/Perfil';
import Login from './pages/Login/Login';
import GestionSedes from './pages/GestionMedico/GestionSedes/GestionSedes.jsx';
import './App.css';
import Registro from './pages/Registro/Registro.jsx';
import Contacto from './pages/Contacto.jsx';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="health" element={<HealthPage />} />

            {/* Panel administrador */}
            <Route path="gestion-admin" element={<GestionAdmin />} />
            <Route path="gestion-admin/usuarios" element={<GenerarUsuario />} />
            <Route path="gestion-admin/servicio" element={<GestionServicioAdmin />} />

            {/* Panel médico */}
            <Route path="gestion-medico" element={<GestionMedico />} />
            <Route path="gestion-medico/servicio" element={<GestionServicio />} />
            <Route path="gestion-medico/mis-turnos" element={<HistorialTurnosMedico />} />
            <Route path="gestion-medico/historial-paciente" element={<HistorialPaciente />} />
            <Route path="gestion-medico/disponibilidad" element={<DisponibilidadMedico />} />
            <Route path="gestion-medico/sedes" element={<GestionSedes />} />
            <Route path="solicitar-turno" element={<AgendarTurno />} />
            <Route path="solicitar-turno/:idServicio" element={<AgendarTurno />} />
            <Route path="historial-medico" element={<HistorialTurnos />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />
            <Route path="*" element={<ErrorPage type="404" />} />
            <Route path="404" element={<ErrorPage type="404" />} />
            <Route path="403" element={<ErrorPage type="403" />} />
            <Route path="contact" element={<Contacto />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
