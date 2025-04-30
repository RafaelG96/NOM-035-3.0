const mongoose = require('mongoose');
const Respuesta = require('../models/resultadoPsicosocial');
const calcularPuntaje = require('../utils/calcularPuntajeTrabajo');

// Función para determinar nivel de riesgo (ajustada a tu escala original)
function determinarNivelRiesgo(puntajeTotal) {
  if (puntajeTotal >= 80) return "Muy alto";
  if (puntajeTotal >= 70) return "Alto";
  if (puntajeTotal >= 45) return "Medio";
  if (puntajeTotal >= 20) return "Bajo";
  return "Nulo o despreciable";
}

// Función para guardar respuesta (adaptada a 46 preguntas)
const guardarRespuesta = async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body);

  const { preguntas, servicioClientes, esJefe, empresaId } = req.body;

  // Validación básica
  if (!empresaId || !preguntas || typeof preguntas !== 'object') {
    return res.status(400).json({ 
      success: false,
      error: 'empresaId y preguntas son requeridos' 
    });
  }

  try {
    // Validar preguntas obligatorias (1-40)
    const obligatorias = Array.from({ length: 40 }, (_, i) => `pregunta${i + 1}`);
    const faltantes = obligatorias.filter(p => !(p in preguntas));
    
    if (faltantes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Faltan respuestas obligatorias',
        preguntasFaltantes: faltantes.map(p => parseInt(p.replace('pregunta', '')))
      });
    }

    // Calcular resultados
    const resultado = calcularPuntaje(preguntas, esJefe, servicioClientes);
    
    // Crear registro anónimo
    const nuevaRespuesta = await Respuesta.create({
      empresaId,
      preguntas, // Cambiado de "respuestas" a "preguntas"
      esJefe: Boolean(esJefe),
      servicioClientes: Boolean(servicioClientes),
      puntajeTotal: resultado.puntajeTotal,
      nivelRiesgo: determinarNivelRiesgo(resultado.puntajeTotal),
      categorias: Object.entries(resultado.categorias).map(([nombre, datos]) => ({
        nombre,
        puntaje: datos.puntaje,
        nivel: datos.nivel
      })),
      dominios: Object.entries(resultado.dominios).map(([nombre, datos]) => ({
        nombre,
        puntaje: datos.puntaje,
        nivel: datos.nivel
      })),
      dimensiones: Object.entries(resultado.dimensiones).map(([nombre, datos]) => ({
        nombre,
        puntaje: datos.puntaje,
        nivel: datos.nivel
      })),
      recomendaciones: resultado.recomendaciones
    });

    res.status(201).json({
      success: true,
      data: {
        id: nuevaRespuesta._id,
        puntajeTotal: nuevaRespuesta.puntajeTotal,
        nivelRiesgo: nuevaRespuesta.nivelRiesgo,
        createdAt: nuevaRespuesta.createdAt
      }
    });

  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el cuestionario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener resultados por empresa (sin datos sensibles)
const obtenerResultados = async (req, res) => {
  try {
    const { empresaId } = req.params;

    // Busca las respuestas en la base de datos
    const resultados = await Respuesta.find({ empresaId });

    // Asegúrate de devolver un arreglo, incluso si no hay resultados
    res.status(200).json({
      success: true,
      data: resultados || [] // Devuelve un arreglo vacío si no hay resultados
    });
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resultados'
    });
  }
};

// Obtener estadísticas agregadas
const obtenerEstadisticas = async (req, res) => {
  try {
    const { empresaId } = req.params;
    
    if (!empresaId) {
      return res.status(400).json({
        success: false,
        error: 'empresaId es requerido'
      });
    }

    const stats = await Respuesta.aggregate([
      { $match: { empresaId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          promedioPuntaje: { $avg: '$puntajeTotal' },
          niveles: {
            $push: '$nivelRiesgo'
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          promedioPuntaje: { $round: ['$promedioPuntaje', 2] },
          distribucion: {
            $arrayToObject: {
              $map: {
                input: ['Nulo o despreciable', 'Bajo', 'Medio', 'Alto', 'Muy alto'],
                as: 'nivel',
                in: {
                  k: '$$nivel',
                  v: { $size: { $filter: { input: '$niveles', as: 'n', cond: { $eq: ['$$n', '$$nivel'] } } } }
                }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        promedioPuntaje: 0,
        distribucion: {
          'Nulo o despreciable': 0,
          'Bajo': 0,
          'Medio': 0,
          'Alto': 0,
          'Muy alto': 0
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al calcular estadísticas'
    });
  }
};

module.exports = {
  guardarRespuesta,
  obtenerResultados,
  obtenerEstadisticas,
  determinarNivelRiesgo
};