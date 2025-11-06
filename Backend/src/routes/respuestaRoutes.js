const express = require('express');
const router = express.Router();

// Importar controladores para Formulario #2 (Psicosocial-Trabajo)
const trabajoController = require('../controllers/psicosocialController');

// Importar controladores para Formulario #3 (Psicosocial-Entorno)
const entornoController = require('../controllers/respuestaController');

// Importar middlewares de validación
const { 
  validateRespuestas, 
  handleValidationErrors, 
  sanitizeInput, 
  preventInjection 
} = require('../middleware/validation');

// Importar middleware de autenticación para resultados
const { verificarAccesoPorEmpresaId } = require('../middleware/resultadosAuth');

// Middleware de seguridad aplicado a todas las rutas
router.use(sanitizeInput);
router.use(preventInjection);

// =============================================
// Middleware para validar empresaId
// =============================================
router.param('empresaId', (req, res, next, empresaId) => {
  if (!require('mongoose').Types.ObjectId.isValid(empresaId)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID de empresa no válido' 
    });
  }
  next();
});

// =============================================
// Rutas para Formulario #2 (Psicosocial-Trabajo)
// =============================================
router.post('/trabajo', validateRespuestas, handleValidationErrors, trabajoController.guardarRespuesta);
// Proteger ruta de resultados con autenticación
router.get('/trabajo/empresa/:empresaId', verificarAccesoPorEmpresaId, trabajoController.obtenerResultados);

// =============================================
// Rutas para Formulario #3 (Psicosocial-Entorno)
// =============================================
router.post('/entorno', validateRespuestas, handleValidationErrors, entornoController.guardarRespuesta);
// Proteger ruta de resultados con autenticación
router.get('/entorno/empresa/:empresaId', verificarAccesoPorEmpresaId, entornoController.getRespuestasByEmpresa);

module.exports = router;