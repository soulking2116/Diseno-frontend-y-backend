// frontend_cripto/src/components/Portfolio.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom'; 
import './Portfolio.css';

function Portfolio() {
  const { user, isLoggedIn } = useAuth();
  // const navigate = useNavigate(); //
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMessage, setDepositMessage] = useState('');
  // const [deleteAccountMessage, setDeleteAccountMessage] = useState(''); //

  // Función para obtener los datos del portafolio (balance y tenencias)
  const fetchPortfolio = async () => {
    if (!isLoggedIn) {
      setError('No autenticado. Por favor, inicia sesión para ver tu portafolio.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token no encontrado. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:5001/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setPortfolioData(response.data);
      setLoading(false);

    } catch (err) {
      console.error('Error al obtener el portafolio:', err);
      if (err.response && err.response.status === 401) {
        setError('Sesión expirada o no válida. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
      } else {
        setError('Error al cargar el portafolio. Asegúrate de que el backend esté corriendo.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [isLoggedIn]);

  // Función para manejar el depósito de fondos
  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositMessage('');

    const amount = parseFloat(depositAmount);

    if (isNaN(amount) || amount <= 0) {
      setDepositMessage('Por favor, introduce una cantidad válida y positiva para depositar.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setDepositMessage('No autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/users/deposit', 
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPortfolioData(response.data.user);
      setDepositAmount('');
      setDepositMessage('Depósito realizado con éxito. Balance actualizado.');

    } catch (err) {
      console.error('Error al realizar el depósito:', err);
      if (err.response) {
        setDepositMessage(`Error al depositar: ${err.response.data.msg || 'Algo salió mal.'}`);
      } else {
        setDepositMessage('Error de red al depositar. Asegúrate de que el backend esté corriendo.');
      }
    }
  };

  if (loading) {
    return <div className="portfolio-container loading">Cargando portafolio...</div>;
  }

  if (error) {
    return <div className="portfolio-container error">Error: {error}</div>;
  }

  if (!portfolioData) {
    return <div className="portfolio-container">No se pudo cargar la información del portafolio.</div>;
  }

  return (
    <div className="portfolio-container">
      <h2>Mi Portafolio</h2>
      <div className="balance-info">
        <h3>Balance Disponible: ${portfolioData.balance ? portfolioData.balance.toFixed(2) : '0.00'}</h3>
      </div>

      {/* Formulario de Depósito */}
      <div className="deposit-section">
        <h3>Depositar Fondos</h3>
        <form onSubmit={handleDeposit} className="deposit-form">
          <input
            type="number"
            step="0.01"
            placeholder="Cantidad a depositar"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
          />
          <button type="submit">Depositar</button>
        </form>
        {depositMessage && <p className="deposit-message">{depositMessage}</p>}
      </div>

      {/* Sección del Portafolio de Criptomonedas */}
      {portfolioData.portfolio && portfolioData.portfolio.length > 0 ? (
        <div className="portfolio-grid">
          {portfolioData.portfolio.map((item) => (
            <div key={item.cryptoId} className="portfolio-item-card">
              <h4>{item.symbol}</h4>
              <p>Cantidad: {item.quantity.toFixed(8)}</p>
              <p>Precio de Compra Promedio: ${item.purchasePrice ? item.purchasePrice.toFixed(2) : 'N/A'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-portfolio-message">Aún no tienes criptomonedas en tu portafolio. ¡Empieza a comprar!</p>
      )}
    </div>
  );
}

export default Portfolio;