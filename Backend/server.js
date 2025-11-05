const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuraciones y middlewares de seguridad
const securityConfig = require('./src/config/security');
const { 
  requestLogger, 
  suspiciousActivityDetector, 
  requestSizeLimiter, 
  contentTypeValidator 
} = require('./src/middleware/logging');

const app = express();

// Configuración de seguridad con Helmet
app.use(helmet(securityConfig.helmet));

// Rate limiting para prevenir ataques de fuerza bruta
const limiter = rateLimit(securityConfig.rateLimit);

// Rate limiting más estricto para endpoints de autenticación
const authLimiter = rateLimit(securityConfig.authRateLimit);

// Middlewares de logging y detección de seguridad
app.use(requestLogger);
app.use(suspiciousActivityDetector);
app.use(requestSizeLimiter);
app.use(contentTypeValidator);

// Configuración CORS más segura
app.use(cors(securityConfig.cors));

// Middlewares de seguridad
app.use(limiter); // Rate limiting general
app.use(express.json({ limit: securityConfig.limits.json })); // Limitar tamaño de JSON
app.use(express.urlencoded({ extended: true, limit: securityConfig.limits.urlencoded }));

// Sanitización básica de headers
app.use((req, res, next) => {
  // Remover headers que pueden exponer información del servidor
  res.removeHeader('X-Powered-By');
  next();
});

// Conexión a MongoDB con configuración de seguridad mejorada
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nom035DB';
mongoose.connect(mongoURI, securityConfig.mongo)
.then(() => console.log(' Conectado a MongoDB'))
.catch(err => {
  console.error(' Error al conectar a MongoDB:', err.message);
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
// Configuración de rutas con rate limiting específico
// ======================

// Aplicar rate limiting específico a rutas de autenticación
app.use('/api/empresas/verify-clave', authLimiter);
app.use('/api/empleados/verify', authLimiter);

// Rutas principales
app.use('/api/empresas', empresaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/trauma', traumaRoutes);
app.use('/api/psicosocial', respuestaRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
    security: 'enabled'
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  
  // No exponer detalles del error en producción
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Error interno del servidor';
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(` Servidor ejecutándose en puerto ${PORT}`);
  console.log(` Medidas de seguridad activadas:`);
  console.log(`   - Rate limiting: `);
  console.log(`   - Helmet: `);
  console.log(`   - CORS: `);
  console.log(`   - Validación de entrada: `);
  console.log(`   - Detección de actividades sospechosas: `);
  console.log(`   - Logging de seguridad: `);
});

// Shutdown graceful
const gracefulShutdown = async () => {
  console.log(' Recibida señal de terminación, cerrando servidor...');
  try {
    await mongoose.connection.close();
    console.log(' Conexión a MongoDB cerrada');
    server.close(() => {
      console.log(' Servidor detenido');
      process.exit(0);
    });
  } catch (error) {
    console.error(' Error al cerrar la conexión:', error);
    server.close(() => {
      console.log(' Servidor detenido');
      process.exit(1);
    });
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);