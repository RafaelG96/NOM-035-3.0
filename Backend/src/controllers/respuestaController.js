const mongoose = require('mongoose');
const Respuesta = require('../models/respuesta');
const Empresa = require('../models/empresa');
const calcularPuntaje = require('../utils/calcularPuntajeEntorno');

// Función para determinar nivel de riesgo con el nivel "Nulo" incluido
function determinarNivelRiesgo(puntaje) {
  if (puntaje >= 200) return "Muy alto";
  if (puntaje >= 150) return "Alto";
  if (puntaje >= 100) return "Medio";
  if (puntaje >= 50) return "Bajo";
  return "Nulo";
}

// Función para obtener recomendaciones basadas en el nivel de riesgo
function obtenerRecomendaciones(nivelRiesgo) {
  const recomendaciones = {
    'Muy alto': 'Se requiere realizar el análisis de cada categoría y dominio para establecer las acciones de intervención apropiadas, mediante un Programa de intervención que deberá incluir evaluaciones específicas. Y contemplar campañas de sensibilización, revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión.',
    'Alto': 'Se requiere realizar un análisis de cada categoría y dominio, de manera que se puedan determinar las acciones de intervención apropiadas a través de un Programa de intervención, que podrá incluir una evaluación específica y deberá incluir una campaña de sensibilización, revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión.',
    'Medio': 'Se requiere revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión, mediante un Programa de intervención.',
    'Bajo': 'Es necesario una mayor difusión de la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral.',
    'Nulo': 'El riesgo resulta despreciable por lo que no se requiere medidas adicionales.'
  };
  
  return {
    nivel: nivelRiesgo,
    recomendacion: recomendaciones[nivelRiesgo] || 'No se pudo determinar una recomendación para este nivel de riesgo'
  };
}

