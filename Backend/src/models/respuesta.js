const mongoose = require('mongoose');

const RespuestaSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: [true, 'El ID de la empresa es requerido'],
  },
  preguntas: {
    type: Object,
    required: [true, 'Las respuestas a las preguntas son requeridas'],
    validate: {
      validator: (preguntas) => Object.keys(preguntas).length > 0,
      message: 'Debe haber al menos una pregunta respondida'
    }
  },
  puntajeTotal: {
    type: Number,
    required: true,
    min: [0, 'El puntaje total no puede ser negativo']
  },
  puntajesPorCategoria: {
    type: Object,
    required: true,
    validate: {
      validator: (categorias) => Object.keys(categorias).length > 0,
      message: 'Debe haber al menos una categoría calculada'
    }
  },
  puntajesPorDominio: {
    type: Object,
    required: true,
    validate: {
      validator: (dominios) => Object.keys(dominios).length > 0,
      message: 'Debe haber al menos un dominio calculado'
    }
  },
  puntajesPorDimension: {
    type: Object,
    required: true,
    validate: {
      validator: (dimensiones) => Object.keys(dimensiones).length > 0,
      message: 'Debe haber al menos una dimensión calculada'
    }
  },
  servicioClientes: {
    type: Boolean,
    default: false,
    set: v => {
      if (typeof v === 'string') {
        return v === 'true' || v === 'Sí';
      }
      return Boolean(v);
    }
  },
  esJefe: {
    type: Boolean,
    default: false,
    set: v => {
      if (typeof v === 'string') {
        return v === 'true' || v === 'Sí';
      }
      return Boolean(v);
    }
  },
  nivelRiesgo: {
    type: String,
    enum: ['Nulo','Bajo', 'Medio', 'Alto', 'Muy alto'],
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice para mejorar búsquedas por empresa
RespuestaSchema.index({ empresaId: 1 });

module.exports = mongoose.model('Respuesta', RespuestaSchema);