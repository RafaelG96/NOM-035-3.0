const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración mejorada de CORS
const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Ambos posibles orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions)); // Aplicar configuración CORS una sola vez
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Conexión a MongoDB con configuración mejorada
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nom035DB';
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000, // Tiempo de espera para conexión
  socketTimeoutMS: 45000, // Tiempo de espera para operaciones
  maxPoolSize: 10, // Número máximo de conexiones en el pool
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
  process.exit(1); // Salir si no hay conexión a la DB
});

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a la DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

// Importar rutas de ambos cuestionarios
const respuestaRoutes = require('./src/routes/respuestaRoutes'); // Rutas del cuestionario existente
const empresaRoutes = require('./src/routes/empresaRoutes');    // Rutas del cuestionario existente
const traumaRoutes = require('./src/routes/traumaRoutes');      // Nuevas rutas para cuestionario traumático
const empleadoRoutes = require('./src/routes/empleadoRoutes'); //nueva ruta para verificacion

// Configuración de rutas
app.use('/api/empresas', empresaRoutes);         // Rutas existentes
app.use('/api/respuestas', respuestaRoutes);     // Rutas existentes
app.use('/api/trauma', traumaRoutes);           // Nuevas rutas para cuestionario traumático
app.use('/api/empleados', empleadoRoutes); //nueva ruta para verificacion

// Ruta de verificación de salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// Middleware para manejar errores 404
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint no encontrado' 
  });
});

// Middleware para manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Base de datos: ${mongoURI}`);
});

// Manejo de cierre adecuado
const gracefulShutdown = () => {
  mongoose.connection.close(() => {
    console.log('Mongoose desconectado por terminación de la aplicación');
    server.close(() => {
      console.log('Servidor cerrado');
      process.exit(0);
    });
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);