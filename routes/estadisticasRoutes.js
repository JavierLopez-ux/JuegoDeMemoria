const express = require('express');
const { authenticateJWT } = require('../auth/authenticateJWT');
const estadisticasController = require('../controllers/estadisticasController');

const router = express.Router();

// Obtener estadísticas de un usuario

router.get('/:usuarioId', estadisticasController.obtenerEstadisticas);
// Obtener todas las estadísticas
router.get('/', authenticateJWT, estadisticasController.obtenerTodasLasEstadisticas);

// Actualizar estadísticas de un usuario
router.post('/actualizar', authenticateJWT, estadisticasController.actualizarEstadisticas);

// Eliminar estadísticas de un usuario
router.delete('/:id', authenticateJWT, estadisticasController.eliminarEstadisticas);

// Obtener totales de estadísticas
router.get('/totales/estadisticas', estadisticasController.obtenerTotalesEstadisticas);
module.exports = router;