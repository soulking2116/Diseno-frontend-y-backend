// frontend_cripto/src/components/Support.js
import React, { useState } from 'react';
import './Support.css'; 
import { useNavigate } from 'react-router-dom'; // Para el botón "Volver"

function Support() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormMessage('Mensaje enviado. Te responderemos a la brevedad.');
    console.log('Formulario de Soporte Enviado:', { email, subject, message });
    // Limpiar el formulario
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="support-container">
      <h2>Centro de Soporte</h2>
      <div className="support-content">
        <p>Si tienes alguna pregunta, problema o sugerencia, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
        
        {/* --- Formulario de Contacto --- */}
        <div className="support-form-section">
          <h3>Soporte Técnico</h3>
          <p>Por favor, describe tu problema o consulta. Te responderemos a la brevedad.</p>
          <form onSubmit={handleSubmit} className="support-form">
            <label htmlFor="support-email">Tu Correo Electrónico:</label>
            <input
              type="email"
              id="support-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="support-subject">Asunto:</label>
            <input
              type="text"
              id="support-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <label htmlFor="support-message">Mensaje:</label>
            <textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4" 
              required
            ></textarea>

            <div className="form-buttons">
              <button type="submit" className="send-message-button">Enviar Mensaje</button>
              <button type="button" onClick={() => navigate(-1)} className="back-button-form">Volver</button>
            </div>
          </form>
          {formMessage && <p className="form-status-message">{formMessage}</p>}
        </div>
        {/* --- FIN Formulario de Contacto --- */}

        {/* --- Información de Contacto --- */}
        <div className="contact-info">
          <h3>Información de Contacto</h3>
          <p><strong>Email:</strong> slahs_12@hotmail.com</p>
          <p><strong>Teléfono:</strong> 318587524</p>
          <p><strong>Horario de Atención:</strong> Lunes a Viernes, 9:00 AM - 5:00 PM (GMT-5)</p>
        </div>

        <div className="faq-section">
          <ul>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Support;
