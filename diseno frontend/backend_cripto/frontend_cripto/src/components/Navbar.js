// frontend_cripto/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Grupo de enlaces a la izquierda */}
      <div className="navbar-left-group">
        <Link to="/" className="navbar-brand">         </Link>
        <Link to="/" className="navbar-item">Inicio</Link>
        <Link to="/cryptos" className="navbar-item">Criptomonedas</Link>
        {isLoggedIn ? (
          <>
            <Link to="/portfolio" className="navbar-item">Portafolio</Link>
            <Link to="/settings" className="navbar-item">Configuración</Link>
            <Link to="/support" className="navbar-item">Soporte</Link>
          </>
        ) : (
          null
        )}
      </div>

      {/* Grupo de enlaces a la derecha (solo autenticación) */}
      <div className="navbar-right-group">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="navbar-item logout-button">Cerrar Sesión</button>
        ) : (
          <>
            <Link to="/register" className="navbar-item">Registrarse</Link>
            <Link to="/login" className="navbar-item">Iniciar Sesión</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;


