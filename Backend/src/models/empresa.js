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
    muestraRepresentativa: {
        type: Number,
        required: function() {
            return this.cantidadEmpleados > 50;
        }
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
    }
}, {
    timestamps: true
});

// Validación adicional para empresas grandes
empresaSchema.pre('save', function(next) {
    if (this.cantidadEmpleados > 50 && !this.muestraRepresentativa) {
        const err = new Error('Empresas con más de 50 empleados requieren muestra representativa');
        next(err);
    } else {
        this.tipoFormulario = this.cantidadEmpleados > 50 ? 'completo' : 'basico';
        next();
    }
});

const Empresa = mongoose.model('Empresa', empresaSchema);

module.exports = Empresa;