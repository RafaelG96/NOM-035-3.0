const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const { 
  validateEmpresa, 
  validateAuth, 
  handleValidationErrors, 
  sanitizeInput, 
  preventInjection 
} = require('../middleware/validation');

// Middleware de seguridad aplicado a todas las rutas
router.use(sanitizeInput);
router.use(preventInjection);

// Ruta para crear una nueva empresa
router.post('/', validateEmpresa, handleValidationErrors, empresaController.createEmpresa);

// Ruta para verificar la clave de la empresa
router.post('/verify-clave', validateAuth, handleValidationErrors, empresaController.verifyClave);

// Ruta para verificar acceso a resultados
router.post('/verify-acceso-resultados', empresaController.verifyAccesoResultados);

// Ruta para obtener todas las empresas
router.get('/', empresaController.getAllEmpresas);

// Ruta para obtener empresas con formulario completo
router.get('/con-formulario-completo', empresaController.getEmpresasConFormularioCompleto);

// Ruta para obtener respuestas por empresa
router.get('/:empresaId/respuestas', empresaController.getRespuestasByEmpresa);

// Ruta para obtener configuración de formulario
router.get('/:empresaId/config', empresaController.getFormConfig);

// filtrar empresas por nombre y tipo de formulario
router.get('/con-formulario-basico', empresaController.getEmpresasConFormularioBasico);

module.exports = router;