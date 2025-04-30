const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

// Ruta para crear una nueva empresa
router.post('/', empresaController.createEmpresa);
router.get('/', empresaController.getAllEmpresas);

// filtrar empresas por nombre y tipo de formulario
router.get('/con-formulario-basico', empresaController.getEmpresasConFormularioBasico);
router.get('/con-formulario-completo', empresaController.getEmpresasConFormularioCompleto);

// Ruta para verificar la clave de la empresa
router.post('/verify-clave', empresaController.verifyClave);

module.exports = router;