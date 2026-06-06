import { createContext, useState, useContext } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {

    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const isAuthenticated = !!token;

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
