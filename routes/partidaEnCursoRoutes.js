const express = require('express');
const { iniciarPartida, intentar, finalizarPartida, abandonarPartida } = require('../controllers/partidaEnCursoController');
const { authenticateJWT } = require('../auth/authenticateJWT');

const router = express.Router();

router.post('/iniciar', authenticateJWT, iniciarPartida); // Iniciar partida
router.post('/intentar', authenticateJWT, intentar); // Intento de revelar cartas
router.post('/finalizar', authenticateJWT, finalizarPartida); // Finalizar partida
router.post('/abandonar', authenticateJWT, abandonarPartida); // Abandonar partida

module.exports = router;