const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'ClaseProgramacionWebI12024IIIP';  // Misma clave secreta

// Registro de usuario
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role: role || 'user' }); // Guarda el rol
        await user.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario', details: error.message });
    }
};

// Listar todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        // Buscar todos los usuarios en la base de datos
        const users = await User.find({}, { password: 0 }); // Excluir el campo "password" por seguridad

        // Verificar si hay usuarios
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios' });
        }

        // Devolver la lista de usuarios
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios', details: error.message });
    }
};
// Actualizar usuario
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar y eliminar el usuario
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario', details: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Agregamos el rol en el payload
        const payload = { 
            id: user._id, 
            username: user.username, 
            email: user.email,
            role: user.role // Incluir el rol en el token
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

        // Devolver el token, el correo electrónico y el nombre de usuario
        res.status(200).json({ 
            token, 
            email: user.email, 
            username: user.username, // Asegúrate de devolver el nombre de usuario
            usuarioId: user._id // Asegúrate de devolver el usuarioId
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor', details: error.message });
    }
};