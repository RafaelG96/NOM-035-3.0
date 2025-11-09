const Empresa = require('../models/empresa');

// Middleware para verificar acceso a resultados basado en nombre de empresa y código
const verificarAccesoResultados = async (req, res, next) => {
    try {
        // Obtener credenciales del header o del body
        const nombreEmpresa = (req.headers['x-empresa-nombre'] || req.body.nombreEmpresa || '').trim();
        const codigoAccesoResultados = (req.headers['x-codigo-acceso'] || req.body.codigoAccesoResultados || '').trim();

        if (!nombreEmpresa || !codigoAccesoResultados) {
            return res.status(401).json({
                success: false,
                message: 'Se requiere autenticación para acceder a los resultados. Proporcione nombre de empresa y código de acceso.'
            });
        }

        const codigoNormalizado = codigoAccesoResultados.toUpperCase();
        // Buscar empresa con las credenciales proporcionadas
        const empresa = await Empresa.findOne({
            nombreEmpresa: { $regex: new RegExp(`^${escapeRegex(nombreEmpresa)}$`, 'i') }
        });

        if (!empresa || String(empresa.codigoAccesoResultados || '').toUpperCase() !== codigoNormalizado) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas. Verifique el nombre de la empresa y el código de acceso.'
            });
        }

        // Agregar información de la empresa autenticada a la petición
        req.empresaAutenticada = {
            empresaId: empresa._id,
            nombreEmpresa: empresa.nombreEmpresa
        };

        next();
    } catch (error) {
        console.error('Error en verificarAccesoResultados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar credenciales',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware para verificar acceso basado en empresaId (para rutas que ya tienen empresaId)
const verificarAccesoPorEmpresaId = async (req, res, next) => {
    try {
        const empresaId = req.params.empresaId || req.query.empresaId;
        
        // Express normaliza headers a minúsculas, pero también verificar variaciones
        const nombreEmpresa = (req.headers['x-empresa-nombre'] || 
                             req.headers['X-Empresa-Nombre'] || 
                             req.body.nombreEmpresa || '').trim();
        const codigoAccesoResultados = (req.headers['x-codigo-acceso'] || 
                                      req.headers['X-Codigo-Acceso'] || 
                                      req.body.codigoAccesoResultados || '').trim();

        // Log para depuración
        console.log('Verificando acceso a resultados:', {
            empresaId,
            headersRecibidos: {
                'x-empresa-nombre': req.headers['x-empresa-nombre'],
                'x-codigo-acceso': req.headers['x-codigo-acceso'],
                'X-Empresa-Nombre': req.headers['X-Empresa-Nombre'],
                'X-Codigo-Acceso': req.headers['X-Codigo-Acceso']
            },
            nombreEmpresa,
            codigoAccesoResultados
        });

        if (!empresaId) {
            console.log('Error: ID de empresa no proporcionado');
            return res.status(400).json({
                success: false,
                message: 'ID de empresa requerido'
            });
        }

        if (!nombreEmpresa || !codigoAccesoResultados) {
            console.log('Error: Credenciales faltantes', {
                tieneNombreEmpresa: !!nombreEmpresa,
                tieneCodigoAcceso: !!codigoAccesoResultados
            });
            return res.status(401).json({
                success: false,
                message: 'Se requiere autenticación para acceder a los resultados. Verifique que las credenciales se estén enviando correctamente.'
            });
        }

        // Buscar empresa y verificar que coincida con el ID
        const codigoNormalizado = codigoAccesoResultados.toUpperCase();
        const empresa = await Empresa.findOne({
            _id: empresaId,
            nombreEmpresa: { $regex: new RegExp(`^${escapeRegex(nombreEmpresa)}$`, 'i') }
        });

        if (!empresa || String(empresa.codigoAccesoResultados || '').toUpperCase() !== codigoNormalizado) {
            console.log('Error: Empresa no encontrada o credenciales no coinciden', {
                empresaId,
                nombreEmpresa,
                codigoAccesoResultados
            });
            
            // Buscar si existe la empresa con ese ID pero credenciales diferentes
            const empresaPorId = await Empresa.findById(empresaId);
            if (empresaPorId) {
                console.log('Advertencia: La empresa existe pero las credenciales no coinciden');
            }
            
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a los resultados de esta empresa. Verifique el nombre de la empresa y el código de acceso.'
            });
        }

        console.log('Acceso autorizado para empresa:', empresa.nombreEmpresa);

        req.empresaAutenticada = {
            empresaId: empresa._id,
            nombreEmpresa: empresa.nombreEmpresa
        };

        next();
    } catch (error) {
        console.error('Error en verificarAccesoPorEmpresaId:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar permisos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    verificarAccesoResultados,
    verificarAccesoPorEmpresaId
};

function escapeRegex(value = '') {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

