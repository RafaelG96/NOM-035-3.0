// Configuraciones de seguridad para la aplicación

const securityConfig = {
  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
      error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos'
    }
  },
  
  // Rate limiting para autenticación
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de autenticación
    message: {
      error: 'Demasiados intentos de acceso, intenta de nuevo en 15 minutos'
    }
  },
  
  // Configuración de CORS
  cors: {
    origin: [
      'http://localhost:5500',      // Frontend HTML original (Live Server)
      'http://127.0.0.1:5500',
      'http://localhost:5173',       // Frontend React (Vite dev server - puerto por defecto)
      'http://127.0.0.1:5173',
      'http://localhost:5174',       // Frontend React (Vite dev server - puerto alternativo)
      'http://127.0.0.1:5174'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'x-empresa-nombre',
      'x-codigo-acceso',
      'X-Empresa-Nombre',
      'X-Codigo-Acceso'
    ],
    exposedHeaders: ['x-empresa-nombre', 'x-codigo-acceso'],
    credentials: true,
    maxAge: 86400 // 24 horas
  },
  
  // Configuración de Helmet
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  },
  
  // Configuración de MongoDB
  mongo: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
    connectTimeoutMS: 10000,
    serverApi: {
      version: '1',
      deprecationErrors: true,
    }
  },
  
  // Límites de tamaño de archivos
  limits: {
    json: '10mb',
    urlencoded: '10mb'
  },
  
  // Configuración de validación
  validation: {
    empresa: {
      nombreMinLength: 2,
      nombreMaxLength: 100,
      empleadosMin: 1,
      empleadosMax: 10000,
      claveMinLength: 4,
      claveMaxLength: 20
    },
    respuestas: {
      maxPreguntas: 100,
      maxRespuestaLength: 50
    }
  },
  
  // Configuración de logs
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    excludePaths: ['/api/health', '/favicon.ico']
  }
};

module.exports = securityConfig;