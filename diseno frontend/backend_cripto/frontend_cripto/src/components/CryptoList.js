// frontend_cripto/src/components/CryptoList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Asegúrate de que Link esté importado
import './CryptoList.css';

function CryptoList() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // CAMBIO AQUÍ: Mensaje de error más conciso sin la palabra "Error:"
          setError('Por favor, inicia sesión para ver las criptomonedas.'); 
          setLoading(false);
          return;
        }

        console.log('Intentando obtener criptomonedas...');
        console.log('Token JWT obtenido de localStorage:', token ? 'Token presente' : 'Token AUSENTE');
        console.log('URL de la petición:', 'http://localhost:5001/api/cryptos');

        const response = await axios.get('http://localhost:5001/api/cryptos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCryptos(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener criptomonedas:', err);
        if (err.response && err.response.status === 401) {
          setError('Sesión expirada o no válida. Por favor, inicia sesión de nuevo.');
          localStorage.removeItem('token');
        } else {
          setError('Error al cargar las criptomonedas. Asegúrate de que el backend esté corriendo y los datos se estén cargando.');
        }
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  if (loading) {
    return <div className="crypto-list-container loading">Cargando criptomonedas...</div>;
  }

  if (error) {
    // Se quitó la palabra "Error:" del display si el mensaje ya no lo incluye.
    return <div className="crypto-list-container error">{error}</div>;
  }

  if (!cryptos.length) { // Si no hay criptomonedas después de cargar, podría ser un mensaje diferente
    return <div className="crypto-list-container">No se encontraron criptomonedas disponibles.</div>;
  }

  return (
    <div className="crypto-list-container">
      <h2>Criptomonedas Populares</h2>
      <div className="crypto-grid">
        {cryptos.map((crypto) => (
          <div key={crypto._id} className="crypto-card">
            <h3>{crypto.name} ({crypto.symbol})</h3>
            <p>Precio Actual: ${crypto.currentPrice ? crypto.currentPrice.toFixed(2) : 'N/A'}</p>
            <p>Cambio 24h: <span className={crypto.priceChange24h >= 0 ? 'positive' : 'negative'}>
              {crypto.priceChange24h ? crypto.priceChange24h.toFixed(2) : 'N/A'}%
            </span></p>
            {/* */}
            <Link to={`/cryptos/${crypto.symbol}`} className="details-button">Ver Detalles</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CryptoList;