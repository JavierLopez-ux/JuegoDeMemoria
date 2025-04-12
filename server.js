const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth/authRoutes');
const partidaRoutes = require('./routes/partidaRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const partidaEnCursoRoutes = require('./routes/partidaEnCursoRoutes');
const cors = require('cors');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs'); // Importa bcrypt para hashear la contraseña
const User = require('./models/User'); // Importa el modelo de usuario

// Conexión a MongoDB (usando el servicio de Docker)
mongoose.connect('mongodb://mongo:27017/memorygame')
  .then(() => {
    console.log('Conectado a MongoDB');
    createAdminUser(); // Llama a la función para crear el usuario admin
  })
  .catch((error) => console.log('Error al conectar a MongoDB:', error));

// Middleware para parsear JSON
app.use(express.json());
// Configurar CORS para permitir todas las solicitudes
app.use(cors());

// Servir archivos estáticos desde la carpeta montada en el contenedor
app.use(express.static(path.join(__dirname, 'frontend')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Rutas
app.use('/auth', authRoutes);
app.use('/partida', partidaRoutes);
app.use('/estadisticas', estadisticasRoutes);
app.use('/api/partida-en-curso', partidaEnCursoRoutes);
app.use('/api/partida-en-curso', partidaRoutes);

// Función para crear un usuario administrador por defecto
const createAdminUser = async () => {
  try {
    // Verifica si ya existe un usuario administrador
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Si no existe, crea un nuevo usuario administrador
      const hashedPassword = await bcrypt.hash('admin', 10); // Hashea la contraseña
      const newAdminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await newAdminUser.save();
      console.log('Usuario administrador creado exitosamente');
    } else {
      console.log('Ya existe un usuario administrador');
    }
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error.message);
  }
};

// Iniciar servidor
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});