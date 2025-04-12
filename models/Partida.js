const mongoose = require('mongoose');

const partidaSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nivel: { type: String, required: true },
    resultado: { type: String, required: true, default: 'pendiente' }, // Valor por defecto
    tiempo_usado: { type: Number, required: true, default: 0 } // Valor por defecto
});

module.exports = mongoose.model('Partida', partidaSchema)
