const Estadisticas = require('../models/Estadisticas');




// Obtener estadísticas de un usuario
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Validar que el ID del usuario esté presente
        if (!usuarioId) {
            return res.status(400).json({ error: 'El ID de usuario es requerido' });
        }

        // Buscar todas las estadísticas del usuario y poblar el campo "usuario"
        const estadisticas = await Estadisticas.find({ usuario: usuarioId })
            .populate('usuario', 'username'); // Poblar el campo "usuario" con el nombre de usuario

        // Devolver un array vacío si no hay estadísticas
        if (!estadisticas || estadisticas.length === 0) {
            return res.status(200).json([]); // Devuelve un array vacío con código 200
        }

        // Devolver las estadísticas encontradas
        res.status(200).json(estadisticas);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener las estadísticas', 
            details: error.message 
        });
    }
};
// Obtener todas las estadísticas con el nombre del usuario
exports.obtenerTodasLasEstadisticas = async (req, res) => {
    try {
        const todasLasEstadisticas = await Estadisticas.find()
            .populate('usuario', 'username'); // Obtener solo el nombre del usuario

        // Devuelve un array vacío si no hay estadísticas
        res.status(200).json(todasLasEstadisticas || []);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener todas las estadísticas', details: error.message });
    }
};

// Obtener todas las estadísticas con el nombre del usuario
exports.obtenerTodasLasEstadisticas = async (req, res) => {
    try {
        const todasLasEstadisticas = await Estadisticas.find()
            .populate('usuario', 'username'); // Obtener solo el nombre del usuario

        // Devuelve un array vacío si no hay estadísticas
        res.status(200).json(todasLasEstadisticas || []);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener todas las estadísticas', details: error.message });
    }
};

exports.actualizarEstadisticas = async (req, res) => {
    try {
        const { usuario, tiempo_usado, victoria, derrota, abandono } = req.body;

        // Validación 1: tiempo_usado debe ser un número válido y mayor que 0
        if (isNaN(tiempo_usado) || tiempo_usado <= 0) {
            throw new Error('El tiempo_usado no es un número válido o es menor o igual a 0.');
        }

        // Validación 2: partidas_jugadas no debe ser 0 (aunque siempre se establece en 1, es buena práctica validarlo)
        const partidas_jugadas = 1; // Siempre se establece en 1 en tu lógica actual
        if (partidas_jugadas <= 0) {
            throw new Error('El valor de partidas_jugadas no puede ser 0 o negativo.');
        }

        // Buscar si ya existe un registro reciente para el mismo usuario
        const estadisticaExistente = await Estadisticas.findOne({
            usuario,
            victoria,
            derrota,
            abandono,
            tiempo_total: tiempo_usado
        });

        if (estadisticaExistente) {
            return res.status(409).json({ error: 'Registro de estadísticas duplicado, no se creará otro.' });
        }

        // Crear un nuevo registro de estadísticas
        const nuevaEstadistica = new Estadisticas({ 
            usuario, 
            tiempo_total: tiempo_usado, 
            partidas_jugadas: partidas_jugadas, 
            victorias: victoria ? 1 : 0, 
            derrotas: derrota ? 1 : 0, 
            abandonos: abandono ? 1 : 0 
        });

        await nuevaEstadistica.save();
        res.status(200).json({ message: 'Nuevo registro de estadísticas creado', estadisticas: nuevaEstadistica });

    } catch (error) {
        console.error('Error al crear nuevo registro de estadísticas:', error);
        res.status(500).json({ error: error.message || 'Error al crear nuevo registro de estadísticas' });
    }
};



// Eliminar estadísticas de un usuario
exports.eliminarEstadisticas = async (req, res) => {
    try {
        const { id } = req.params; // ID de las estadísticas a eliminar

        const estadisticas = await Estadisticas.findByIdAndDelete(id);

        if (!estadisticas) {
            return res.status(404).json({ message: 'No se encontraron estadísticas para eliminar' });
        }

        res.status(200).json({ message: 'Estadísticas eliminadas correctamente' });
    } catch (error) {
        console.error('Error al eliminar estadísticas:', error);
        res.status(500).json({ error: 'Error al eliminar estadísticas', details: error.message });
    }
};

// Obtener totales de estadísticas
exports.obtenerTotalesEstadisticas = async (req, res) => {
    try {
        // Agrupar las estadísticas por usuario y sumar los campos
        const estadisticasAgrupadas = await Estadisticas.aggregate([
            {
                $group: {
                    _id: "$usuario", // Agrupar por el campo "usuario"
                    totalVictorias: { $sum: "$victorias" },
                    totalDerrotas: { $sum: "$derrotas" },
                    totalPartidasJugadas: { $sum: "$partidas_jugadas" },
                    totalAbandonos: { $sum: "$abandonos" },
                    totalTiempoTotal: { $sum: "$tiempo_total" }
                }
            },
            {
                $lookup: {
                    from: "users", // Nombre de la colección de usuarios
                    localField: "_id",
                    foreignField: "_id",
                    as: "usuarioInfo"
                }
            },
            {
                $unwind: "$usuarioInfo" // Descomponer el array de usuarioInfo
            },
            {
                $project: {
                    usuario: "$usuarioInfo.username", // Mostrar el nombre de usuario
                    totalVictorias: 1,
                    totalDerrotas: 1,
                    totalPartidasJugadas: 1,
                    totalAbandonos: 1,
                    totalTiempoTotal: 1
                }
            }
        ]);

        // Devolver los totales agrupados por usuario
        res.status(200).json(estadisticasAgrupadas);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener los totales de estadísticas', 
            details: error.message 
        });
    }
};