const express = require('express');
const authController = require('./authController');
const { authenticateJWT } = require('./authenticateJWT');
const { verifyRole } = require('./verifyRole');  // Importa el middleware de verificación de roles



const router = express.Router();
router.get('/users', authController.getUsers); // Obtener todos los usuarios
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/update/:id', authenticateJWT, verifyRole(['admin']), authController.updateUser);  // Solo admin puede actualizar
router.delete('/delete/:id', authenticateJWT, verifyRole(['admin']), authController.deleteUser); // Solo admin puede eliminar

module.exports = router;