// Función para guardar respuesta
const guardarRespuesta = async (req, res) => {
  const { preguntas, servicioClientes, esJefe, empresaId } = req.body;

  // Validación del cuerpo de la solicitud
  if (!preguntas || typeof preguntas !== 'object' || Object.keys(preguntas).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'El objeto de preguntas es requerido y debe contener respuestas'
    });
  }

  try {
    // Validación de empresaId
    if (!empresaId || !mongoose.Types.ObjectId.isValid(empresaId)) {
      return res.status(400).json({ 
        success: false,
        error: 'ID de empresa no válido o faltante' 
      });
    }

    // Verificar que la empresa existe
    const empresaExiste = await Empresa.exists({ _id: empresaId });
    if (!empresaExiste) {
      return res.status(404).json({
        success: false,
        error: 'La empresa especificada no existe'
      });
    }

    // Conversión a booleanos
    const servicioClientesBool = ['true', 'sí', 'si', 'yes', '1'].includes(String(servicioClientes).toLowerCase()) || servicioClientes === true;
    const esJefeBool = ['true', 'sí', 'si', 'yes', '1'].includes(String(esJefe).toLowerCase()) || esJefe === true;

    // Clonar preguntas para no modificar el objeto original
    const preguntasProcesadas = {...preguntas};

    // Eliminar preguntas condicionales no aplicables
    if (!esJefeBool) {
      [69, 70, 71, 72].forEach(p => delete preguntasProcesadas[`pregunta${p}`]);
    }
    
    if (!servicioClientesBool) {
      [65, 66, 67, 68].forEach(p => delete preguntasProcesadas[`pregunta${p}`]);
    }

    // Validar preguntas obligatorias (1-64)
    const preguntasObligatorias = Array.from({length: 64}, (_, i) => `pregunta${i+1}`);
    const faltantes = preguntasObligatorias.filter(p => !(p in preguntasProcesadas));
    
    if (faltantes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Faltan respuestas obligatorias',
        preguntasFaltantes: faltantes.map(p => parseInt(p.replace('pregunta', '')))
      });
    }

    // Calcular puntajes
    const { puntajeTotal, puntajesPorCategoria, puntajesPorDominio, puntajesPorDimension } = 
      calcularPuntaje(preguntasProcesadas, esJefeBool, servicioClientesBool);
    
    // Validación de los cálculos
    if (typeof puntajeTotal !== 'number' || isNaN(puntajeTotal) ||
        !puntajesPorCategoria || typeof puntajesPorCategoria !== 'object' ||
        !puntajesPorDominio || typeof puntajesPorDominio !== 'object' ||
        !puntajesPorDimension || typeof puntajesPorDimension !== 'object') {
      throw new Error('Los resultados del cálculo de puntajes no son válidos');
    }

    // Determinar nivel de riesgo y recomendaciones
    const { nivel, recomendacion } = obtenerRecomendaciones(determinarNivelRiesgo(puntajeTotal));

    // Crear y guardar respuesta
    const nuevaRespuesta = new Respuesta({
      empresaId,
      preguntas: preguntasProcesadas,
      puntajeTotal,
      puntajesPorCategoria,
      puntajesPorDominio,
      puntajesPorDimension,
      servicioClientes: servicioClientesBool,
      esJefe: esJefeBool,
      nivelRiesgo: nivel,
      recomendacion
    });

    await nuevaRespuesta.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: nuevaRespuesta._id,
        puntajeTotal,
        nivelRiesgo: nivel,
        recomendacion,
        categorias: puntajesPorCategoria,
        dominios: puntajesPorDominio,
        dimensiones: puntajesPorDimension,
        esJefe: esJefeBool,
        servicioClientes: servicioClientesBool
      }
    });

  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    
    const errorMap = {
      'ValidationError': { status: 400, message: 'Error de validación de datos' },
      'CastError': { status: 400, message: 'Tipo de dato incorrecto' },
      'MongoError': { status: 500, message: 'Error de base de datos' },
      'default': { status: 500, message: 'Error interno del servidor' }
    };

    const errorInfo = errorMap[error.name] || errorMap.default;
    
    res.status(errorInfo.status).json({
      success: false,
      error: errorInfo.message,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// Función para obtener respuestas por empresa
// Actualiza la función getRespuestasByEmpresa
const getRespuestasByEmpresa = async (req, res) => {
  try {
    const empresaId = req.params.empresaId;
    
    if (!mongoose.Types.ObjectId.isValid(empresaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de empresa no válido'
      });
    }

    // Obtener empresa primero para asegurar que existe
    const empresa = await Empresa.findById(empresaId)
      .select('nombreEmpresa cantidadEmpleados')
      .lean();

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      });
    }

    const respuestas = await Respuesta.find({ empresaId })
      .sort({ createdAt: -1 })
      .lean();

    // Calcular datos resumidos
    const sumaPuntajes = respuestas.reduce((sum, res) => sum + (res.puntajeTotal || 0), 0);
    const puntajePromedio = respuestas.length > 0 ? Math.round(sumaPuntajes / respuestas.length) : 0;
    const ultimaActualizacion = respuestas.length > 0 ? 
      new Date(Math.max(...respuestas.map(r => new Date(r.updatedAt || r.createdAt)))) : 
      null;

    res.json({
      success: true,
      data: {
        empresa, // Incluir toda la información de la empresa
        respuestas,
        resumen: {
          totalEncuestas: respuestas.length,
          puntajePromedio,
          nivelRiesgo: determinarNivelRiesgo(puntajePromedio),
          ultimaActualizacion: ultimaActualizacion?.toISOString() || null
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Función para obtener una respuesta específica
const getRespuestaById = async (req, res) => {
  try {
    const respuestaId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(respuestaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de respuesta no válido'
      });
    }

    const respuesta = await Respuesta.findById(respuestaId)
      .populate('empresaId', 'nombreEmpresa cantidadEmpleados')
      .lean();

    if (!respuesta) {
      return res.status(404).json({
        success: false,
        message: 'Respuesta no encontrada'
      });
    }

    // Obtener recomendación actualizada por si hubo cambios
    const { recomendacion } = obtenerRecomendaciones(respuesta.nivelRiesgo);

    res.json({
      success: true,
      data: {
        id: respuesta._id,
        fecha: respuesta.createdAt,
        puntajeTotal: respuesta.puntajeTotal,
        nivelRiesgo: respuesta.nivelRiesgo,
        recomendacion: respuesta.recomendacion || recomendacion,
        empresa: respuesta.empresaId,
        detalles: {
          categorias: respuesta.puntajesPorCategoria,
          dominios: respuesta.puntajesPorDominio,
          dimensiones: respuesta.puntajesPorDimension
        },
        contexto: {
          esJefe: respuesta.esJefe,
          servicioClientes: respuesta.servicioClientes
        },
        totalPreguntas: Object.keys(respuesta.preguntas).length
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la respuesta',
      error: error.message
    });
  }
};

const obtenerResultadosEntorno = async (req, res) => {
  try {
    const { empresaId } = req.params;

    // Busca las respuestas del formulario largo en la base de datos
    const resultados = await Respuesta.find({ empresaId, tipoFormulario: 'entorno' });

    res.status(200).json({
      success: true,
      data: resultados || [] // Devuelve un arreglo vacío si no hay resultados
    });
  } catch (error) {
    console.error('Error al obtener resultados del formulario largo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resultados del formulario largo'
    });
  }
};

module.exports = {
  guardarRespuesta,
  getRespuestasByEmpresa,
  getRespuestaById,
  determinarNivelRiesgo,
  obtenerRecomendaciones,
  obtenerResultadosEntorno
};