// frontend_cripto/src/components/CryptoDetail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el contexto de autenticación
import './CryptoDetail.css'; // Importamos el CSS específico para los detalles

function CryptoDetail() {
  const { symbol } = useParams(); // Obtiene el 'symbol' de la URL (ej. /cryptos/BTC -> BTC)
  const navigate = useNavigate(); // Para volver a la lista
  const { user, isLoggedIn, login } = useAuth(); // Obtenemos user, isLoggedIn y la función login del contexto
  const [crypto, setCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(''); // Estado para la cantidad a comprar/vender
  const [transactionMessage, setTransactionMessage] = useState(''); // Mensaje de éxito/error de transacción

  // Función para obtener los detalles de la criptomoneda
  const fetchCryptoDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5001/api/cryptos/${symbol}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCrypto(response.data.data); // Los datos están en response.data.data
      setLoading(false);
    } catch (err) {
      console.error(`Error al obtener detalles de ${symbol}:`, err);
      if (err.response && err.response.status === 401) {
        setError('Sesión expirada o no válida. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
      } else if (err.response && err.response.status === 404) {
        setError(`Criptomoneda con símbolo '${symbol}' no encontrada.`);
      } else {
        setError('Error al cargar los detalles de la criptomoneda. Asegúrate de que el backend esté corriendo.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchCryptoDetails();
    } else {
      setError('Símbolo de criptomoneda no proporcionado en la URL.');
      setLoading(false);
    }
  }, [symbol]);

  // Función para manejar la compra de criptomonedas
  const handleBuy = async (e) => {
    e.preventDefault();
    setTransactionMessage(''); // Limpiar mensajes anteriores

    const amount = parseFloat(quantity);
    if (isNaN(amount) || amount <= 0) {
      setTransactionMessage('Por favor, introduce una cantidad válida y positiva para comprar.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setTransactionMessage('No autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/users/buy-crypto', 
        { symbol, quantity: amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setTransactionMessage(response.data.msg);
      setQuantity(''); // Limpiar el campo
      // Actualizar el balance y portafolio en el contexto global
      login(token, response.data.user); // Usamos la función login del contexto para actualizar el usuario
    } catch (err) {
      console.error('Error al comprar criptomoneda:', err);
      if (err.response) {
        setTransactionMessage(`Error al comprar: ${err.response.data.msg || 'Algo salió mal.'}`);
      } else {
        setTransactionMessage('Error de red al comprar. Asegúrate de que el backend esté corriendo.');
      }
    }
  };

  // Función para manejar la venta de criptomonedas
  const handleSell = async (e) => {
    e.preventDefault();
    setTransactionMessage(''); // Limpiar mensajes anteriores

    const amount = parseFloat(quantity);
    if (isNaN(amount) || amount <= 0) {
      setTransactionMessage('Por favor, introduce una cantidad válida y positiva para vender.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setTransactionMessage('No autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/users/sell-crypto', 
        { symbol, quantity: amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setTransactionMessage(response.data.msg);
      setQuantity(''); // Limpiar el campo
      // Actualizar el balance y portafolio en el contexto global
      login(token, response.data.user); // Usamos la función login del contexto para actualizar el usuario
    } catch (err) {
      console.error('Error al vender criptomoneda:', err);
      if (err.response) {
        setTransactionMessage(`Error al vender: ${err.response.data.msg || 'Algo salió mal.'}`);
      } else {
        setTransactionMessage('Error de red al vender. Asegúrate de que el backend esté corriendo.');
      }
    }
  };

  if (loading) {
    return <div className="detail-container loading">Cargando detalles de la criptomoneda...</div>;
  }

  if (error) {
    return <div className="detail-container error">Error: {error}</div>;
  }

  if (!crypto) {
    return <div className="detail-container">No se encontraron datos para esta criptomoneda.</div>;
  }

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/cryptos')} className="back-button">← Volver a la lista</button>
      <h2>{crypto.name} ({crypto.symbol})</h2>
      <div className="detail-card">
        <p><strong>Precio Actual:</strong> ${crypto.currentPrice ? crypto.currentPrice.toFixed(2) : 'N/A'}</p>
        <p><strong>Cambio en 24h:</strong> <span className={crypto.priceChange24h >= 0 ? 'positive' : 'negative'}>
          {crypto.priceChange24h ? crypto.priceChange24h.toFixed(2) : 'N/A'}%
        </span></p>
        <p><strong>Capitalización de Mercado:</strong> ${crypto.marketCap ? crypto.marketCap.toLocaleString() : 'N/A'}</p>
        <p><strong>Volumen Total:</strong> ${crypto.totalVolume ? crypto.totalVolume.toLocaleString() : 'N/A'}</p>
        <p><strong>Última Actualización:</strong> {crypto.lastUpdated ? new Date(crypto.lastUpdated).toLocaleString() : 'N/A'}</p>
      </div>

      {isLoggedIn && user ? ( // Mostrar sección de compra/venta solo si el usuario está logeado Y el objeto user no es null
        <div className="trade-section">
          <h3>Comprar / Vender {crypto.symbol}</h3>
          <p className="user-balance">Tu Balance Disponible: ${user.balance ? user.balance.toFixed(2) : '0.00'}</p>
          
          {/* Mostrar cantidad actual en portafolio */}
          {user.portfolio && user.portfolio.length > 0 && (
            <p className="current-holding">
              Tienes: {user.portfolio.find(item => item.symbol === crypto.symbol)?.quantity || 0} {crypto.symbol}
            </p>
          )}

          <form onSubmit={handleBuy} className="trade-form">
            <input
              type="number"
              step="any" // Permite cualquier número decimal
              placeholder="Cantidad a comprar"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <button type="submit" className="buy-button">Comprar</button>
          </form>

          <form onSubmit={handleSell} className="trade-form">
            <input
              type="number"
              step="any"
              placeholder="Cantidad a vender"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <button type="submit" className="sell-button">Vender</button>
          </form>
          {transactionMessage && <p className="transaction-message">{transactionMessage}</p>}
        </div>
      ) : (
        // Mensaje opcional si el usuario no está logeado o el objeto user es null
        <div className="trade-section" style={{ textAlign: 'center', padding: '20px', color: '#ccc' }}>
          <p>Inicia sesión para comprar o vender criptomonedas.</p>
        </div>
      )}
    </div>
  );
}

export default CryptoDetail;