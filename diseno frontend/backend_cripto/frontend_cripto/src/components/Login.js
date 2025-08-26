// frontend_cripto/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { useAuth } from '../context/AuthContext'; // Importa el hook useAuth

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtiene la función login del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
        email,
        password,
      });

      const { token, user } = response.data; // El backend ahora devuelve también la info del usuario

      login(token, user); // Llama a la función login del contexto
      setMessage('Inicio de sesión exitoso. Redirigiendo...');

      setTimeout(() => {
        navigate('/cryptos');
        
      }, 1500);
      
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.msg || 'Credenciales inválidas.'}`);
      } else if (error.request) {
        setMessage('Error de red: No se pudo conectar al servidor. Asegúrate de que tu backend esté corriendo.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Iniciar Sesión</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}

export default Login;