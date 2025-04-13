const express = require('express');
const router = express.Router();
const Empresa = require('../models/empresa');

// Autenticación simplificada - solo verifica credenciales
router.post('/login', async (req, res) => {
    try {
        const { nombreEmpresa, claveAcceso } = req.body;

        // Validación básica de entrada
        if (!nombreEmpresa || !claveAcceso) {
            return res.status(400).json({
                success: false,
                error: 'Nombre de empresa y clave son requeridos'
            });
        }

        // Buscar la empresa
        const empresa = await Empresa.findOne({ 
            nombreEmpresa: nombreEmpresa.trim(),
            clave: claveAcceso.trim()
        });

        if (!empresa) {
            return res.status(401).json({ 
                success: false, 
                error: 'Credenciales inválidas' 
            });
        }

        // Incrementar el contador de accesos
        empresa.contador += 1;
        await empresa.save();

        // Respuesta exitosa con datos necesarios para la redirección
        res.json({
            success: true,
            empresa: {
                nombre: empresa.nombreEmpresa,
                cantidadEmpleados: empresa.cantidadEmpleados,
                tipoFormulario: empresa.tipoFormulario
            }
        });

    } catch (error) {
        console.error('Error en login de empleado:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error en el servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;