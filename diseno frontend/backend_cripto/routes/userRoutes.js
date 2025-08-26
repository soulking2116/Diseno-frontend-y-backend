const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cryptocurrency = require('..//models/Cryptocurrency');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Función para generar un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
    });
};

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token de la cabecera
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar usuario de la base de datos a la solicitud
            req.user = await User.findById(decoded.id).select('-password');
            
            next();
        } catch (error) {
            console.error('Error en el middleware de autenticación:', error.message);
            res.status(401).json({ msg: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ msg: 'No autorizado, no hay token' });
    }
};

router.post('/register', async (req, res) => {
    const { email, password } = req.body; // Eliminado 'username' de la desestructuración

    if (!email || !password) { // Solo validar email y password
        return res.status(400).json({ msg: 'Por favor, introduce todos los campos' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        user = new User({
            email,
            password,
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            msg: 'Registro exitoso. ¡Ahora puedes iniciar sesión!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
            },
            token,
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).send('Error del servidor al registrar usuario');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor, introduce todos los campos' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            msg: 'Inicio de sesión exitoso',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
            },
            token,
        });

    } catch (error) {
        console.error('Error en el login del usuario:', error.message);
        res.status(500).send('Error del servidor al iniciar sesión');
    }
});

router.get('/profile', protect, async (req, res) => {
    res.status(200).json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        balance: req.user.balance,
        portfolio: req.user.portfolio,
    });
});

router.post('/deposit', protect, async (req, res) => {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ msg: 'Por favor, introduce una cantidad de depósito válida y positiva.' });
    }

    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        user.balance += amount;
        await user.save();

        res.status(200).json({
            msg: 'Depósito realizado con éxito.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                portfolio: user.portfolio,
            },
        });

    } catch (error) {
        console.error('Error al depositar fondos:', error.message);
        res.status(500).send('Error del servidor al procesar el depósito.');
    }
});

router.post('/buy-crypto', protect, async (req, res) => {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ msg: 'Por favor, proporciona un símbolo y una cantidad positiva para comprar.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const crypto = await Cryptocurrency.findOne({ symbol: symbol.toUpperCase() });
        if (!crypto) {
            return res.status(404).json({ msg: `Criptomoneda con símbolo '${symbol}' no encontrada.` });
        }

        const cost = quantity * crypto.currentPrice;

        if (user.balance < cost) {
            return res.status(400).json({ msg: 'Fondos insuficientes para realizar esta compra.' });
        }


        user.balance -= cost;

        const existingCryptoIndex = user.portfolio.findIndex(item => item.symbol === symbol.toUpperCase());

        if (existingCryptoIndex > -1) {
            // Si ya tiene la cripto, actualizar cantidad y precio promedio
            const existingItem = user.portfolio[existingCryptoIndex];
            const newTotalQuantity = existingItem.quantity + quantity;
            const newTotalCost = (existingItem.quantity * existingItem.purchasePrice) + cost;
            existingItem.quantity = newTotalQuantity;
            existingItem.purchasePrice = newTotalCost / newTotalQuantity;
        } else {
            // Si no la tiene, añadirla al portafolio
            user.portfolio.push({
                cryptoId: crypto._id,
                symbol: symbol.toUpperCase(),
                quantity: quantity,
                purchasePrice: crypto.currentPrice, // Precio de compra inicial
            });
        }

        await user.save();

        res.status(200).json({
            msg: `Compra de ${quantity} ${symbol.toUpperCase()} realizada con éxito.`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                portfolio: user.portfolio,
            },
        });

    } catch (error) {
        console.error('Error al comprar criptomoneda:', error.message);
        res.status(500).send('Error del servidor al procesar la compra.');
    }
});

router.post('/sell-crypto', protect, async (req, res) => {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ msg: 'Por favor, proporciona un símbolo y una cantidad positiva para vender.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const crypto = await Cryptocurrency.findOne({ symbol: symbol.toUpperCase() });
        if (!crypto) {
            return res.status(404).json({ msg: `Criptomoneda con símbolo '${symbol}' no encontrada.` });
        }

        const existingCryptoIndex = user.portfolio.findIndex(item => item.symbol === symbol.toUpperCase());

        if (existingCryptoIndex === -1) {
            return res.status(400).json({ msg: `No tienes ${symbol.toUpperCase()} en tu portafolio para vender.` });
        }

        const existingItem = user.portfolio[existingCryptoIndex];

        if (existingItem.quantity < quantity) {
            return res.status(400).json({ msg: `No tienes suficiente ${symbol.toUpperCase()} para vender.` });
        }

        const revenue = quantity * crypto.currentPrice;

        user.balance += revenue;

        existingItem.quantity -= quantity;

        if (existingItem.quantity === 0) {
            // Si la cantidad llega a cero, eliminar la cripto del portafolio
            user.portfolio.splice(existingCryptoIndex, 1);
        }

        await user.save();

        res.status(200).json({
            msg: `Venta de ${quantity} ${symbol.toUpperCase()} realizada con éxito.`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                portfolio: user.portfolio,
            },
        });

    } catch (error) {
        console.error('Error al vender criptomoneda:', error.message);
        res.status(500).send('Error del servidor al procesar la venta.');
    }
});

router.delete('/delete-account', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        await user.deleteOne();

        res.status(200).json({ msg: 'Cuenta eliminada exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar la cuenta del usuario:', error.message);
        res.status(500).send('Error del servidor al eliminar la cuenta.');
    }
});


module.exports = router;