const Empresa = require('../models/empresa');
const Respuesta = require('../models/respuesta'); // Asegúrate de tener este modelo
const mongoose = require('mongoose');
const ResultadoPsicosocial = require('../models/resultadoPsicosocial'); // Asegúrate de importar el modelo correcto

// Crear una nueva empresa (modificado para validar muestra representativa)
exports.createEmpresa = async (req, res) => {
    try {
        const { nombreEmpresa, cantidadEmpleados, clave, muestraRepresentativa } = req.body;

        // Validación básica
        if (!nombreEmpresa || !cantidadEmpleados || !clave) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, cantidad de empleados y clave son requeridos'
            });
        }

        const cantidad = parseInt(cantidadEmpleados);
        if (cantidad > 50 && !muestraRepresentativa) {
            return res.status(400).json({
                success: false,
                message: 'Empresas con más de 50 empleados requieren muestra representativa'
            });
        }

        const empresaData = {
            nombreEmpresa: nombreEmpresa.trim(),
            cantidadEmpleados: cantidad,
            clave: clave.trim()
        };

        if (cantidad > 50) {
            empresaData.muestraRepresentativa = parseInt(muestraRepresentativa);
        }

        const nuevaEmpresa = new Empresa(empresaData);
        const empresaGuardada = await nuevaEmpresa.save();

        res.status(201).json({
            success: true,
            data: empresaGuardada,
            message: `Empresa creada con formulario ${empresaGuardada.tipoFormulario}`
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

// Verificar la clave de la empresa (mejorado para incluir info de formulario)
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

        // Verificar límite solo para empresas grandes
        if (empresa.tipoFormulario === 'completo' && empresa.contador >= empresa.muestraRepresentativa) {
            return res.status(403).json({
                success: false,
                message: 'Límite de encuestas alcanzado para esta empresa',
                limiteAlcanzado: true
            });
        }

        // Preparar datos de respuesta
        const responseData = {
            success: true,
            message: 'Acceso autorizado',
            empresaId: empresa._id,
            contadorActual: empresa.contador + 1,
            tipoFormulario: empresa.tipoFormulario,
            preguntasRequeridas: empresa.preguntasRequeridas,
            totalPreguntas: empresa.preguntasRequeridas.length
        };

        // Incrementar contador (pero no esperar para responder)
        empresa.contador += 1;
        empresa.save().catch(err => console.error('Error al actualizar contador:', err));

        res.json(responseData);

    } catch (error) {
        console.error('Error en verifyClave:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener todas las empresas (mejorado para incluir info relevante)
exports.getAllEmpresas = async (req, res) => {
    try {
        const empresas = await Empresa.find({})
            .select('nombreEmpresa _id cantidadEmpleados tipoFormulario contador muestraRepresentativa')
            .sort({ createdAt: -1 })
            .lean();

        // Enriquecer datos para visualización
        const empresasConEstadisticas = empresas.map(empresa => ({
            ...empresa,
            completadas: empresa.contador,
            pendientes: empresa.tipoFormulario === 'completo' ?
                (empresa.muestraRepresentativa - empresa.contador) : 'N/A',
            porcentajeCompletado: empresa.tipoFormulario === 'completo' ?
                Math.round((empresa.contador / empresa.muestraRepresentativa) * 100) : 'N/A'
        }));

        res.status(200).json({
            success: true,
            count: empresas.length,
            data: empresasConEstadisticas
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

// Obtener respuestas por empresa (mejorado para diferenciar tipos)
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

        // Calcular estadísticas diferenciadas
        const estadisticas = {
            totalEncuestas: respuestas.length,
            tipoFormulario: empresa.tipoFormulario,
            ultimaActualizacion: respuestas.length > 0 ?
                respuestas[0].updatedAt || respuestas[0].createdAt : null
        };

        if (respuestas.length > 0) {
            // Calcular promedios diferenciados
            const preguntasComunes = 46;

            estadisticas.puntajeTotal = {
                promedio: Math.round(
                    respuestas.reduce((sum, res) => sum + (res.puntajeTotal || 0), 0) / respuestas.length
                )
            };

            if (empresa.tipoFormulario === 'completo') {
                estadisticas.puntajeCompleto = {
                    promedio: Math.round(
                        respuestas.reduce((sum, res) => sum + (res.puntajeCompleto || 0), 0) / respuestas.length
                    )
                };
            }

            // Nivel de riesgo
            const niveles = respuestas.map(r => r.nivelRiesgo).filter(Boolean);
            if (niveles.length > 0) {
                estadisticas.nivelRiesgo = niveles.reduce((acc, nivel) => {
                    acc[nivel] = (acc[nivel] || 0) + 1;
                    return acc;
                }, {});
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

// Nuevo método para obtener configuración de formulario
exports.getFormConfig = async (req, res) => {
    try {
        const empresaId = req.params.empresaId;

        const empresa = await Empresa.findById(empresaId)
            .select('tipoFormulario preguntasRequeridas cantidadEmpleados muestraRepresentativa contador');

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        res.json({
            success: true,
            data: {
                tipoFormulario: empresa.tipoFormulario,
                totalPreguntas: empresa.preguntasRequeridas.length,
                preguntasRequeridas: empresa.preguntasRequeridas,
                muestraRepresentativa: empresa.muestraRepresentativa,
                encuestasCompletadas: empresa.contador
            }
        });
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Agrega este nuevo método al controlador
exports.getEmpresasConFormularioBasico = async (req, res) => {
    try {
        // Obtener todas las empresas con respuestas en la colección resultadopsicosocials
        const empresasConRespuestas = await ResultadoPsicosocial.distinct('empresaId');

        // Filtrar IDs válidos
        const validIds = empresasConRespuestas.filter(id => mongoose.Types.ObjectId.isValid(id));

        // Validar que haya IDs válidos
        if (!validIds || validIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron empresas con formulario básico.'
            });
        }

        // Filtrar solo empresas con formulario básico
        const empresas = await Empresa.find({
            _id: { $in: validIds },
            tipoFormulario: 'basico'
        }).select('nombreEmpresa cantidadEmpleados _id');

        res.status(200).json({
            success: true,
            data: empresas
        });
    } catch (error) {
        console.error('Error al obtener empresas con formulario básico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empresas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Nuevo método para obtener empresas con formulario completo
exports.getEmpresasConFormularioCompleto = async (req, res) => {
    try {
        // Obtener todas las empresas con respuestas en la colección respuestas
        const empresasConRespuestas = await Respuesta.distinct('empresaId');
        console.log('Empresas con respuestas:', empresasConRespuestas); // Depuración

        // Filtrar IDs válidos y convertirlos a ObjectId
        const validIds = empresasConRespuestas
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id)); // Usar 'new' para instanciar ObjectId
        console.log('IDs válidos:', validIds); // Depuración

        // Validar que haya IDs válidos
        if (!validIds || validIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron empresas con formulario completo.'
            });
        }

        // Filtrar solo empresas con formulario completo
        const empresas = await Empresa.find({
            _id: { $in: validIds },
            tipoFormulario: 'completo'
        }).select('nombreEmpresa cantidadEmpleados _id muestraRepresentativa contador');

        console.log('Empresas encontradas:', empresas); // Depuración

        res.status(200).json({
            success: true,
            data: empresas
        });
    } catch (error) {
        console.error('Error al obtener empresas con formulario completo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empresas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};