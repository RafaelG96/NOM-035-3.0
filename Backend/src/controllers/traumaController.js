const TraumaCuestionario = require('../models/traumaModel');

exports.guardarCuestionario = async (req, res) => {
  try {
    const { empresa, respuestas } = req.body;
    
    // Validaciones
    if (!empresa || typeof empresa !== 'string' || empresa.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la empresa es requerido'
      });
    }

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Las respuestas son requeridas'
      });
    }

    // Generar identificador anónimo único
    const identificadorAnonimo = `anon-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Lógica de evaluación (sin cambios)
    const seccionI = respuestas.filter(r => r.pregunta.match(/^q[1-6]$/));
    const seccionII = respuestas.filter(r => r.pregunta.match(/^q[7-8]$/));
    const seccionIII = respuestas.filter(r => r.pregunta.match(/^q(9|1[0-5])$/));
    const seccionIV = respuestas.filter(r => r.pregunta.match(/^q(1[6-9]|20)$/));
    
    const anyYesInSectionI = seccionI.some(r => r.respuesta === 'si');
    const yesInSectionII = seccionII.filter(r => r.respuesta === 'si').length;
    const yesInSectionIII = seccionIII.filter(r => r.respuesta === 'si').length;
    const yesInSectionIV = seccionIV.filter(r => r.respuesta === 'si').length;
    
    let requiereEvaluacion = false;
    const razonesEvaluacion = [];
    
    if (anyYesInSectionI) {
      if (yesInSectionII > 0) {
        requiereEvaluacion = true;
        razonesEvaluacion.push(`Sección II: ${yesInSectionII} respuestas positivas`);
      }
      
      if (yesInSectionIII >= 3) {
        requiereEvaluacion = true;
        razonesEvaluacion.push(`Sección III: ${yesInSectionIII} respuestas positivas`);
      }
      
      if (yesInSectionIV >= 2) {
        requiereEvaluacion = true;
        razonesEvaluacion.push(`Sección IV: ${yesInSectionIV} respuestas positivas`);
      }
    }

    const cuestionario = new TraumaCuestionario({
      empresa: empresa.trim(),
      respuestas,
      requiereEvaluacion,
      razonesEvaluacion,
      identificadorAnonimo
    });

    await cuestionario.save();

    res.status(201).json({
      success: true,
      identificadorAnonimo: cuestionario.identificadorAnonimo,
      requiereEvaluacion: cuestionario.requiereEvaluacion,
      razonesEvaluacion: cuestionario.razonesEvaluacion,
      empresa: cuestionario.empresa,
      cuestionarioId: cuestionario._id
    });

  } catch (error) {
    console.error('Error al guardar cuestionario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el cuestionario'
    });
  }
};

exports.obtenerResultados = async (req, res) => {
  try {
    const { empresa, identificadorAnonimo, requiereEvaluacion, fechaInicio, fechaFin } = req.query;
    
    const query = {};
    if (empresa) query.empresa = new RegExp(empresa, 'i'); // Búsqueda case-insensitive
    if (identificadorAnonimo) query.identificadorAnonimo = identificadorAnonimo;
    if (requiereEvaluacion) query.requiereEvaluacion = requiereEvaluacion === 'true';
    if (fechaInicio && fechaFin) {
      query.createdAt = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    const resultados = await TraumaCuestionario.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: resultados
    });

  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resultados'
    });
  }
};

exports.obtenerEmpresas = async (req, res) => {
  try {
    // Obtener empresas únicas del campo "empresa"
    const empresas = await TraumaCuestionario.distinct('empresa');
    res.status(200).json({
      success: true,
      data: empresas
    });
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener empresas'
    });
  }
};