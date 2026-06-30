import { useNavigate } from 'react-router-dom';
import './VolverGestion.css';

export default function VolverGestion() {
  const navigate = useNavigate();
  return (
    <button className="volver-gestion-btn" onClick={() => navigate('/gestion-medico')}>
      ← Volver a Gestión Médica
    </button>
  );
}
