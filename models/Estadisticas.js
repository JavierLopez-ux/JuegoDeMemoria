const mongoose = require('mongoose');

const estadisticasSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partidas_jugadas: { type: Number, default: 0 },
    victorias: { type: Number, default: 0 },
    derrotas: { type: Number, default: 0 }, // Nuevo campo
    abandonos: { type: Number, default: 0 }, // Nuevo campo
    tiempo_total: { type: Number, default: 0 }
});

module.exports = mongoose.model('Estadisticas', estadisticasSchema);

