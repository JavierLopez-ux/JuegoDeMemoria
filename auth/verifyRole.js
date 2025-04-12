// auth/verifyRole.js
const verifyRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;  // Obtiene el rol del usuario desde el JWT decodificado
        if (!roles.includes(userRole)) {
            return res.status(403).json({ error: 'Acceso denegado, no tienes los permisos necesarios' });
        }
        next();
    };
};

module.exports = { verifyRole };
