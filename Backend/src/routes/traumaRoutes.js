const express = require('express');
const router = express.Router();
const traumaController = require('../controllers/traumaController');

// Ruta para guardar cuestionario de trauma
router.post('/cuestionarios', traumaController.guardarCuestionario);

// Ruta para obtener resultados
router.get('/resultados', traumaController.obtenerResultados);

module.exports = router;