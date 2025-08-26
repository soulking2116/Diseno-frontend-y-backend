// backend_cripto/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // --- CONSOLE.LOG DE DEPURACIÓN EN EL MIDDLEWARE PROTECT ---
    console.log('--- Middleware PROTECT ejecutándose ---');
    // --- FIN DE CONSOLE.LOG ---

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token de la cabecera
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar usuario de la base de datos a la solicitud
            req.user = await User.findById(decoded.id).select('-password'); // Excluir la contraseña

            // --- CONSOLE.LOG DE DEPURACIÓN EN PROTECT (TOKEN VÁLIDO) ---
            console.log('Token JWT verificado. Usuario:', req.user ? req.user.email : 'No encontrado');
            // --- FIN DE CONSOLE.LOG ---

            next();
        } catch (error) {
            console.error('Error en el middleware de autenticación:', error.message);
            res.status(401).json({ msg: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        console.error('No hay token, autorización denegada');
        res.status(401).json({ msg: 'No autorizado, no hay token' });
    }
};

module.exports = { protect };