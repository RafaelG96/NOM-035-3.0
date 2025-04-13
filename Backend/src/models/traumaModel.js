const mongoose = require('mongoose');

const traumaRespuestaSchema = new mongoose.Schema({
  pregunta: { 
    type: String, 
    required: true
  },
  respuesta: { 
    type: String, 
    enum: ['si', 'no'], 
    required: true
  }
}, { 
  _id: false
});

const traumaCuestionarioSchema = new mongoose.Schema({
  empresa: {
    type: String,
    required: true,
    trim: true
  },
  respuestas: [traumaRespuestaSchema],
  requiereEvaluacion: { type: Boolean, required: true },
  razonesEvaluacion: [String],
  identificadorAnonimo: { 
    type: String, 
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Índices
traumaCuestionarioSchema.index({ createdAt: -1 });
traumaCuestionarioSchema.index({ requiereEvaluacion: 1 });
traumaCuestionarioSchema.index({ empresa: 1 }); // Nuevo índice para búsquedas por empresa

module.exports = mongoose.model('TraumaCuestionario', traumaCuestionarioSchema);