import { createContext, useState, useContext } from 'react';

// 1. Creamos el contexto vacío
const modoContexto = createContext();

// 2. Creamos el componente Proveedor
export default function ModoVistaContext({ children }) {
  // Aquí declaramos el useState que queremos compartir globalmente
  const [modo, setModo] = useState('modo-paciente');

  return (
    // Pasamos tanto la variable como la función para actualizarla en el 'value'
    <modoContexto.Provider value={{ modo, setModo }}>{children}</modoContexto.Provider>
  );
}

// 3. Creamos un Hook personalizado para usar este contexto más fácil después
export function useModoVista() {
  return useContext(modoContexto);
}
