import { useState } from 'react';
import './toggle-switch-botton.css';
import { useModoVista } from '../ModoVistaContext.jsx';

/**
 * Switch genérico reutilizable. No implementa ninguna funcionalidad por sí
 * mismo: expone su estado vía `onChange` para que quien lo use decida qué
 * controla (no es un toggle de modo oscuro/claro).
 */
export const ToggleSwitchBotton = ({ checked, onChange, ariaLabel = 'Alternar' }) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : internalChecked;
  const { setModo } = useModoVista();

  const handleChange = (e) => {
    if (!isControlled) setInternalChecked(e.target.checked);
    onChange?.(e.target.checked);
    setModo(e.target.checked ? 'modo-medico' : 'modo-paciente');
  };

  return (
    <label className="switch" aria-label={ariaLabel}>
      <input type="checkbox" checked={value} onChange={handleChange} />
      <span className="slider"></span>
    </label>
  );
};

export default ToggleSwitchBotton;
