const mongoose = require('mongoose');

const CryptocurrencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, añade el nombre de la criptomoneda'],
        unique: true,
        trim: true
    },
    symbol: {
        type: String,
        required: [true, 'Por favor, añade el símbolo de la criptomoneda'],
        unique: true,
        uppercase: true,
        trim: true
    },
    currentPrice: {
        type: Number,
        default: 0
    },
    priceChange24h: {
        type: Number,
        default: 0
    },
    marketCap: {
        type: Number,
        default: 0
    },
    totalVolume: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Índice para asegurar búsquedas rápidas por nombre o símbolo
CryptocurrencySchema.index({ name: 1, symbol: 1 });

module.exports = mongoose.model('Cryptocurrency', CryptocurrencySchema);