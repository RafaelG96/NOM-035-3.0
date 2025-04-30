const mongoose = require('mongoose');

const ResultadoSchema = new mongoose.Schema({
  empresaId: {
    type: String,
    required: true
  },
  preguntas: { // Cambiado de "respuestas" a "preguntas"
    type: Object,
    required: true,
    validate: {
      validator: (r) => Object.keys(r).length >= 40,
      message: 'Debe incluir respuestas a las 40 preguntas obligatorias'
    }
  },
  esJefe: Boolean,
  servicioClientes: Boolean,
  puntajeTotal: {
    type: Number,
    required: true,
    min: 0
  },
  nivelRiesgo: {
    type: String,
    required: true,
    enum: ['Nulo o despreciable', 'Bajo', 'Medio', 'Alto', 'Muy alto']
  },
  categorias: {
    type: Array, 
    required: true
  },
  dominios: {
    type: Array, 
    required: true
  },
  dimensiones: {
    type: Array, 
    required: true
  },
  recomendaciones: String
}, {
  timestamps: true,
  versionKey: false,
  minimize: false
});

ResultadoSchema.index({ empresaId: 1, nivelRiesgo: 1 });

module.exports = mongoose.model('ResultadoPsicosocial', ResultadoSchema);