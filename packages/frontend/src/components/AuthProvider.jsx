import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [email, setEmailData] = useState(() => localStorage.getItem('email'));
  const [password, setPasswordData] = useState(() => localStorage.getItem('password'));

  const isAuthenticated = !!email && !!password;

  const login_front = ({ email, password }) => {
    setEmailData(email);
    setPasswordData(password);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
  };

  const logout = () => {
    setEmailData(null);
    setPasswordData(null);
    localStorage.removeItem('email');
    localStorage.removeItem('password');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, password, login_front, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
