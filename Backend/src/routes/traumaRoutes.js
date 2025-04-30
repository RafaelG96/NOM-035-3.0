const express = require('express');
const router = express.Router();
const traumaController = require('../controllers/traumaController');

// Ruta para obtener empresas únicas
router.get('/empresas', traumaController.obtenerEmpresas);

// Otras rutas existentes
router.post('/guardar', traumaController.guardarCuestionario);
router.get('/resultados', traumaController.obtenerResultados);

module.exports = router;