// frontend_cripto/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el contexto
export const AuthContext = createContext();

// 2. Crear el proveedor del contexto
export const AuthProvider = ({ children }) => {
  // Estado para saber si el usuario está logeado
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Estado para guardar la información del usuario (opcional, pero útil)
  const [user, setUser] = useState(null);

  // Efecto para inicializar el estado de login al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si hay un token, asumimos que el usuario está logeado
      setIsLoggedIn(true);
      // para obtener los datos completos del usuario si el token es válido.
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Función para manejar el inicio de sesión
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUser(userData); // Guarda los datos del usuario en el estado
  };

  // Función para manejar el cierre de sesión
  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null); // Limpia los datos del usuario
  };

  // El valor que se proveerá a los componentes hijos
  const authContextValue = {
    isLoggedIn,
    user, // Provee el objeto de usuario
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};
