const Empresa = require('../models/empresa');
const Respuesta = require('../models/respuesta'); // Asegúrate de tener este modelo
const mongoose = require('mongoose');
const ResultadoPsicosocial = require('../models/resultadoPsicosocial'); // Asegúrate de importar el modelo correcto

// Crear una nueva empresa (modificado para validar muestra representativa)
exports.createEmpresa = async (req, res) => {
    try {
        const { nombreEmpresa, cantidadEmpleados, clave, codigoAccesoResultados, muestraRepresentativa } = req.body;

        // Validación básica
        if (!nombreEmpresa || !cantidadEmpleados || !clave || !codigoAccesoResultados) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, cantidad de empleados, clave y código de acceso a resultados son requeridos'
            });
        }

        const cantidad = parseInt(cantidadEmpleados);
        
        // Validar que la cantidad sea válida
        if (isNaN(cantidad) || cantidad < 1) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad de empleados debe ser un número mayor a 0'
            });
        }

        // El tipoFormulario se asigna automáticamente en el modelo según cantidadEmpleados
        // No aceptamos tipoFormulario del frontend para evitar inconsistencias
        const empresaData = {
            nombreEmpresa: nombreEmpresa.trim(),
            cantidadEmpleados: cantidad,
            clave: clave.trim(),
            codigoAccesoResultados: codigoAccesoResultados.trim()
        };

        // Para empresas con más de 50 empleados, se requiere muestra representativa
        if (cantidad > 50) {
            if (!muestraRepresentativa) {
                return res.status(400).json({
                    success: false,
                    message: 'Empresas con más de 50 empleados requieren muestra representativa'
                });
            }
            const muestra = parseInt(muestraRepresentativa);
            if (isNaN(muestra) || muestra < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'La muestra representativa debe ser un número mayor a 0'
                });
            }
            empresaData.muestraRepresentativa = muestra;
        }

        // Crear la empresa - el modelo asignará automáticamente:
        // - tipoFormulario: 'completo' si cantidadEmpleados > 50, 'basico' si <= 50
        // - preguntasRequeridas: 76 preguntas para completo, 46 para básico
        const nuevaEmpresa = new Empresa(empresaData);
        const empresaGuardada = await nuevaEmpresa.save();

        console.log(`✅ Empresa creada: ${empresaGuardada.nombreEmpresa} - Tipo: ${empresaGuardada.tipoFormulario} - Empleados: ${empresaGuardada.cantidadEmpleados}`);

        res.status(201).json({
            success: true,
            data: empresaGuardada,
            message: `Empresa creada con formulario ${empresaGuardada.tipoFormulario} (${empresaGuardada.cantidadEmpleados} empleados)`
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
// Modificado para obtener empresas con formulario básico (1-50 empleados) y al menos 1 formulario resuelto
exports.getEmpresasConFormularioBasico = async (req, res) => {
    try {
        // Buscar empresas con formulario básico (1-50 empleados) que tengan al menos 1 formulario resuelto
        const empresas = await Empresa.find({
            $or: [
                { tipoFormulario: 'basico' },
                { 
                    cantidadEmpleados: { $lte: 50 },
                    tipoFormulario: { $exists: false } // Si no tiene tipoFormulario pero tiene <=50 empleados, incluirla
                }
            ],
            contador: { $gte: 1 } // Al menos 1 formulario resuelto
        })
        .select('nombreEmpresa cantidadEmpleados _id contador tipoFormulario')
        .sort({ nombreEmpresa: 1, cantidadEmpleados: 1 })
        .lean();

        console.log('Empresas con formulario básico y al menos 1 formulario resuelto:', empresas); // Depuración

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
// Modificado para obtener empresas con formulario completo (51+ empleados) que tengan al menos 1 formulario resuelto
exports.getEmpresasConFormularioCompleto = async (req, res) => {
    try {
        // Primero, obtener empresas con formulario completo (51+ empleados)
        const todasLasEmpresas = await Empresa.find({
            tipoFormulario: 'completo'
        })
        .select('nombreEmpresa cantidadEmpleados _id muestraRepresentativa contador tipoFormulario')
        .lean();

        // Obtener todos los empresaIds únicos que tienen respuestas en la colección 'respuestas'
        const empresasConRespuestas = await Respuesta.distinct('empresaId');
        console.log('Empresas IDs con respuestas guardadas:', empresasConRespuestas.map(id => String(id)));

        // Filtrar empresas que tienen respuestas guardadas
        const empresasFiltradas = todasLasEmpresas.filter(empresa => {
            const empresaIdStr = String(empresa._id);
            const tieneRespuestas = empresasConRespuestas.some(id => String(id) === empresaIdStr);
            console.log(`Empresa ${empresa.nombreEmpresa} (${empresaIdStr}): ${tieneRespuestas ? 'TIENE' : 'NO tiene'} respuestas`);
            return tieneRespuestas;
        });

        // Ordenar por nombre
        empresasFiltradas.sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa));

        console.log(`Empresas con formulario completo y respuestas: ${empresasFiltradas.length}`);
        empresasFiltradas.forEach(emp => {
            console.log(`  - ${emp.nombreEmpresa} (ID: ${emp._id}, Empleados: ${emp.cantidadEmpleados})`);
        });

        res.status(200).json({
            success: true,
            data: empresasFiltradas
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

// Autenticación para acceso a resultados
exports.verifyAccesoResultados = async (req, res) => {
    try {
        const { nombreEmpresa, codigoAccesoResultados } = req.body;

        if (!nombreEmpresa || !codigoAccesoResultados) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de empresa y código de acceso son requeridos'
            });
        }

        const empresa = await Empresa.findOne({
            nombreEmpresa: nombreEmpresa.trim(),
            codigoAccesoResultados: codigoAccesoResultados.trim()
        });

        if (!empresa) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas para acceso a resultados'
            });
        }

        // Devolver solo el ID de la empresa (sin información sensible)
        res.json({
            success: true,
            message: 'Acceso autorizado a resultados',
            empresaId: empresa._id,
            nombreEmpresa: empresa.nombreEmpresa
        });

    } catch (error) {
        console.error('Error en verifyAccesoResultados:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware para verificar acceso a resultados
exports.verificarAccesoResultados = async (req, res, next) => {
    try {
        const { nombreEmpresa, codigoAccesoResultados } = req.body;

        if (!nombreEmpresa || !codigoAccesoResultados) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de empresa y código de acceso son requeridos'
            });
        }

        const empresa = await Empresa.findOne({
            nombreEmpresa: nombreEmpresa.trim(),
            codigoAccesoResultados: codigoAccesoResultados.trim()
        });

        if (!empresa) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas para acceso a resultados'
            });
        }

        // Agregar empresaId a la petición para usar en los controladores
        req.empresaAutenticada = {
            empresaId: empresa._id,
            nombreEmpresa: empresa.nombreEmpresa
        };

        next();
    } catch (error) {
        console.error('Error en verificarAccesoResultados:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.someFunction = async (req, res) => {
    try {
        const empresaId = req.params.empresaId;

        // Buscar la empresa por su ID
        const empresa = await Empresa.findById(empresaId);

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Guardar la cantidad de empleados y la muestra representativa en variables
        const cantidadEmpleados = empresa.cantidadEmpleados;
        const muestraRepresentativa = empresa.muestraRepresentativa;

        // Usar las variables en tu lógica
        if (cantidadEmpleados > 50) {
            console.log(`La empresa tiene más de 50 empleados. Muestra representativa: ${muestraRepresentativa}`);
        } else {
            console.log(`La empresa tiene ${cantidadEmpleados} empleados.`);
        }

        res.status(200).json({
            success: true,
            data: {
                cantidadEmpleados,
                muestraRepresentativa
            }
        });
    } catch (error) {
        console.error('Error en someFunction:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};