const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Para encriptar contraseñas

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        // Eliminado: required: [true, 'Por favor, añade un nombre de usuario'],
        // Eliminado: unique: true, // Si ya no es único, consider si quiero permitir duplicados o quitar el campo.
        trim: true,
        maxlength: [50, 'El nombre de usuario no puede tener más de 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Por favor, añade un email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Por favor, usa un email válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'Por favor, añade una contraseña'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No devolver la contraseña en las consultas por defecto
    },
    balance: {
        type: Number,
        default: 0, 
        min: 0 // 
    },
    portfolio: [ 
        {
            cryptoId: { // Referencia al ID de la criptomoneda en la colección de Cryptocurrencies
                type: mongoose.Schema.ObjectId,
                ref: 'Cryptocurrency',
                required: true
            },
            symbol: { // Símbolo de la criptomoneda (ej. BTC, ETH)
                type: String,
                required: true,
                uppercase: true
            },
            quantity: { // Cantidad de la criptomoneda que posee el usuario
                type: Number,
                required: true,
                default: 0,
                min: 0 // La cantidad no puede ser negativa
            },
            purchasePrice: { // Precio promedio de compra (opcional, para calcular ganancias/pérdidas)
                type: Number,
                default: 0,
                min: 0
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encriptar contraseña usando bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Solo encriptar si la contraseña ha sido modificada
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparar contraseña ingresada con la contraseña hasheada en la base de datos
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);