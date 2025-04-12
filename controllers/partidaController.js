const Partida = require('../models/Partida');
const { actualizarEstadisticas } = require('./estadisticasController');

exports.registrarPartida = async (req, res) => {
    try {
        const { nivel, resultado, tiempo_usado } = req.body;

        // Validar campos requeridos
        if (!nivel || !resultado || tiempo_usado === undefined) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Obtener usuario desde el token JWT
        const usuario = req.user?.id;

        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        // Convertir tiempo_usado a número
        const tiempoUsado = isNaN(tiempo_usado) ? 0 : Number(tiempo_usado);

        // Crear y guardar la partida
        const nuevaPartida = new Partida({
            usuario,
            nivel,
            resultado,
            tiempo_usado: tiempoUsado
        });

        await nuevaPartida.save();

        // Devolver respuesta con el ID de la partida
        res.status(201).json({ 
            message: 'Partida registrada', 
            partidaId: nuevaPartida._id 
        });
    } catch (error) {
        console.error('Error al registrar la partida:', error);
        res.status(500).json({ 
            error: 'Error al registrar la partida',
            details: error.message 
        });
    }
};