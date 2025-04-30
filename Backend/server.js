const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración CORS
const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nom035DB';
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
  process.exit(1);
});

// Eventos de conexión
mongoose.connection.on('connected', () => console.log('Mongoose conectado'));
mongoose.connection.on('error', (err) => console.error('Error de Mongoose:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose desconectado'));

// ======================
// Importación de rutas
// ======================
const empresaRoutes = require('./src/routes/empresaRoutes');
const empleadoRoutes = require('./src/routes/empleadoRoutes');
const traumaRoutes = require('./src/routes/traumaRoutes');
const respuestaRoutes = require('./src/routes/respuestaRoutes'); // Archivo unificado

// ======================
// Configuración de rutas
// ======================
app.use('/api/empresas', empresaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/trauma', traumaRoutes);

// Ruta unificada para todos los cuestionarios psicosociales
app.use('/api/psicosocial', respuestaRoutes); // Todas las rutas de formularios aquí

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

// Shutdown graceful
const gracefulShutdown = () => {
  mongoose.connection.close(() => {
    console.log('Conexión a MongoDB cerrada');
    server.close(() => {
      console.log('Servidor detenido');
      process.exit(0);
    });
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);