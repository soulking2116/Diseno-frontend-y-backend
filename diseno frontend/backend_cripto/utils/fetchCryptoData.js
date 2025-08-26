const axios = require('axios');
const Cryptocurrency = require('../models/Cryptocurrency');

const fetchCryptoData = async () => {
    try {
        console.log('Iniciando la obtención de datos de criptomonedas...'); // Mensaje de inicio de la función
        // URL de la API de CoinGecko para obtener los 100 principales mercados
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd', // Moneda de comparación (dólares)
                order: 'market_cap_desc', // Ordenar por capitalización de mercado descendente
                per_page: 100, // Número de resultados por página
                page: 1, // Página 1
                sparkline: false
            }
        });

        // --- LÍNEA DE DEBUGGING CRÍTICA AÑADIDA ---
        if (response.data && response.data.length > 0) {
            console.log('Datos recibidos de CoinGecko (primeros 5 elementos):', response.data.slice(0, 5));
        } else {
            console.log('Datos recibidos de CoinGecko: El array está vacío o la respuesta no tiene datos.');
        }
        // --- FIN DE LÍNEA DE DEBUGGING ---

        const cryptos = response.data;
        let updatedCount = 0;
        let createdCount = 0;
        let duplicateCount = 0; // Contador para duplicados

        await Cryptocurrency.deleteMany({});
        console.log('Colección de criptomonedas limpiada.');


        for (const cryptoData of cryptos) {
            try {
                // Buscar la criptomoneda por su símbolo
                let crypto = await Cryptocurrency.findOne({ symbol: cryptoData.symbol.toUpperCase() });

                if (crypto) {
                    // Si existe, actualizar sus datos
                    crypto.currentPrice = cryptoData.current_price;
                    crypto.priceChange24h = cryptoData.price_change_percentage_24h;
                    crypto.marketCap = cryptoData.market_cap;
                    crypto.totalVolume = cryptoData.total_volume;
                    crypto.lastUpdated = new Date(); // Actualizar la marca de tiempo

                    await crypto.save();
                    updatedCount++;
                } else {

                    const { id, ...dataToSave } = cryptoData; 
                    
                    crypto = new Cryptocurrency({
                        name: dataToSave.name,
                        symbol: dataToSave.symbol.toUpperCase(),
                        currentPrice: dataToSave.current_price,
                        priceChange24h: dataToSave.price_change_percentage_24h,
                        marketCap: dataToSave.market_cap,
                        totalVolume: dataToSave.total_volume,
                        lastUpdated: new Date()
                    });
                    await crypto.save();
                    createdCount++;
                }
            } catch (saveError) {
                // Manejar errores específicos al guardar, como duplicados si no se limpió la colección
                if (saveError.code === 11000) { // Código de error de duplicado de MongoDB
                    duplicateCount++;
                } else {
                    console.error('Error al guardar criptomoneda:', saveError.message);
                }
            }
        }
        console.log(`Datos de criptomonedas procesados: ${createdCount} creadas, ${updatedCount} actualizadas, ${duplicateCount} duplicados saltados.`);
    } catch (error) {
        console.error('Error al obtener o guardar datos de criptomonedas:', error.message);
        if (error.response) {
            // Error de respuesta de la API (ej. 404, 500, 429 Too Many Requests)
            console.error('Estado de error de la API:', error.response.status); //
            console.error('Datos de error de la API:', error.response.data);    //
            console.error('Cabeceras de error de la API (si disponibles):', error.response.headers); //
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta (ej. problema de red o CORS)
            console.error('No se recibió respuesta de la API. Puede ser un problema de red o CORS:', error.request);
        } else {
            // Algo más causó el error al configurar la solicitud
            console.error('Error al configurar la solicitud:', error.message);
        }
    }
};

module.exports = fetchCryptoData;