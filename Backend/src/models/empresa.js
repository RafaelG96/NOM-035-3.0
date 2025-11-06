const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    nombreEmpresa: {
        type: String,
        required: [true, 'El nombre de la empresa es requerido'],
        trim: true
    },
    cantidadEmpleados: {
        type: Number,
        required: [true, 'La cantidad de empleados es requerida'],
        min: [1, 'La cantidad de empleados debe ser al menos 1']
    },
    clave: {
        type: String,
        required: [true, 'La clave es requerida'],
        trim: true
    },
    codigoAccesoResultados: {
        type: String,
        required: [true, 'El código de acceso a resultados es requerido'],
        trim: true
    },
    muestraRepresentativa: {
        type: Number,
        required: function() {
            return this.cantidadEmpleados > 50;
        },
        min: [1, 'La muestra representativa debe ser al menos 1'],
        max: [1000, 'La muestra representativa no puede exceder 1000']
    },
    contador: {
        type: Number,
        default: 0,
        min: 0
    },
    tipoFormulario: {
        type: String,
        enum: ['basico', 'completo'],
        default: 'basico'
    },
    preguntasRequeridas: {
        type: [Number],
        default: function() {
            return this.tipoFormulario === 'completo' ? 
                Array.from({length: 76}, (_, i) => i + 1) : // 76 preguntas para completo
                Array.from({length: 46}, (_, i) => i + 1);  // 46 preguntas para básico
        }
    }
}, {
    timestamps: true
});

// Validación adicional para empresas grandes
empresaSchema.pre('save', function(next) {
    if (this.cantidadEmpleados > 50) {
        if (!this.muestraRepresentativa) {
            const err = new Error('Empresas con más de 50 empleados requieren muestra representativa');
            return next(err);
        }
        this.tipoFormulario = 'completo';
    } else {
        this.tipoFormulario = 'basico';
        this.muestraRepresentativa = undefined; // Limpiar si existiera
    }
    
    // Actualizar preguntas requeridas según el tipo
    this.preguntasRequeridas = this.tipoFormulario === 'completo' ? 
        Array.from({length: 76}, (_, i) => i + 1) : 
        Array.from({length: 46}, (_, i) => i + 1);
    
    next();
});

const Empresa = mongoose.model('Empresa', empresaSchema);

module.exports = Empresa;