// frontend_cripto/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';

// Importa el AuthProvider y useAuth
import { AuthProvider, useAuth } from './context/AuthContext';

// Importa todos los componentes
import Login from './components/Login';
import Register from './components/Register';
import CryptoList from './components/CryptoList';
import CryptoDetail from './components/CryptoDetail';
import Portfolio from './components/Portfolio';
import Settings from './components/Settings';
import Support from './components/Support';

// Componente Home para usar el contexto
function HomeContent() {
  const { isLoggedIn } = useAuth(); // Hook para obtener el estado de login
  const navigate = useNavigate(); // UseNavigate para la redirección

  const handleViewPortfolio = () => {
    navigate('/portfolio');
  };

  return (
    <header className="App-header">
      <h1>Plataforma de Criptomonedas</h1>
      <p>Gestiona y haz crecer tus activos digitales.</p>
      {isLoggedIn && ( // Renderiza el botón solo si el usuario está logeado
        <button onClick={handleViewPortfolio} className="view-portfolio-button">
          Ver Portafolio
        </button>
      )}
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            {/* Ruta de inicio */}
            <Route path="/" element={<HomeContent />} />

            {/* Rutas de autenticación */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas de criptomonedas */}
            <Route path="/cryptos/:symbol" element={<CryptoDetail />} />
            <Route path="/cryptos" element={<CryptoList />} />
            
            {/* Ruta para el Portafolio */}
            <Route path="/portfolio" element={<Portfolio />} />

            {/* Ruta para Configuración */}
            <Route path="/settings" element={<Settings />} />

            {/* Ruta para Soporte */}
            <Route path="/support" element={<Support />} />

            {/* Ruta para cualquier otra URL no definida */}
            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
                <h2>404 - Página no encontrada</h2>
                <p>La URL a la que intentas acceder no existe.</p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;