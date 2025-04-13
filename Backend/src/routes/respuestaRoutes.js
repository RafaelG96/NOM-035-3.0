const express = require('express');
const router = express.Router();
const respuestaController = require('../controllers/respuestaController'); // Importa el controlador completo

// Define las rutas para respuestas
router.post('/', respuestaController.guardarRespuesta);
router.get('/empresa/:empresaId', respuestaController.getRespuestasByEmpresa);

module.exports = router;