const Empresa = require('../models/empresa');

// Crear una nueva empresa
exports.createEmpresa = async (req, res) => {
    try {
        const { nombreEmpresa, cantidadEmpleados, clave } = req.body;
        
        // Validación básica
        if (!nombreEmpresa || !cantidadEmpleados || !clave) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, cantidad de empleados y clave son requeridos'
            });
        }

        // Preparar datos
        const empresaData = {
            nombreEmpresa: nombreEmpresa.trim(),
            cantidadEmpleados: parseInt(cantidadEmpleados),
            clave: clave.trim()
        };

        // Solo agregar muestra si es empresa grande
        if (empresaData.cantidadEmpleados > 50) {
            empresaData.muestraRepresentativa = req.body.muestraRepresentativa;
        }

        const nuevaEmpresa = new Empresa(empresaData);
        const empresaGuardada = await nuevaEmpresa.save();
        
        res.status(201).json({
            success: true,
            data: empresaGuardada
        });

    } catch (error) {
        console.error('Error al crear empresa:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear la empresa',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// Verificar la clave de la empresa
exports.verifyClave = async (req, res) => {
    try {
        const { nombreEmpresa, clave } = req.body;
        
        if (!nombreEmpresa || !clave) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y clave son requeridos'
            });
        }

        const empresa = await Empresa.findOne({ 
            nombreEmpresa: nombreEmpresa.trim(), 
            clave: clave.trim() 
        });
        
        if (!empresa) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Solo verificar límite para empresas grandes
        if (empresa.tipoFormulario === 'completo' && empresa.contador >= empresa.muestraRepresentativa) {
            return res.status(403).json({
                success: false,
                message: 'Límite de encuestas alcanzado'
            });
        }

        // Incrementar contador
        empresa.contador += 1;
        await empresa.save();

        res.json({
            success: true,
            message: 'Acceso autorizado',
            empresaId: empresa._id,
            contadorActual: empresa.contador,
            tipoFormulario: empresa.tipoFormulario
        });

    } catch (error) {
        console.error('Error en verifyClave:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener todas las empresas
exports.getAllEmpresas = async (req, res) => {
    try {
        const empresas = await Empresa.find({})
            .select('nombreEmpresa _id cantidadEmpleados tipoFormulario contador muestraRepresentativa')
            .lean();
        
        res.status(200).json({
            success: true,
            count: empresas.length,
            data: empresas
        });
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empresas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener respuestas por empresa
exports.getRespuestasByEmpresa = async (req, res) => {
    try {
        const empresaId = req.params.empresaId;
        
        if (!mongoose.Types.ObjectId.isValid(empresaId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de empresa no válido'
            });
        }

        const empresa = await Empresa.findById(empresaId);
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        const respuestas = await Respuesta.find({ empresaId })
            .sort({ createdAt: -1 })
            .lean();

        // Calcular estadísticas
        const estadisticas = {
            totalEncuestas: respuestas.length,
            ultimaActualizacion: respuestas.length > 0 ? 
                respuestas[0].updatedAt || respuestas[0].createdAt : null
        };

        if (respuestas.length > 0) {
            estadisticas.puntajePromedio = Math.round(
                respuestas.reduce((sum, res) => sum + (res.puntajeTotal || 0), 0) / respuestas.length
            );
            
            const niveles = respuestas.map(r => r.nivelRiesgo).filter(Boolean);
            if (niveles.length > 0) {
                const conteoNiveles = niveles.reduce((acc, nivel) => {
                    acc[nivel] = (acc[nivel] || 0) + 1;
                    return acc;
                }, {});
                estadisticas.nivelRiesgo = Object.keys(conteoNiveles).reduce((a, b) => 
                    conteoNiveles[a] > conteoNiveles[b] ? a : b
                );
            }
        }

        res.json({
            success: true,
            data: {
                empresa,
                respuestas,
                estadisticas
            }
        });

    } catch (error) {
        console.error('Error al obtener respuestas:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};