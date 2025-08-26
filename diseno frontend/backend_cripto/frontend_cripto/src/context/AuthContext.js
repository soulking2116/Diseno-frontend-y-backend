// frontend_cripto/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el contexto
export const AuthContext = createContext();

// 2. Crear el proveedor del contexto
export const AuthProvider = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Estado para guardar la información del usuario
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('AuthContext: useEffect de inicialización ejecutado.');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('AuthContext: Token encontrado en localStorage al inicializar.');
      setIsLoggedIn(true);

    } else {
      console.log('AuthContext: No se encontró token en localStorage al inicializar.');
      setIsLoggedIn(false);
    }
    console.log('AuthContext: Estado inicial isLoggedIn:', isLoggedIn);
  }, []);

  // Función para manejar el inicio de sesión
  const login = (token, userData) => {
    console.log('AuthContext: Función login llamada.');
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUser(userData);
    console.log('AuthContext: isLoggedIn establecido a true después del login.');
  };

  // Función para manejar el cierre de sesión
  const logout = () => {
    console.log('AuthContext: Función logout llamada.');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    console.log('AuthContext: isLoggedIn establecido a false después del logout.');
  };

  // El valor que se proveerá a los componentes hijos
  const authContextValue = {
    isLoggedIn,
    user,
    login,
    logout,
  };

  // Este log se ejecutará cada vez que el contexto se renderice
  console.log('AuthContext: Proveedor renderizando. Valor actual de isLoggedIn:', isLoggedIn);

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
