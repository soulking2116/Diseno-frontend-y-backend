const express = require('express');
const router = express.Router();
const Cryptocurrency = require('../models/Cryptocurrency');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const cryptos = await Cryptocurrency.find(); // Obtener todas las criptomonedas de la BD
        res.status(200).json({ success: true, count: cryptos.length, data: cryptos });
    } catch (error) {
        console.error('Error en GET /api/cryptos:', error.message);
        res.status(500).send('Error del servidor');
    }
});

router.get('/:symbol', protect, async (req, res) => { // <-- CAMBIADO DE :id A :symbol
    // --- CONSOLE.LOGS DE DEPURACIÓN CRUCIALES ---
    console.log('--- Solicitud GET /api/cryptos/:symbol RECIBIDA EN LA RUTA ---');
    console.log('Símbolo recibido en req.params.symbol:', req.params.symbol);
    // --- FIN DE CONSOLE.LOGS ---

    try {
        // Buscar la criptomoneda por su SÍMBOLO (asegurando que sea mayúsculas)
        const crypto = await Cryptocurrency.findOne({ symbol: req.params.symbol.toUpperCase() }); // <-- BUSCA POR SÍMBOLO

        console.log('Resultado de Cryptocurrency.findOne por símbolo:', crypto); // Qué devuelve la búsqueda en la DB

        if (!crypto) {
            console.log('Criptomoneda NO encontrada para el SÍMBOLO:', req.params.symbol); // Si no se encontró
            return res.status(404).json({ success: false, msg: `Criptomoneda con símbolo '${req.params.symbol}' no encontrada.` });
        }

        console.log('Criptomoneda ENCONTRADA:', crypto.name, crypto.symbol); // Si se encontró
        res.status(200).json({ success: true, data: crypto });
    } catch (error) {
        console.error('Error en la ruta GET /api/cryptos/:symbol:', error.message); // Error general en la ruta
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;