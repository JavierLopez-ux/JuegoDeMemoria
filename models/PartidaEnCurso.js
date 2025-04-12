// models/PartidaEnCurso.js
const mongoose = require('mongoose');

const partidaEnCursoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tablero: { type: [String], required: true },
    tiempoLimite: { type: Number, required: true },
    estado: {
        type: String,
        enum: ['en curso', 'finalizada', 'abandonada'],
        default: 'en curso'
    },
    tiempoInicio: { type: Date, default: Date.now },
    paresEncontrados: { type: Number, default: 0 }, // Contador de pares encontrados
    cartasReveladas: { type: [Number], default: [] } // Índices de cartas reveladas
});

module.exports = mongoose.model('PartidaEnCurso', partidaEnCursoSchema);