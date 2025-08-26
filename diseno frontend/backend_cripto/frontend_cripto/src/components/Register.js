// frontend_cripto/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios'; // Importamos axios para hacer peticiones HTTP
import { useNavigate } from 'react-router-dom'; // Para redirigir al usuario
import './Auth.css'; // Importamos el CSS común para autenticación

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nuevo estado para confirmar contraseña
  const [message, setMessage] = useState(''); // Para mostrar mensajes al usuario
  const navigate = useNavigate(); // Hook para la navegación programática

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    setMessage(''); // Limpiar mensajes anteriores

    if (password !== confirmPassword) {
      setMessage('Error: Las contraseñas no coinciden.');
      return;
    }

    try {
      // Realizar la petición POST a tu API de registro
      const response = await axios.post('http://localhost:5001/api/users/register', {
        email,
        password,
      });

      setMessage(response.data.msg); // Usar el mensaje del backend
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirige después de 2 segundos
      
    } catch (error) {
      // Manejar errores de la petición
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        setMessage(`Error: ${error.response.data.msg || 'Algo salió mal en el registro.'}`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        setMessage('Error de red: No se pudo conectar al servidor. Asegúrate de que tu backend esté corriendo.');
      } else {
        // Algo más causó el error
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {/* <div className="form-group">
          <label htmlFor="username">Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div> */}
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label> {/* Etiqueta actualizada */}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Registrarse</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}

export default Register;