const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'ClaseProgramacionWebI12024IIIP';

// Middleware para verificar JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrae solo el token

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado, no se proporcionó token' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token no válido o expirado' });
        }
        req.user = user;  // Guarda los datos del usuario (incluido el rol) en `req.user`
        next();
    });
};

module.exports = { authenticateJWT };

