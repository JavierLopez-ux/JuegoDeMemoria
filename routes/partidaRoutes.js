const express = require('express');
const partidaController = require('../controllers/partidaController');
const { authenticateJWT } = require('../auth/authenticateJWT');


const router = express.Router();

router.post('/registrar', authenticateJWT, partidaController.registrarPartida);

module.exports = router;
