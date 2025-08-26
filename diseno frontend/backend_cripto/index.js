    // Cargar las variables de entorno del archivo .env
    require('dotenv').config();

    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const fetchCryptoData = require('./utils/fetchCryptoData'); // Importa la función para obtener datos de criptomonedas

    // Inicializar la aplicación Express
    const app = express();

    // Middlewares
    app.use(cors());
    app.use(express.json()); // Para que Express entienda el formato JSON en las solicitudes

    // Importar rutas
    const userRoutes = require('./routes/userRoutes');
    const cryptoRoutes = require('./routes/cryptoRoutes');

    // Usar rutas
    app.use('/api/users', userRoutes);
    app.use('/api/cryptos', cryptoRoutes);

    // Definir el puerto
    const PORT = process.env.PORT || 5001; 

    // Conexión a MongoDB y arranque del servidor
    const connectDBAndStartServer = async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Conectado a MongoDB Atlas');

            await fetchCryptoData(); // Ejecutar la función para obtener datos de criptomonedas

            setInterval(fetchCryptoData, 10 * 60 * 1000);

            // Inicia el servidor Express SÓLO DESPUÉS de que la conexión a la base de datos
            // sea exitosa y los datos iniciales de criptomonedas se hayan intentado obtener.
            if (require.main === module) {
                app.listen(PORT, () => {
                    console.log(`Servidor Express ejecutándose en el puerto ${PORT}`);
                });
            }

        } catch (err) {
            console.error(`Error al conectar a MongoDB Atlas o al iniciar datos: ${err.message}`);
            process.exit(1);
        }
    };

    connectDBAndStartServer();

    app.get('/', (req, res) => {
        res.send('¡API de Criptomonedas funcionando!');
    });

    module.exports = app;