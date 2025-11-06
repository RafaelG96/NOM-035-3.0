const { body, validationResult } = require('express-validator');

// Middleware para validar y sanitizar datos de empresa
const validateEmpresa = [
  body('nombreEmpresa')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-\.]+$/)
    .withMessage('El nombre de la empresa solo puede contener letras, números, espacios, guiones y puntos'),
  
  body('cantidadEmpleados')
    .isInt({ min: 1, max: 10000 })
    .withMessage('La cantidad de empleados debe ser un número entre 1 y 10,000'),
  
  body('clave')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La clave debe tener entre 4 y 20 caracteres')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('La clave solo puede contener letras y números'),
  
  body('muestraRepresentativa')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La muestra representativa debe ser un número entre 1 y 1,000')
];

// Middleware para validar datos de autenticación
const validateAuth = [
  body('nombreEmpresa')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 100 caracteres'),
  
  body('clave')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La clave debe tener entre 4 y 20 caracteres')
];

// Middleware para validar respuestas de formulario
const validateRespuestas = [
  body('empresaId')
    .isMongoId()
    .withMessage('ID de empresa no válido'),
  
  body('preguntas')
    .isObject()
    .withMessage('Las preguntas deben ser un objeto'),
  
  body('servicioClientes')
    .optional()
    .isBoolean()
    .withMessage('servicioClientes debe ser un valor booleano'),
  
  body('esJefe')
    .optional()
    .isBoolean()
    .withMessage('esJefe debe ser un valor booleano')
];

// Middleware para validar respuestas de trauma
// El nombre de empresa es opcional pero recomendado para poder ver los resultados
const validateTrauma = [
  body('empresa')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El nombre de la empresa debe tener entre 1 y 200 caracteres si se proporciona'),
  
  body('respuestas')
    .isArray({ min: 1 })
    .withMessage('Las respuestas deben ser un array no vacío'),
  
  body('respuestas.*.pregunta')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada pregunta debe ser una cadena válida'),
  
  body('respuestas.*.respuesta')
    .isIn(['si', 'no'])
    .withMessage('Cada respuesta debe ser "si" o "no"')
];

// Función para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Middleware para sanitizar datos generales
const sanitizeInput = (req, res, next) => {
  // Sanitizar strings en el body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Sanitizar strings en query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

// Middleware para prevenir ataques de inyección en consultas
const preventInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$lt/gi,
    /\$regex/gi
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (checkValue(obj[key])) {
          return true;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkObject(obj[key])) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Contenido no permitido detectado'
    });
  }
  
  next();
};

module.exports = {
  validateEmpresa,
  validateAuth,
  validateRespuestas,
  validateTrauma,
  handleValidationErrors,
  sanitizeInput,
  preventInjection
}; 