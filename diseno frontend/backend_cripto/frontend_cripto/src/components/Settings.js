// frontend_cripto/src/components/Settings.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Para obtener el estado de autenticación y logout
import { useNavigate } from 'react-router-dom'; // Para redirigir
import './Settings.css'; 

function Settings() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteAccountMessage, setDeleteAccountMessage] = useState('');

  // Función para manejar la eliminación de la cuenta
  const handleDeleteAccount = async () => {
    setDeleteAccountMessage('');
    
    if (!isLoggedIn) {
      setDeleteAccountMessage('No autenticado. Por favor, inicia sesión.');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.');
    
    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setDeleteAccountMessage('Token no encontrado. Por favor, inicia sesión.');
      return;
    }

    try {
      await axios.delete('http://localhost:5001/api/users/delete-account', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteAccountMessage('Cuenta eliminada exitosamente. Redirigiendo...');
      logout(); // Llama a la función logout del contexto para limpiar el estado
      setTimeout(() => {
        navigate('/register'); // Redirige a la página de registro o inicio
      }, 2000);

    } catch (err) {
      console.error('Error al eliminar la cuenta:', err);
      if (err.response) {
        setDeleteAccountMessage(`Error al eliminar cuenta: ${err.response.data.msg || 'Algo salió mal.'}`);
      } else {
        setDeleteAccountMessage('Error de red al eliminar cuenta. Asegúrate de que el backend esté corriendo.');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="settings-container error">
        <h2>Configuración de Cuenta</h2>
        <p>Por favor, inicia sesión para acceder a la configuración de tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h2>Configuración de Cuenta</h2>
      
      <div className="settings-section">
        <h3>Eliminar Cuenta</h3>
        <p>Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.</p>
        <button onClick={handleDeleteAccount} className="delete-account-button">Eliminar Mi Cuenta</button>
        {deleteAccountMessage && <p className="settings-message">{deleteAccountMessage}</p>}
      </div>

      {/* Aquí se podrían añadir otras opciones de configuración en el futuro */}
      {/* <div className="settings-section">
        <h3>Cambiar Contraseña</h3>
        <p>Formulario para cambiar contraseña...</p>
      </div> */}

    </div>
  );
}

export default Settings;